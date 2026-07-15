/* eslint-disable no-underscore-dangle */
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  Autocomplete,
  Box,
  CircularProgress,
  Grid, Stack, Tab, Tabs, Typography, useMediaQuery,
} from '@mui/material';
import shpjs from 'shpjs';
import axios from 'axios';
import { bbox } from '@turf/turf';
import {
  PSATextField, PSAButton, PSARadioButton, PSAReduxMap,
} from 'shared-react-components/src';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { get } from '../../store/redux-autosetters';
import { mapboxToken } from '../../utils/keys';
import { privateApi } from '../../utils/apiClient';
import { handleError } from '../../utils/apiError';
import { isValidGeoJSON, toFeatureCollection } from '../../utils/geojsonUtils';
import { fitAndWaitForIdle, extractLegend } from '../../utils/mapCaptureUtils';
import { downloadGeojsonZip } from '../../utils/downloadUtils';
import buildPdfReportHtml from '../../utils/pdfUtils';
import FieldDropdown from '../../shared/FieldDropdown/FieldDropdown';

// Maps each route to a tab index so the Tabs component stays in sync with the URL
const PATH_TO_TAB = {
  '/field': 0,
  '/editfield': 1,
  '/viewfield': 2,
  '/appliedmaps': 3,
};

const APPLIED_RATE_COLORS = ['#762a83', '#af8dc3', '#e7d4e8', '#d9f0d3', '#7fbf7b', '#1b7837'];

const PDF_BASE_URL = 'https://pdf.covercrop-data.org/api';

const AppliedMaps = () => {
  const { user } = useAuth0();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const currentTab = PATH_TO_TAB[location.pathname] ?? 0;

  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  // Roles are assigned in auth0 and included in the user's ID token. They are the 'groups' that the user has access to.
  const roles = user?.['https://dst-ncalc.org/claims'] || [];
  const isAdmin = roles.includes('ncalc-admin');
  const isSuperAdmin = roles.includes('ncalc-super-admin');

  const selectedField = useSelector(get.selectedField);

  // ADDITIONAL METADATA
  const [additionalMetadata, setAdditionalMetadata] = useState(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  // LATEST SAVED PRESCRIPTION
  const [latestPrescription, setLatestPrescription] = useState(null);
  const [loadingPrescription, setLoadingPrescription] = useState(false);

  // UPLOADED APPLIED-RATE MAP VARIABLES
  const [appliedMap, setAppliedMap] = useState(null);
  const [appliedMapFileName, setAppliedMapFileName] = useState('');
  const [appliedRateColumn, setAppliedRateColumn] = useState(null);

  const mapInstanceRef = useRef(null);
  const [mapLayer, setMapLayer] = useState('applied');

  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const prescriptionGeojson = latestPrescription?.geojson ?? null;

  // Prefer the displayed layer's extent; fall back to the selected field's geometry
  const mapBounds = useMemo(() => {
    try {
      if (mapLayer === 'prescription' && prescriptionGeojson?.features?.length) {
        return bbox(prescriptionGeojson);
      }
      if (mapLayer === 'applied' && appliedMap?.features?.length) return bbox(appliedMap);
      if (selectedField?.geometry) return bbox(selectedField.geometry);
    } catch (e) {
      return null;
    }
    return null;
  }, [mapLayer, prescriptionGeojson, appliedMap, selectedField]);

  // Center the map on the current bounds (fallback to the continental US)
  const mapCenter = useMemo(() => {
    if (!mapBounds) return [39.30278019, -75.96388974];
    return [(mapBounds[1] + mapBounds[3]) / 2, (mapBounds[0] + mapBounds[2]) / 2];
  }, [mapBounds]);

  // Convert the applied rate to kg N/ha
  const rateMultiplier = useMemo(() => {
    const fertilizer = additionalMetadata?.fertilizer;
    if (!fertilizer) return 1;

    const nPercent = (fertilizer.n_percent || 0) / 100;
    if (fertilizer.type === 'liquid') {
      return (fertilizer.density || 0) * nPercent;
    }
    return nPercent;
  }, [additionalMetadata]);

  // Applied map with an 'applied_N_rate column' added: the selected rate column scaled by the fertilizer multiplier.
  const displayedMap = useMemo(() => {
    if (!appliedMap?.features?.length || !appliedRateColumn) {
      return appliedMap;
    }

    return {
      type: 'FeatureCollection',
      features: appliedMap.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          applied_N_rate:
            (parseFloat(feature.properties?.[appliedRateColumn]) || 0) * rateMultiplier,
        },
      })),
    };
  }, [appliedMap, appliedRateColumn, rateMultiplier]);

  // Raster props for the displayed layer - initRasterObject, valueKey, unit
  const initRasterObject = useMemo(() => {
    if (mapLayer === 'prescription') return prescriptionGeojson;
    return appliedRateColumn ? displayedMap : null;
  }, [mapLayer, prescriptionGeojson, appliedRateColumn, displayedMap]);

  const valueKey = mapLayer === 'prescription' ? 'ReqN' : 'applied_N_rate';

  const unit = useMemo(() => {
    if (mapLayer === 'prescription') return 'lb of N/ac';
    return rateMultiplier !== 1 ? 'lb N/ac' : 'Applied Rate';
  }, [mapLayer, rateMultiplier]);

  // Numeric-friendly columns in the uploaded features' properties to display in the dropdown
  const appliedRateColumns = useMemo(() => {
    if (!appliedMap?.features?.length) return [];
    const keys = new Set();
    appliedMap.features.forEach((feature) => {
      Object.keys(feature.properties || {}).forEach((key) => keys.add(key));
    });
    return [...keys].sort();
  }, [appliedMap]);

  const loadAppliedMap = useCallback((geojson, fileName) => {
    if (!isValidGeoJSON(geojson)) {
      handleError(null, dispatch, 'Invalid GeoJSON structure.');
      return;
    }
    const featureCollection = toFeatureCollection(geojson);
    if (!featureCollection.features.length) {
      handleError(null, dispatch, 'No features found in the uploaded file.');
      return;
    }
    setAppliedMap(featureCollection);
    setAppliedMapFileName(fileName);
    setAppliedRateColumn(null);
  }, [dispatch]);

  // TODO: make this is util func - also used for uploading field boundaries
  const handleAppliedMapUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();

    setAppliedMap(null);
    setAppliedMapFileName('');
    setAppliedRateColumn(null);

    if (['geojson', 'json'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          loadAppliedMap(JSON.parse(reader.result), file.name);
        } catch (err) {
          handleError(err, dispatch, 'Error parsing GeoJSON file.');
        }
      };
      reader.readAsText(file);
    } else if (['shp', 'zip'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const geojson = await shpjs(reader.result);
          loadAppliedMap(geojson, file.name);
        } catch (err) {
          handleError(err, dispatch, 'Error parsing Shapefile. Please ensure it is a valid .zip containing .shp, .shx, and .dbf files.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      handleError(null, dispatch, 'Unsupported file type. Please upload .geojson or .shp');
    }

    // Reset so re-selecting the same file still triggers onChange
    e.target.value = '';
  };

  // Fetch additional metadata whenever a field is selected
  const fetchAdditionalMetadata = useCallback(async (fieldId) => {
    try {
      setLoadingMetadata(true);
      const response = await privateApi.get(`/additional-metadata/${fieldId}`);
      setAdditionalMetadata(response?.data?.data ?? null);
    } catch (error) {
      handleError(error, dispatch);
      setAdditionalMetadata(null);
    } finally {
      setLoadingMetadata(false);
    }
  }, [dispatch]);

  // Fetch the most recently saved prescription whenever a field is selected
  const fetchLatestPrescription = useCallback(async (fieldId) => {
    try {
      setLoadingPrescription(true);
      const response = await privateApi.get('/geojson-files', {
        params: { field_id: fieldId, file_type: 'prescription' },
      });
      setLatestPrescription(response?.data?.data ?? null);
    } catch (error) {
      handleError(error, dispatch);
      setLatestPrescription(null);
    } finally {
      setLoadingPrescription(false);
    }
  }, [dispatch]);

  useEffect(() => {
    setAppliedMap(null);
    setAppliedMapFileName('');
    setAppliedRateColumn(null);

    const fieldId = selectedField?._id;
    if (fieldId) {
      fetchAdditionalMetadata(fieldId);
      fetchLatestPrescription(fieldId);
    } else {
      setAdditionalMetadata(null);
      setLatestPrescription(null);
    }
  }, [selectedField, fetchAdditionalMetadata, fetchLatestPrescription]);

  // Exports need both maps: an uploaded applied map and a saved prescription for the field
  const exportReady = Boolean(
    appliedMap?.features?.length && appliedRateColumn && prescriptionGeojson?.features?.length,
  );

  // Capture each available map layer as an image and export them as a PDF report
  const handleExportPdf = async () => {
    const mapInstance = mapInstanceRef.current;
    if (!mapInstance || isPdfLoading) return;

    const layers = [
      ...(appliedRateColumn && displayedMap?.features?.length
        ? [{ value: 'applied', label: 'Applied Fertilizer', geojson: displayedMap }]
        : []),
      ...(prescriptionGeojson?.features?.length
        ? [{ value: 'prescription', label: 'Prescription', geojson: prescriptionGeojson }]
        : []),
    ];

    if (!layers.length) {
      handleError(null, dispatch, 'Nothing to export. Upload an applied map or select a field with a saved prescription.');
      return;
    }

    setIsPdfLoading(true);
    const previousLayer = mapLayer;
    try {
      // TODO: make this is util func - also used in NitrogenMapWidget
      const mapCaptures = await layers.reduce(async (prevPromise, { value, label, geojson }) => {
        const captures = await prevPromise;

        setMapLayer(value);
        await new Promise((resolve) => { setTimeout(resolve, 200); });
        mapInstance.triggerRepaint();
        await fitAndWaitForIdle(mapInstance, bbox(geojson));

        const mapImage = mapInstance.getCanvas().toDataURL('image/png');
        // RasterLegend is rendered outside the map div, hence `parentElement` to access it
        const { legendTitle, legendItems } = extractLegend(mapInstance.getContainer().parentElement);

        return [...captures, {
          label, mapImage, legendItems, legendTitle,
        }];
      }, Promise.resolve([]));

      const fieldName = selectedField?.properties?.fieldName ?? 'Field';
      const fertilizer = additionalMetadata?.fertilizer;

      // Min/max/average of the converted applied_N_rate column
      const rateValues = (displayedMap?.features ?? [])
        .map((feature) => feature.properties?.applied_N_rate)
        .filter((value) => Number.isFinite(value) && value > 0);
      const rateUnit = rateMultiplier !== 1 ? ' lb N/ac' : '';
      const rateStats = rateValues.length
        ? {
          'Min Applied Rate': { value: `${Math.min(...rateValues).toFixed(2)}${rateUnit}` },
          'Max Applied Rate': { value: `${Math.max(...rateValues).toFixed(2)}${rateUnit}` },
          'Avg Applied Rate': {
            value: `${(rateValues.reduce((sum, value) => sum + value, 0) / rateValues.length).toFixed(2)}${rateUnit}`,
          },
        }
        : {};

      const summaryData = {
        Field: { value: fieldName },
        ...(additionalMetadata?.sidedress_fertilization_date
          ? { 'Sidedress Date': { value: additionalMetadata.sidedress_fertilization_date } }
          : {}),
        ...(fertilizer?.name ? { Fertilizer: { value: fertilizer.name } } : {}),
        ...(fertilizer?.n_percent ? { 'Nitrogen Content': { value: `${fertilizer.n_percent}%` } } : {}),
        ...(appliedRateColumn ? { 'Applied Rate Column': { value: appliedRateColumn } } : {}),
        ...rateStats,
      };

      const html = buildPdfReportHtml({
        pdfTitle: 'Applied Fertilizer Maps', fieldName, mapCaptures, summaryData,
      });
      const { data } = await axios.post(`${PDF_BASE_URL}/generate-pdf`, { html, filename: `applied-fertilizer-${fieldName}.pdf` });
      window.open(data.fileUrl, '_blank');
    } catch (error) {
      handleError(error, dispatch, '', 'There was an error while generating the PDF.');
    } finally {
      setMapLayer(previousLayer);
      setIsPdfLoading(false);
    }
  };

  // Save the applied map with converted units and the saved prescription into a zip
  const handleDownloadZip = async () => {
    const files = [
      ...(displayedMap?.features?.length
        ? [{ name: 'applied_map.geojson', geojson: displayedMap }]
        : []),
      ...(latestPrescription?.geojson?.features?.length
        ? [{ name: 'prescription.geojson', geojson: latestPrescription.geojson }]
        : []),
    ];

    if (!files.length) {
      handleError(null, dispatch, 'Nothing to download. Upload an applied map or select a field with a saved prescription.');
      return;
    }

    try {
      const fieldName = selectedField?.properties?.fieldName ?? 'field';
      await downloadGeojsonZip(files, `${fieldName}-maps.zip`);
    } catch (error) {
      handleError(error, dispatch, '', 'There was an error creating the zip file.');
    }
  };

  return (
    <Grid container justifyContent="center">
      <Grid
        item
        xs={12}
        md={10}
        sx={{
          position: 'relative',
          marginTop: '1rem',
          padding: `2rem ${matchesMd ? '1rem' : '4rem'}`,
          paddingTop: '1rem',
          boxShadow: 5,
          borderRadius: 5,
          opacity: 0.9,
          backgroundColor: 'white',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newTab) => {
              navigate(Object.keys(PATH_TO_TAB)[newTab]);
            }}
            centered
            textColor="inherit"
            sx={{
              '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '0.95rem' },
              '& .Mui-selected': { color: '#60802D' },
              '& .MuiTabs-indicator': { backgroundColor: '#60802D' },
            }}
          >
            <Tab label="Create Field" />
            <Tab label="Edit Field" />
            <Tab label="View Field" />
            {(isSuperAdmin || isAdmin) ? <Tab label="View Applied Maps" /> : null}
          </Tabs>
        </Box>

        <Typography variant="h4" align="center" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
          View Applied Maps
        </Typography>

        <FieldDropdown />

        <Stack spacing="2rem" sx={{ mt: 2 }}>
          {selectedField && loadingMetadata && (
            <Box display="flex" justifyContent="center">
              <CircularProgress size={24} />
            </Box>
          )}
          {selectedField && !loadingMetadata && !additionalMetadata && (
            <Typography align="center" color="textSecondary">
              No additional metadata found for this field.
            </Typography>
          )}

          {/* UPLOAD AN APPLIED-RATE MAP AND PICK THE COLUMN THAT HOLDS THE RATE */}
          <Stack spacing={2}>
            <Typography variant="inputLabel" sx={{ fontWeight: 'bold' }}>Upload Applied Rate Map</Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} gap={1} justifyContent="space-between">
              <Typography variant="body1" color="text.secondary" alignContent="center">
                {' '}
                {appliedMapFileName ? `Selected file: ${appliedMapFileName}` : 'No file selected'}
                {' '}
              </Typography>
              <input
                id="applied-map-input"
                type="file"
                hidden
                accept=".geojson,.json,.shp,.zip"
                onChange={handleAppliedMapUpload}
              />
              <PSAButton
                title="Upload Shapefile / GeoJSON"
                variant="contained"
                onClick={() => document.getElementById('applied-map-input').click()}
                sx={{
                  minWidth: '150px',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '2rem',
                }}
              />
            </Stack>

            {appliedMap && (
              <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                <Autocomplete
                  options={appliedRateColumns}
                  value={appliedRateColumn}
                  onChange={(e, val) => setAppliedRateColumn(val)}
                  renderInput={(params) => (
                    <PSATextField {...params} label="Select the Applied Rate column" required />
                  )}
                />
              </Box>
            )}
          </Stack>

          <Stack gap={2} alignItems="center">
            <PSARadioButton
              options={[
                { label: 'Applied Map', value: 'applied' },
                { label: 'Prescription', value: 'prescription' },
              ]}
              selectedValue={mapLayer}
              onChange={(value) => setMapLayer(value)}
              row
            />

            {mapLayer === 'prescription' && !loadingPrescription && !prescriptionGeojson && (
              <Typography color="textSecondary">
                No saved prescription found for this field.
              </Typography>
            )}

            <PSAReduxMap
              key={`${selectedField?._id}-${appliedMapFileName}-${appliedRateColumn}`}
              setMap={(mapInstance) => { mapInstanceRef.current = mapInstance; }}
              initWidth="100%"
              initHeight="380px"
              initLat={mapCenter[0]}
              initLon={mapCenter[1]}
              initBounds={mapBounds}
              hasSearchBar
              hasNavigation
              hasFullScreen
              scrollZoom
              dragPan
              keyboard
              doubleClickZoom={false}
              touchZoomRotate
              initRasterObject={initRasterObject}
              valueKey={valueKey}
              rasterColors={APPLIED_RATE_COLORS}
              color_steps={7}
              unit={unit}
              material={mapLayer === 'prescription' ? 'prescription' : 'appliedRate'}
              scaleType={mapLayer === 'applied' ? 'quantile' : 'linear'}
              mapboxToken={mapboxToken}
            />
          </Stack>

          <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 2 }}>
            <PSAButton
              title={isPdfLoading ? 'Generating PDF...' : 'Export as PDF'}
              variant="contained"
              onClick={handleExportPdf}
              disabled={isPdfLoading || !exportReady}
              sx={{
                minWidth: '150px',
                padding: '0.8rem 1.5rem',
                borderRadius: '2rem',
              }}
            />
            <PSAButton
              title="Download Zip"
              variant="contained"
              onClick={handleDownloadZip}
              disabled={!exportReady}
              sx={{
                minWidth: '150px',
                padding: '0.8rem 1.5rem',
                borderRadius: '2rem',
              }}
            />
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default AppliedMaps;
