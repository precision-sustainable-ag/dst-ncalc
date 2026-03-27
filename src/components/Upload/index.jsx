/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert, Autocomplete, Box, Grid, Stack, Typography, useMediaQuery,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PSATextField } from 'shared-react-components/src';
import dayjs from 'dayjs';
import centroid from '@turf/centroid';
import { get, set } from '../../store/Store';
import NavigateBar from '../../shared/Navigate';
import { ncalcApiUrl } from '../../utils/keys';
import FieldDropdown from '../../shared/FieldDropdown/FieldDropdown';

const API_BASE_URL = ncalcApiUrl;

const Upload = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const dispatch = useDispatch();
  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [isFetchingBiomass, setIsFetchingBiomass] = useState(null);
  const selectedField = useSelector(get.selectedField);
  const [biomassFiles, setBiomassFiles] = useState([]);
  const selectedBiomassFile = useSelector(get.selectedBiomassFile);

  const biomassPoints = useSelector(get.biomassPoints);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Validates a point in the json file
  const validatePoint = (point, index) => {
    if (!point || typeof point !== 'object') {
      throw new Error(`Point at index ${index} is not a valid object`);
    }

    const requiredFields = ['camera_id', 'lon', 'lat', 'species'];
    const missingField = requiredFields.find((field) => !(field in point));
    if (missingField) {
      throw new Error(`Point at index ${index} is missing required field: ${missingField}`);
    }

    if (typeof point.camera_id !== 'number') {
      throw new Error(`Point at index ${index}: camera_id must be a number`);
    }

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
      console.error('Validation failed:', errorMessage);
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
    if (selectedField && selectedField.properties?.coverCropTerminationDate) {
      dispatch(set.coverCropPlantingDate(selectedField.properties.coverCropPlantingDate));
      dispatch(set.coverCropTerminationDate(selectedField.properties.coverCropTerminationDate));
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
        const response = await axios.get(`${API_BASE_URL}/biomass/field/${fieldId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBiomassFiles(response.data?.data);
      } catch (e) {
        console.error('Failed to load options', e);
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
          <Typography variant="h4" align="center">Select your field</Typography>

          <FieldDropdown />

          {selectedField && (
          <Autocomplete
            loading={isFetchingBiomass}
            loadingText="Loading biomass files..."
            options={biomassFiles}
            value={selectedBiomassFile}
            onChange={(event, newValue) => {
              dispatch(set.selectedBiomassFile(newValue));
            }}
            getOptionLabel={(option) => (option?.createdAt
              ? `${dayjs(option.createdAt).format('MMM D, YYYY')} (${option.points?.length || 0} points)` : '')}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Stack>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {dayjs(option.createdAt).format('MMM D, YYYY')}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                      Time:
                      {' '}
                      <b>{dayjs(option.createdAt).format('h:mm A')}</b>
                    </Typography>

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
          nextDisabled={!biomassPoints}
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
