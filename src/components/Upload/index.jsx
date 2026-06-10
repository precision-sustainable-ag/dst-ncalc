/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert, Autocomplete, Box, Grid, Stack, Typography, useMediaQuery,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PSAButton, PSARadioButton, PSATextField } from 'shared-react-components/src';
import centroid from '@turf/centroid';
import shpjs from 'shpjs';
import { get, set } from '../../store/Store';
import NavigateBar from '../../shared/Navigate';
import { ncalcApiUrl } from '../../utils/keys';
import FieldDropdown from '../../shared/FieldDropdown/FieldDropdown';
import { handleError } from '../../utils/apiError';
import { processGeometries, validateAndProcessGeoJSON } from '../../utils/geojsonUtils';

const API_BASE_URL = ncalcApiUrl;

const Upload = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const dispatch = useDispatch();
  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [isFetchingBiomass, setIsFetchingBiomass] = useState(null);
  const selectedField = useSelector(get.selectedField);
  const [biomassFiles, setBiomassFiles] = useState([]);
  const selectedBiomassFile = useSelector(get.selectedBiomassFile);
  const [useCustomBoundary, setUseCustomBoundary] = useState(false);
  const [fileName, setFileName] = useState('');
  const originalGeometryRef = useRef(null);

  const biomassPoints = useSelector(get.biomassPoints);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Validates a point in the json file
  const validatePoint = (point, index) => {
    if (!point || typeof point !== 'object') {
      throw new Error(`Point at index ${index} is not a valid object`);
    }

    const requiredFields = ['lon', 'lat', 'species'];
    const missingField = requiredFields.find((field) => !(field in point));
    if (missingField) {
      throw new Error(`Point at index ${index} is missing required field: ${missingField}`);
    }

    // if (typeof point.camera_id !== 'number') {
    //   throw new Error(`Point at index ${index}: camera_id must be a number`);
    // }

    if (typeof point.lon !== 'number' || typeof point.lat !== 'number') {
      throw new Error(`Point at index ${index}: lon and lat must be numbers`);
    }

    if (typeof point.species !== 'object' || Array.isArray(point.species)) {
      throw new Error(`Point at index ${index}: species must be an object`);
    }

    if (Object.keys(point.species).length === 0) {
      throw new Error(`Point at index ${index}: species object is empty`);
    }

    // Validate species values are numbers
    const speciesEntries = Object.entries(point.species);
    const invalidSpecies = speciesEntries.find(([, value]) => typeof value !== 'number');
    if (invalidSpecies) {
      throw new Error(`Point at index ${index}: species "${invalidSpecies[0]}" value must be a number`);
    }

    // Validate biomass_percentile_per_species if present
    if (point.biomass_percentile_per_species) {
      if (typeof point.biomass_percentile_per_species !== 'object' || Array.isArray(point.biomass_percentile_per_species)) {
        throw new Error(`Point at index ${index}: biomass_percentile_per_species must be an object`);
      }
    }

    return true;
  };

  // Validates the json file
  const validateData = (parsedData) => {
    setError('');
    try {
      if (!Array.isArray(parsedData)) {
        throw new Error('File must contain an array of points');
      }

      if (parsedData.length === 0) {
        throw new Error('File contains no data points');
      }

      parsedData.forEach((point, index) => validatePoint(point, index));

      return true;
    } catch (e) {
      const errorMessage = e.message || 'An unknown validation error occurred';
      setError(errorMessage);
      return false;
    }
  };

  useEffect(() => {
    if (selectedBiomassFile && selectedField && selectedBiomassFile.field_id !== selectedField._id) {
      dispatch(set.selectedBiomassFile(null));
    }
    if (!selectedField) {
      dispatch(set.selectedBiomassFile(null));
      dispatch(set.coverCrop([]));
      dispatch(set.coverCropPlantingDate(null));
      dispatch(set.coverCropTerminationDate(null));
      return;
    }

    if (selectedField && selectedField.properties?.coverCrop) {
      dispatch(set.coverCrop(selectedField.properties.coverCrop));
    }
    if (selectedField && selectedField.properties?.coverCropPlantingDate) {
      dispatch(set.coverCropPlantingDate(selectedField.properties.coverCropPlantingDate));
    }
    if (selectedField && selectedField.properties?.coverCropTerminationDate) {
      dispatch(set.coverCropTerminationDate(selectedField.properties.coverCropTerminationDate));
    }
    if (selectedField && selectedField.properties?.cashCropPlantingDate) {
      dispatch(set.cashCropPlantingDate(selectedField.properties.cashCropPlantingDate));
    }
    if (selectedField && selectedField.geometry) {
      const featuresToSet = { type: 'Feature', geometry: selectedField.geometry };
      try {
        const centerPoint = centroid({
          type: 'FeatureCollection',
          features: [featuresToSet],
        });
        const [centerLon, centerLat] = centerPoint.geometry.coordinates;
        dispatch(set.lat(centerLat));
        dispatch(set.lon(centerLon));
        // dispatch(set.mapPolygon([featuresToSet]));

        // const newBounds = bbox({
        //   type: 'FeatureCollection',
        //   features: featuresToSet,
        // });
        // setBounds(newBounds);
      } catch (e) {
        console.warn('Could not calculate bounds', e);
      }
    }
  }, [selectedField]);

  // Fetch Biomass Files for selected field
  useEffect(() => {
    const fetchBiomassFiles = async () => {
      try {
        if (!selectedField) return;
        setIsFetchingBiomass(true);
        const token = await getAccessTokenSilently();
        const { _id: fieldId } = selectedField;
        if (!fieldId) return;
        const response = await axios.get(`${API_BASE_URL}/biomass-field-map/${fieldId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBiomassFiles(response.data?.data);
      } catch (e) {
        handleError(e, dispatch, '', 'An error occurred while fetching biomass files.');
        setBiomassFiles([]);
      } finally {
        setIsFetchingBiomass(false);
      }
    };

    if (isAuthenticated) {
      fetchBiomassFiles();
    }
  }, [isAuthenticated, getAccessTokenSilently, selectedField]);

  useEffect(() => {
    setError('');
    if (!selectedBiomassFile) {
      dispatch(set.biomassPoints(null));
      dispatch(set.coverCropGrowthStage(null));
      return;
    }
    const isValidated = validateData(selectedBiomassFile?.points);
    if (!isValidated) {
      dispatch(set.biomassPoints(null));
      dispatch(set.coverCropGrowthStage(null));
      return;
    }
    dispatch(set.biomassPoints(selectedBiomassFile?.points));
    dispatch(set.coverCropGrowthStage(selectedBiomassFile?.growthStages));
  }, [selectedBiomassFile]);

  // Capture the original geometry and reset boundary UI whenever a new field is chosen
  useEffect(() => {
    if (selectedField?.geometry) {
      originalGeometryRef.current = selectedField.geometry;
    }
    setUseCustomBoundary(false);
  }, [selectedField?._id]);

  const handleBoundaryToggle = (newValue) => {
    if (newValue === null) return;
    setUseCustomBoundary(newValue);
    setFileName('');

    // Restore original geometry when switching back to no
    if (newValue === false && originalGeometryRef.current && selectedField) {
      dispatch(set.selectedField({ ...selectedField, geometry: originalGeometryRef.current }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const setGeometry = (processedGeojson) => {
      const newGeometry = processGeometries(processedGeojson);
      if (newGeometry) dispatch(set.selectedField({ ...selectedField, geometry: newGeometry }));
    };

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (['geojson', 'json'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const geojson = JSON.parse(reader.result);
          validateAndProcessGeoJSON(
            geojson,
            setGeometry,
            () => {},
            () => {},
          );
        } catch (err) {
          setFileName('');
          handleError(err, dispatch, 'Error parsing GeoJSON file');
        }
      };
      reader.readAsText(file);
    } else if (['shp', 'zip'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result;
          const geojson = await shpjs(arrayBuffer);
          validateAndProcessGeoJSON(
            geojson,
            setGeometry,
            () => {},
            () => {},
          );
        } catch (err) {
          setFileName('');
          handleError(err, dispatch, 'Error parsing Shapefile. Please ensure it is a valid .zip containing .shp, .shx, and .dbf files.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setFileName('');
      handleError(null, dispatch, 'Unsupported file type. Please upload .geojson or .shp');
    }
  };

  return (
    <Grid container justifyContent="center">
      <Grid
        item
        xs={12}
        md={10}
        sx={{
          marginTop: '1rem',
          padding: `2rem ${matchesMd ? '1rem' : '4rem'}`,
          boxShadow: 5,
          borderRadius: 5,
          opacity: 0.9,
          backgroundColor: 'white',
        }}
      >
        <Stack spacing={2} direction="column">
          <Typography variant="h4" align="center" color="primary">Select your field</Typography>

          <FieldDropdown />

          {selectedField && (
          <Autocomplete
            loading={isFetchingBiomass}
            loadingText="Loading biomass files..."
            options={biomassFiles}
            value={selectedBiomassFile}
            onChange={(event, newValue) => {
              dispatch(set.selectedBiomassFile(newValue));
              dispatch(set.coverCropTerminationDate(newValue.date));
            }}
            getOptionLabel={(option) => (option?.date
              ? `${option.date} (${option.points?.length || 0} points)` : '')}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Stack>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {/* {dayjs(option.createdAt).format('MMM D, YYYY')} */}
                    {option.date}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    {/* <Typography variant="body2" color="text.secondary">
                      Time:
                      {' '}
                      <b>{dayjs(option.createdAt).format('h:mm A')}</b>
                    </Typography> */}

                    <Typography variant="body2" color="text.secondary">
                      Points:
                      {' '}
                      <b>{option.points?.length || 0}</b>
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            )}
            renderInput={(params) => (
              <PSATextField
                {...params}
                label="What date was the field sprayed"
                placeholder="Select a date..."
              />
            )}
            sx={{ mt: 2 }}
          />
          )}

          {selectedField && (
          <Stack spacing={1}>
            <Typography variant="body1">
              Would you like to use different field boundaries?
            </Typography>

            <PSARadioButton
              options={[
                { label: 'No', value: false },
                { label: 'Yes', value: true },
              ]}
              selectedValue={useCustomBoundary}
              onChange={handleBoundaryToggle}
              row
            />
            {useCustomBoundary && (
              <Stack spacing={1} sx={{ pt: 1 }}>

                <Stack direction={{ sm: 'column', md: 'row' }} gap={1} justifyContent="space-between">
                  <Typography variant="body1" color="text.secondary" alignContent="center">
                    {' '}
                    {fileName ? `Selected file: ${fileName}` : 'No file selected'}
                    {' '}
                  </Typography>

                  <input
                    id="upload-input"
                    type="file"
                    hidden
                    accept=".geojson,.shp,.zip"
                    onChange={handleFileUpload}
                  />
                  <PSAButton
                    title="Upload Shapefile / GeoJSON"
                    variant="contained"
                    onClick={() => document.getElementById('upload-input').click()}
                    sx={{
                      minWidth: '150px',
                      padding: '0.8rem 1.5rem',
                      borderRadius: '2rem',
                    }}
                  />
                </Stack>
              </Stack>
            )}
          </Stack>
          )}

          {error && (
          <Box sx={{ marginBottom: '1rem' }}>
            <Alert severity="error">{error}</Alert>
          </Box>
          )}

          {biomassPoints && (
            <Box sx={{ marginBottom: '1rem' }}>
              <Alert severity="success">
                Successfully loaded
                {' '}
                {biomassPoints.length}
                {' '}
                data points.
              </Alert>
            </Box>
          )}
        </Stack>

        <Box sx={{ height: '1rem' }} />
        <NavigateBar
          next="Next"
          nextOnClick={() => {
            navigate('/covercrop');
            dispatch(set.activeStep(4));
          }}
          nextDisabled={!biomassPoints || (useCustomBoundary && !fileName)}
          nextTooltip={!biomassPoints ? 'Upload a file' : ''}
          back="Back"
          backOnClick={() => {
            navigate('/home');
            dispatch(set.activeStep(0));
          }}
        />
      </Grid>
    </Grid>

  );
}; // Upload

export default Upload;
