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
  PSATextField, PSAButton, PSARadioButton, PSAReduxMap, PSASlider,
} from 'shared-react-components/src';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { get, set } from '../../store/redux-autosetters';
import { mapboxToken } from '../../utils/keys';
import { privateApi } from '../../utils/apiClient';
import { handleError } from '../../utils/apiError';
import { isValidGeoJSON, toFeatureCollection } from '../../utils/geojsonUtils';
import { fitAndWaitForIdle, extractLegend } from '../../utils/mapCaptureUtils';
import { downloadGeojsonZip } from '../../utils/downloadUtils';
import buildPdfReportHtml from '../../utils/pdfUtils';
import {
  APPLIED_MAPS_ROLES, SWATH_ANALYSIS_ROLES, getRoles, hasAccess, isUserSuperAdmin,
} from '../../utils/roles';
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

const IMAGERY_API_URL = 'https://developapi.covercrop-imagery.org';

// Fetch one stored map's GeoJSON.
// Returns null if the map is absent or the request fails.
const fetchStoredMapGeojson = async (fieldId, mapType) => {
  try {
    const res = await privateApi.get(`/application-maps/${fieldId}/${mapType}`);
    return res?.data ?? null;
  } catch (error) {
    return null;
  }
};

const AppliedMaps = () => {
  const { user } = useAuth0();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const currentTab = PATH_TO_TAB[location.pathname] ?? 0;

  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const roles = getRoles(user);
  const showAppliedMaps = hasAccess(roles, APPLIED_MAPS_ROLES);
  // Swath sections are only for data analysts and super-admins.
  const canViewSwaths = isUserSuperAdmin(roles)
    || SWATH_ANALYSIS_ROLES.some((r) => roles.includes(r));

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

  // UPLOADED YIELD MAP VARIABLES
  const [yieldMap, setYieldMap] = useState(null);
  const [yieldMapFileName, setYieldMapFileName] = useState('');
  const [yieldColumn, setYieldColumn] = useState(null);

  // SWATH POLYGONS (returned by /swaths-to-cells alongside the aggregated cells)
  const [swathMap, setSwathMap] = useState(null);
  const [loadingSwath, setLoadingSwath] = useState(false);
  const [swathError, setSwathError] = useState('');

  // AGGREGATE SWATH (swaths aggregated into prescription cells via /swaths-to-cells)
  const [aggregateSwathMap, setAggregateSwathMap] = useState(null);
  const [loadingAggregateSwath, setLoadingAggregateSwath] = useState(false);
  const [aggregateSwathError, setAggregateSwathError] = useState('');

  // Previously saved application-map document for the selected field.
  const [existingApplicationMap, setExistingApplicationMap] = useState(null);
  const [loadingApplicationMap, setLoadingApplicationMap] = useState(false);
  const [isSavingApplicationMap, setIsSavingApplicationMap] = useState(false);

  // Percent of data trimmed from each end of 'applied_N_rate' for as applied map display
  const [asAppliedTrimPercent, setAsAppliedTrimPercent] = useState(5);
  // Percent of data trimmed from each end of `yieldColumn` for yield map display
  const [yieldTrimPercent, setYieldTrimPercent] = useState(5);

  const [useOnlyCenteredSwaths, setUseOnlyCenteredSwaths] = useState(false);
  const [removeSwathIntersection, setRemoveSwathIntersection] = useState(false);
  const [boundThreshold, setBoundThreshold] = useState('');

  const mapInstanceRef = useRef(null);
  const [mapLayer, setMapLayer] = useState('applied');

  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const prescriptionGeojson = latestPrescription?.geojson ?? null;

  // Prefer the field geometry (stable across layers); fall back to whatever data we have.
  const mapBounds = useMemo(() => {
    try {
      if (selectedField?.geometry) return bbox(selectedField.geometry);
      if (appliedMap?.features?.length) return bbox(appliedMap);
      if (prescriptionGeojson?.features?.length) return bbox(prescriptionGeojson);
      if (swathMap?.features?.length) return bbox(swathMap);
      if (yieldMap?.features?.length) return bbox(yieldMap);
    } catch (e) {
      return null;
    }
    return null;
  }, [prescriptionGeojson, swathMap, appliedMap, yieldMap, selectedField]);

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

  // Add an 'applied_N_rate' column: the selected rate column scaled by the fertilizer multiplier.
  const applyAppliedRate = useCallback((featureCollection) => {
    if (!featureCollection?.features?.length || !appliedRateColumn) {
      return featureCollection;
    }

    return {
      type: 'FeatureCollection',
      features: featureCollection.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          applied_N_rate:
            (parseFloat(feature.properties?.[appliedRateColumn]) || 0) * rateMultiplier,
        },
      })),
    };
  }, [appliedRateColumn, rateMultiplier]);

  // Drop features outside the trimPercent-th percentile of applied_N_rate from each end
  // Only for visualization and pdf. Export (GeoJSON zip) preserves the full dataset.
  const trimByAppliedRate = useCallback((featureCollection) => {
    const features = featureCollection?.features;
    if (!features?.length || !appliedRateColumn) return featureCollection;

    const trimFraction = Math.min(Math.max(Number(asAppliedTrimPercent) || 0, 0), 49) / 100;
    if (trimFraction === 0) return featureCollection;

    const values = features
      .map((feature) => feature.properties?.applied_N_rate)
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);
    if (!values.length) return featureCollection;

    const lower = values[Math.floor(values.length * trimFraction)];
    const upper = values[Math.ceil(values.length * (1 - trimFraction)) - 1];

    return {
      type: 'FeatureCollection',
      features: features.filter((feature) => {
        const value = feature.properties?.applied_N_rate;
        return Number.isFinite(value) && value >= lower && value <= upper;
      }),
    };
  }, [appliedRateColumn, asAppliedTrimPercent]);

  // Applied map, converted to lb N/ac and outlier-trimmed for display
  const displayedMap = useMemo(
    () => applyAppliedRate(appliedMap),
    [applyAppliedRate, appliedMap],
  );
  const trimmedMap = useMemo(
    () => trimByAppliedRate(displayedMap),
    [trimByAppliedRate, displayedMap],
  );

  // Swath polygons (from /swaths-to-cells), converted and trimmed.
  const swathDisplayedMap = useMemo(
    () => applyAppliedRate(swathMap),
    [applyAppliedRate, swathMap],
  );
  const swathTrimmedMap = useMemo(
    () => trimByAppliedRate(swathDisplayedMap),
    [trimByAppliedRate, swathDisplayedMap],
  );

  const yieldTrimmedMap = useMemo(() => {
    const features = yieldMap?.features;
    if (!features?.length || !yieldColumn) return yieldMap;

    const trimFraction = Math.min(Math.max(Number(yieldTrimPercent) || 0, 0), 49) / 100;
    if (trimFraction === 0) return yieldMap;

    const values = features
      .map((feature) => parseFloat(feature.properties?.[yieldColumn]))
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);
    if (!values.length) return yieldMap;

    const lower = values[Math.floor(values.length * trimFraction)];
    const upper = values[Math.ceil(values.length * (1 - trimFraction)) - 1];

    return {
      type: 'FeatureCollection',
      features: features.filter((feature) => {
        const value = parseFloat(feature.properties?.[yieldColumn]);
        return Number.isFinite(value) && value >= lower && value <= upper;
      }),
    };
  }, [yieldMap, yieldColumn, yieldTrimPercent]);

  // Raster props for the displayed layer - initRasterObject, valueKey, unit
  const initRasterObject = useMemo(() => {
    if (mapLayer === 'prescription') return prescriptionGeojson;
    if (mapLayer === 'aggrSwaths') return aggregateSwathMap;
    if (mapLayer === 'swath') return appliedRateColumn ? swathTrimmedMap : null;
    if (mapLayer === 'yield') return yieldColumn ? yieldTrimmedMap : null;
    return appliedRateColumn ? trimmedMap : null;
  }, [
    mapLayer, prescriptionGeojson, aggregateSwathMap, appliedRateColumn,
    trimmedMap, swathTrimmedMap, yieldColumn, yieldTrimmedMap,
  ]);

  const valueKey = useMemo(() => {
    if (mapLayer === 'prescription') return 'ReqN';
    if (mapLayer === 'aggrSwaths') return 'weighted_rate';
    if (mapLayer === 'yield') return yieldColumn ?? '';
    return 'applied_N_rate';
  }, [mapLayer, yieldColumn]);

  const unit = useMemo(() => {
    if (mapLayer === 'prescription') return 'lb of N/ac';
    if (mapLayer === 'aggrSwaths') return 'Weighted Rate';
    if (mapLayer === 'yield') return 'Yield';
    return rateMultiplier !== 1 ? 'lb N/ac' : 'Applied Rate';
  }, [mapLayer, rateMultiplier]);

  const secondaryUnit = useMemo(() => {
    if (mapLayer === 'prescription' || mapLayer === 'swath' || mapLayer === 'applied') {
      return additionalMetadata?.fertilizer?.type === 'liquid' ? 'gal of product/ac' : 'lb of product/ac';
    }
    return '';
  }, [mapLayer, additionalMetadata]);

  const secondaryUnitMultiplier = useMemo(() => {
    if (mapLayer === 'prescription' || mapLayer === 'swath' || mapLayer === 'applied') return 1 / rateMultiplier;
    return '';
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

  const yieldColumns = useMemo(() => {
    if (!yieldMap?.features?.length) return [];
    const keys = new Set();
    yieldMap.features.forEach((feature) => {
      Object.keys(feature.properties || {}).forEach((key) => keys.add(key));
    });
    return [...keys].sort();
  }, [yieldMap]);

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
    setSwathMap(null);
    setSwathError('');
    setAggregateSwathMap(null);
    setAggregateSwathError('');

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

  const loadYieldMap = useCallback((geojson, fileName) => {
    if (!isValidGeoJSON(geojson)) {
      handleError(null, dispatch, 'Invalid GeoJSON structure.');
      return;
    }
    const featureCollection = toFeatureCollection(geojson);
    if (!featureCollection.features.length) {
      handleError(null, dispatch, 'No features found in the uploaded file.');
      return;
    }
    setYieldMap(featureCollection);
    setYieldMapFileName(fileName);
    setYieldColumn(null);
  }, [dispatch]);

  const handleYieldMapUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();

    setYieldMap(null);
    setYieldMapFileName('');
    setYieldColumn(null);

    if (['geojson', 'json'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          loadYieldMap(JSON.parse(reader.result), file.name);
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
          loadYieldMap(geojson, file.name);
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

  // Fetch any previously saved application maps and other metadata for the field and prepopulate the UI.
  // The document returned here only holds a blob link,
  // so the GeoJSON for each map is streamed from /application-maps/:field_id/:mapType.
  const fetchApplicationMap = useCallback(async (fieldId) => {
    try {
      setLoadingApplicationMap(true);
      const response = await privateApi.get(`/application-maps/${fieldId}`);
      const data = response?.data?.data ?? null;
      setExistingApplicationMap(data);
      if (!data) return;

      // Parameters are stored inline on the document.
      const params = data.parameters ?? {};
      if (params.centered_swaths_only !== undefined) {
        setUseOnlyCenteredSwaths(params.centered_swaths_only);
      }
      if (params.remove_intersection !== undefined) {
        setRemoveSwathIntersection(params.remove_intersection);
      }
      if (params.threshold !== undefined && params.threshold !== null) {
        setBoundThreshold(String(params.threshold));
      }

      // Fetch the GeoJSON for each map type whose link is present.
      const [appliedGeojson, aggregatedGeojson, yieldGeojson] = await Promise.all([
        data.as_applied_map ? fetchStoredMapGeojson(fieldId, 'as_applied_map') : null,
        data.aggregated_map ? fetchStoredMapGeojson(fieldId, 'aggregated_map') : null,
        data.yield_map ? fetchStoredMapGeojson(fieldId, 'yield_map') : null,
      ]);

      if (appliedGeojson?.features?.length) {
        setAppliedMap(appliedGeojson);
        setAppliedMapFileName('Saved applied map');
        setAppliedRateColumn(appliedGeojson.applied_rate_column ?? null);
      }

      if (aggregatedGeojson?.features?.length) {
        setAggregateSwathMap(aggregatedGeojson);
      }

      if (yieldGeojson?.features?.length) {
        setYieldMap(yieldGeojson);
        setYieldMapFileName('Saved yield map');
        setYieldColumn(yieldGeojson.yield_column ?? null);
      }
    } catch (error) {
      handleError(error, dispatch);
      setExistingApplicationMap(null);
    } finally {
      setLoadingApplicationMap(false);
    }
  }, [dispatch]);

  // Make the /swaths-to-cells API call. The backend returns the aggregated
  // cell summary (geojson_data) and the swath polygons (swaths_geojson).
  const fetchCellSummary = useCallback(async () => {
    if (!appliedMap?.features?.length || !prescriptionGeojson?.features?.length) {
      setAggregateSwathError('An applied rate map and a saved prescription are required.');
      setSwathMap(null);
      setAggregateSwathMap(null);
      return;
    }
    try {
      setLoadingSwath(true);
      setLoadingAggregateSwath(true);
      setSwathError('');
      setAggregateSwathError('');
      const response = await axios.post(`${IMAGERY_API_URL}/swaths-to-cells`, {
        geojson: appliedMap,
        prescription: prescriptionGeojson,
        centered_swaths_only: useOnlyCenteredSwaths,
        remove_intersection: removeSwathIntersection,
        threshold: boundThreshold === '' ? undefined : Number(boundThreshold),
        include_swaths: true,
      });
      setSwathMap(response?.data?.swaths_geojson ?? null);
      setAggregateSwathMap(response?.data?.geojson_data ?? null);
    } catch (error) {
      const message = error?.response?.data?.message || 'Could not generate the cell summary.';
      setSwathMap(null);
      setAggregateSwathMap(null);
      setSwathError(message);
      setAggregateSwathError(message);
    } finally {
      setLoadingSwath(false);
      setLoadingAggregateSwath(false);
    }
  }, [
    appliedMap,
    prescriptionGeojson,
    useOnlyCenteredSwaths,
    removeSwathIntersection,
    boundThreshold,
  ]);

  useEffect(() => {
    // Reset everything if the selected field changes. Existing maps for the new field are fetched after the reset.
    setAppliedMap(null);
    setAppliedMapFileName('');
    setAppliedRateColumn(null);
    setYieldMap(null);
    setYieldMapFileName('');
    setYieldColumn(null);
    setSwathMap(null);
    setSwathError('');
    setAggregateSwathMap(null);
    setAggregateSwathError('');
    setExistingApplicationMap(null);
    setUseOnlyCenteredSwaths(false);
    setRemoveSwathIntersection(false);
    setBoundThreshold('');

    const fieldId = selectedField?._id;
    if (fieldId) {
      fetchAdditionalMetadata(fieldId);
      fetchLatestPrescription(fieldId);
      fetchApplicationMap(fieldId);
    } else {
      setAdditionalMetadata(null);
      setLatestPrescription(null);
    }
  }, [selectedField, fetchAdditionalMetadata, fetchLatestPrescription, fetchApplicationMap]);

  // Exports need at least one map: an uploaded applied/yield map or a saved prescription
  const exportReady = Boolean(
    (appliedMap?.features?.length && appliedRateColumn)
    || prescriptionGeojson?.features?.length
    || yieldMap?.features?.length,
  );

  // Capture each available map layer as an image and export them as a PDF report
  const handleExportPdf = async () => {
    const mapInstance = mapInstanceRef.current;
    if (!mapInstance || isPdfLoading) return;

    const layers = [
      ...(appliedRateColumn && trimmedMap?.features?.length
        ? [{ value: 'applied', label: 'Applied Fertilizer', geojson: trimmedMap }]
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

      // Min/max/average of the converted applied_N_rate column, matching the trimmed map view
      const rateValues = (trimmedMap?.features ?? [])
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
      ...(prescriptionGeojson?.features?.length
        ? [{ name: 'prescription.geojson', geojson: prescriptionGeojson }]
        : []),
      ...(swathDisplayedMap?.features?.length
        ? [{ name: 'swaths.geojson', geojson: swathDisplayedMap }]
        : []),
      ...(aggregateSwathMap?.features?.length
        ? [{ name: 'aggregated_swaths.geojson', geojson: aggregateSwathMap }]
        : []),
      ...(yieldMap?.features?.length
        ? [{ name: 'yield_map.geojson', geojson: yieldMap }]
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

  // Each map can be saved once its value column is selected. At least one is required.
  const canSaveAppliedMap = Boolean(appliedMap?.features?.length && appliedRateColumn);
  const canSaveYieldMap = Boolean(yieldMap?.features?.length && yieldColumn);
  const canSaveMaps = canSaveAppliedMap || canSaveYieldMap;

  // Save the current maps (and swath parameters) to /application-maps.
  const saveApplicationMap = async () => {
    dispatch(set.actionModal({ open: true, type: 'loading', message: 'Saving application maps...' }));
    setIsSavingApplicationMap(true);
    try {
      const parameters = {
        centered_swaths_only: useOnlyCenteredSwaths,
        remove_intersection: removeSwathIntersection,
        threshold: boundThreshold === '' ? undefined : Number(boundThreshold),
      };
      const payload = {
        field_id: selectedField._id,
        parameters,
      };
      // Store each map's raw GeoJSON plus its config (as a GeoJSON foreign member) so
      // it can be restored and re-rendered exactly on reload.
      if (canSaveAppliedMap) {
        payload.as_applied_map = { ...appliedMap, applied_rate_column: appliedRateColumn };
      }
      if (aggregateSwathMap?.features?.length) {
        payload.aggregated_map = { ...aggregateSwathMap, parameters };
      }
      if (canSaveYieldMap) {
        payload.yield_map = { ...yieldMap, yield_column: yieldColumn };
      }

      const response = await privateApi.post('/application-maps', payload);
      setExistingApplicationMap(response?.data?.data ?? null);
      dispatch(set.actionModal({
        open: true,
        type: 'success',
        title: 'Saved Successfully',
        message: 'Your application maps have been saved for this field.',
      }));
    } catch (error) {
      handleError(error, dispatch, '', 'There was an error saving the application maps.');
    } finally {
      setIsSavingApplicationMap(false);
    }
  };

  const handleSaveMaps = () => {
    if (!selectedField?._id) {
      handleError(null, dispatch, 'Select a field before saving.');
      return;
    }
    if (existingApplicationMap) {
      dispatch(set.actionModal({
        open: true,
        type: 'confirm',
        title: 'Overwrite Saved Maps?',
        message: 'Saved application maps already exist for this field. Do you want to overwrite them with the current maps?',
        confirmText: 'Overwrite',
        cancelText: 'Cancel',
        onConfirm: () => saveApplicationMap(),
      }));
    } else {
      saveApplicationMap();
    }
  };

  return (
    <Grid container sx={{ justifyContent: 'center' }}>
      <Grid
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
        size={{
          xs: 12,
          md: 10,
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
            {showAppliedMaps ? <Tab label="View Applied Maps" /> : null}
          </Tabs>
        </Box>

        <Stack spacing="2rem">
          <Typography variant="h4" align="center" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
            View Applied Maps
          </Typography>

          <FieldDropdown />
          {selectedField && (loadingMetadata || loadingApplicationMap) && (
            <Box display="flex" justifyContent="center">
              <CircularProgress size={24} />
            </Box>
          )}
          {selectedField && !loadingMetadata && !additionalMetadata && (
            <Typography align="center" color="textSecondary">
              No additional metadata found for this field.
            </Typography>
          )}

          {/* UPLOAD AN APPLIED-RATE MAP AND A YIELD MAP, EACH WITH ITS RATE/VALUE COLUMN */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ alignItems: 'flex-start' }}>

            {/* APPLIED RATE MAP COLUMN */}
            <Stack spacing={2} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
              <Typography variant="inputLabel" sx={{ fontWeight: 'bold' }}>Upload Applied Rate Map</Typography>

              <Stack spacing={1} sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body1" color="textSecondary" alignContent="center">
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
                    minWidth: 'auto',
                    alignSelf: 'flex-start',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '2rem',
                  }}
                />
              </Stack>

              {appliedMap && (
              <>
                <Autocomplete
                  options={appliedRateColumns}
                  value={appliedRateColumn}
                  onChange={(e, val) => {
                    setAppliedRateColumn(val);
                    setSwathMap(null);
                    setSwathError('');
                    setAggregateSwathMap(null);
                    setAggregateSwathError('');
                  }}
                  renderInput={(params) => (
                    <PSATextField {...params} label="Select the Applied Rate column" required />
                  )}
                  sx={{ mt: '32px !important' }}
                />
                <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                  <Typography variant="inputLabel">
                    {`Outlier trim: ${asAppliedTrimPercent}%`}
                  </Typography>
                  <PSASlider
                    value={asAppliedTrimPercent}
                    onChange={(_, value) => setAsAppliedTrimPercent(value)}
                    min={0}
                    max={49}
                    step={1}
                    valueLabelDisplay="auto"
                    disabled={!appliedRateColumn}
                  />
                </Box>
              </>
              )}

              {canViewSwaths && appliedMap && appliedRateColumn && (
              <>
                <Typography variant="inputLabel">
                  Use only swaths from each grid cell?
                </Typography>
                <PSARadioButton
                  options={[
                    { label: 'Yes', value: true },
                    { label: 'No', value: false },
                  ]}
                  selectedValue={useOnlyCenteredSwaths}
                  onChange={(value) => setUseOnlyCenteredSwaths(value)}
                  row
                />
                <Typography variant="inputLabel">
                  Threshold for lower and upper bounds
                </Typography>
                <Box sx={{ width: { xs: '100%', md: '25%' } }}>
                  <PSATextField
                    type="number"
                    value={boundThreshold}
                    onChange={(e) => setBoundThreshold(e.target.value)}
                    fullWidth
                    sx={{ mt: 0 }}
                  />
                </Box>
                <Typography variant="inputLabel">
                  Remove intersection of swaths?
                </Typography>
                <PSARadioButton
                  options={[
                    { label: 'Yes', value: true },
                    { label: 'No', value: false },
                  ]}
                  selectedValue={removeSwathIntersection}
                  onChange={(value) => setRemoveSwathIntersection(value)}
                  row
                />
                <PSAButton
                  title={loadingAggregateSwath ? 'Generating...' : 'Generate'}
                  variant="contained"
                  onClick={fetchCellSummary}
                  disabled={
                    loadingAggregateSwath
                    || !appliedMap?.features?.length
                    || !prescriptionGeojson?.features?.length
                  }
                  sx={{
                    maxWidth: '250px',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '2rem',
                  }}
                />
                {aggregateSwathError && (
                  <Typography color="error">{aggregateSwathError}</Typography>
                )}
              </>
              )}
            </Stack>

            {/* YIELD MAP COLUMN */}
            <Stack spacing={2} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
              <Typography variant="inputLabel" sx={{ fontWeight: 'bold' }}>Upload Yield Map</Typography>

              <Stack spacing={1} sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body1" color="textSecondary" alignContent="center">
                  {' '}
                  {yieldMapFileName ? `Selected file: ${yieldMapFileName}` : 'No file selected'}
                  {' '}
                </Typography>
                <input
                  id="yield-map-input"
                  type="file"
                  hidden
                  accept=".geojson,.json,.shp,.zip"
                  onChange={handleYieldMapUpload}
                />
                <PSAButton
                  title="Upload Shapefile / GeoJSON"
                  variant="contained"
                  onClick={() => document.getElementById('yield-map-input').click()}
                  sx={{
                    minWidth: 'auto',
                    alignSelf: 'flex-start',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '2rem',
                  }}
                />
              </Stack>

              {yieldMap && (
                <>
                  <Autocomplete
                    options={yieldColumns}
                    value={yieldColumn}
                    onChange={(e, val) => setYieldColumn(val)}
                    renderInput={(params) => (
                      <PSATextField {...params} label="Select the Yield column" required />
                    )}
                    sx={{ mt: '32px !important' }}
                  />
                  <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                    <Typography variant="inputLabel">
                      {`Outlier trim: ${yieldTrimPercent}%`}
                    </Typography>
                    <PSASlider
                      value={yieldTrimPercent}
                      onChange={(_, value) => setYieldTrimPercent(value)}
                      min={0}
                      max={49}
                      step={1}
                      valueLabelDisplay="auto"
                      disabled={!yieldColumn}
                    />
                  </Box>
                </>
              )}
            </Stack>
          </Stack>

          <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <PSARadioButton
              options={[
                { label: 'Applied Map', value: 'applied' },
                ...(canViewSwaths ? [
                  { label: 'Swaths', value: 'swath' },
                  { label: 'Aggregated swaths', value: 'aggrSwaths' },
                  { label: 'Yield Map', value: 'yield' },
                ] : []),
                { label: 'Prescription', value: 'prescription' },
              ]}
              selectedValue={mapLayer}
              onChange={(value) => setMapLayer(value)}
              row
            />

            {mapLayer === 'applied' && !displayedMap && (
              <Typography color="textSecondary">
                Upload an applied rate map.
              </Typography>
            )}

            {mapLayer === 'applied' && displayedMap && !appliedRateColumn && (
              <Typography color="textSecondary">
                Select the applied rate column to display the map.
              </Typography>
            )}

            {mapLayer === 'yield' && !yieldMap && (
              <Typography color="textSecondary">
                Upload a yield map.
              </Typography>
            )}

            {mapLayer === 'yield' && yieldMap && !yieldColumn && (
              <Typography color="textSecondary">
                Select the yield column to display the map.
              </Typography>
            )}

            {mapLayer === 'prescription' && !loadingPrescription && !prescriptionGeojson && (
              <Typography color="textSecondary">
                {!selectedField ? 'Select a field to view the latest prescription.' : 'No saved prescription found for this field.'}
              </Typography>
            )}

            {mapLayer === 'swath' && !loadingSwath && !swathError && !swathMap && (
              <Typography color="textSecondary">
                {prescriptionGeojson
                  ? 'Click Generate to build the swath polygons.'
                  : 'A saved prescription is required to generate swaths.'}
              </Typography>
            )}

            {mapLayer === 'aggrSwaths' && !loadingAggregateSwath && !aggregateSwathError
              && !aggregateSwathMap && (
              <Typography color="textSecondary">
                {prescriptionGeojson
                  ? 'Click Generate to build the aggregated swaths.'
                  : 'A saved prescription is required to generate aggregated swaths.'}
              </Typography>
            )}

            {mapLayer === 'prescription' && loadingPrescription && <CircularProgress size={24} />}
            {mapLayer === 'swath' && loadingSwath && <CircularProgress size={24} />}
            {mapLayer === 'aggrSwaths' && loadingAggregateSwath && <CircularProgress size={24} />}

            {mapLayer === 'swath' && !loadingSwath && swathError && (
              <Typography color="textSecondary">{swathError}</Typography>
            )}

            <PSAReduxMap
              key={`${selectedField?._id}-${appliedMapFileName}-${appliedRateColumn}-${yieldMapFileName}-${yieldColumn}`}
              setMap={(mapInstance) => { mapInstanceRef.current = mapInstance; }}
              initWidth="100%"
              initHeight="380px"
              initLat={mapCenter[0]}
              initLon={mapCenter[1]}
              initBounds={mapBounds}
              hasNavigation
              hasFullScreen
              scrollZoom
              dragPan
              keyboard
              hasSearchBar
              doubleClickZoom={false}
              touchZoomRotate
              initRasterObject={initRasterObject}
              valueKey={valueKey}
              rasterColors={APPLIED_RATE_COLORS}
              color_steps={7}
              unit={unit}
              material={mapLayer === 'prescription' ? 'prescription' : 'appliedRate'}
              scaleType={mapLayer === 'prescription' ? 'linear' : 'quantile'}
              secondaryUnit={secondaryUnit}
              secondaryUnitMultiplier={secondaryUnitMultiplier}
              mapboxToken={mapboxToken}
            />
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
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
            {canViewSwaths
            && (
            <PSAButton
              title={isSavingApplicationMap ? 'Saving...' : 'Save Maps'}
              variant="contained"
              onClick={handleSaveMaps}
              disabled={!canSaveMaps || isSavingApplicationMap}
              sx={{
                minWidth: '150px',
                padding: '0.8rem 1.5rem',
                borderRadius: '2rem',
              }}
            />
            )}
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default AppliedMaps;
