/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  Box, Grid, Stack, Typography,
  useMediaQuery,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { get, set } from '../../store/Store';
import NavigateBar from '../../shared/Navigate';
import NavButton from '../../shared/Navigate/NavButton';

const Upload = () => {
  const dispatch = useDispatch();
  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const pm3dData = useSelector(get.pm3dData);
  const [data, setData] = useState(pm3dData);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

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
    if (!Array.isArray(parsedData)) {
      throw new Error('File must contain an array of points');
    }

    if (parsedData.length === 0) {
      throw new Error('File contains no data points');
    }

    parsedData.forEach((point, index) => validatePoint(point, index));

    return true;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setError('');
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const parsedData = JSON.parse(content);
          validateData(parsedData);
          setData(parsedData);
          dispatch(set.pm3dData(parsedData));
        } catch (err) {
          setData(null);
          dispatch(set.pm3dData(null));
          setFileName('');
          setError(err.message || 'Invalid file format');
        }
      };

      reader.onerror = () => {
        setError('Error reading file');
        setData(null);
        dispatch(set.pm3dData(null));
        setFileName('');
      };
      reader.readAsText(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
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
          <Box>
            <Typography variant="h4" align="center">Upload your PlantMap3D output file</Typography>
          </Box>
        </Stack>
        <Box sx={{ height: '2rem' }} />

        {error && (
          <Box sx={{ marginBottom: '1rem' }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {data && (
          <Box sx={{ marginBottom: '1rem' }}>
            <Alert severity="success">
              Successfully loaded
              {' '}
              {data.length}
              {' '}
              data points.
            </Alert>
          </Box>
        )}
        <Stack spacing={2} direction="column">
          <Stack justifyContent="space-around" alignItems="center" sx={{ flexDirection: { sm: 'column', md: 'row' } }}>
            <Typography variant="h6">
              {' '}
              {fileName ? `Selected file: ${fileName}` : 'Select file'}
              {' '}
            </Typography>
            <NavButton onClick={handleUploadClick}>Upload</NavButton>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </Stack>
        </Stack>
        <Box sx={{ height: '1rem' }} />
        <NavigateBar
          next="Next"
          nextOnClick={() => {
            navigate('/covercrop');
            dispatch(set.activeStep(4));
          }}
          nextDisabled={!data}
          nextTooltip={!data ? 'Upload a file' : ''}
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
