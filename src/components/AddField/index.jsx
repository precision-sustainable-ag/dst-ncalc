/* eslint-disable no-alert */
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Autocomplete,
  Box,
  CircularProgress,
  Grid, Stack, Typography, useMediaQuery,
} from '@mui/material';
import { PSAButton, PSAReduxMap, PSATextField } from 'shared-react-components/src';
import { useSelector } from 'react-redux';
import shpjs from 'shpjs';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { get } from '../../store/redux-autosetters';
import { mapboxToken } from '../../utils/keys';
import { processGeometries, validateAndProcessGeoJSON } from '../../utils/geojsonUtils';

const API_BASE_URL = 'https://developpm3dapi.covercrop-ncalc.org/api/v1';
const ROLES = ['NIFA-Soy', 'Willard', 'Growmark'];

// TODO: Placeholder values - to be updated
const CASH_CROP_OPTIONS = ['Corn', 'Soybeans', 'Wheat', 'Cotton'];
const COVER_CROP_OPTIONS = ['Barley', 'Cereal Rye', 'Crimson Clover', 'Oats', 'Hairy Vetch', 'Winter Wheat'];
const SEASONS = ['Spring 2025', 'Fall 2025', 'Spring 2026', 'Fall 2026'];

const AddField = () => {
  const {
    user, isAuthenticated, isLoading, getAccessTokenSilently,
  } = useAuth0();

  const navigate = useNavigate();
  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  // FORM DATA STATE VARIABLES
  const [program, setProgram] = useState(null);
  const [grower, setGrower] = useState(null);
  const [farm, setFarm] = useState(null);
  const [field, setField] = useState(null);
  const [season, setSeason] = useState(null);
  const [cashCrop, setCashCrop] = useState(null);
  const [coverCrops, setCoverCrops] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // MAP STATE VARIABLES
  const defaultLat = useSelector(get.lat);
  const defaultLon = useSelector(get.lon);
  const [address, setAddress] = useState({});
  const [zoom, setZoom] = useState(13);
  const [features, setFeatures] = useState(null);
  const [latLon, setLatLon] = useState([defaultLat, defaultLon]);
  const [bounds, setBounds] = useState(null);

  // DATA FOR ALL THE FIELDS
  const [allFields, setAllFields] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const roles = user?.['https://dst-ncalc.org/claims'] || [];
  const isAllowed = isAuthenticated && (roles.includes('admin') || roles.some((r) => ROLES.includes(r)));
  const isAdmin = roles.includes('admin');
  const allowedPrograms = isAdmin
    ? ROLES
    : ROLES.filter((role) => roles.includes(role));

  const updateProperties = (properties) => {
    setAddress(properties?.address);
    setZoom(properties?.zoom);
    setFeatures(properties?.features);
    setLatLon([properties?.lat, properties?.lon]);
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(`${API_BASE_URL}/fields-identifiers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // setOptions(response.data);
        setAllFields(response.data);
      } catch (error) {
        console.error('Failed to load dropdown options', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    if (isAuthenticated) {
      fetchOptions();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  const {
    programOptions, growerOptions, farmOptions, fieldOptions,
  } = useMemo(() => {
    // Helper to extract unique values from a filtered list
    const getUnique = (list, key) => [...new Set(list.map((item) => item.properties[key]).filter(Boolean))].sort();

    // A. Programs: Show programs list according to the user's role
    const uniquePrograms = allowedPrograms;

    // B. Growers: Filter master list by Selected Program
    const validGrowersList = allFields.filter((f) => !program || f.properties.programName.toLowerCase() === program.toLowerCase());
    const uniqueGrowers = getUnique(validGrowersList, 'growerName');

    // C. Farms: Filter by Selected Program AND Selected Grower
    const validFarmsList = validGrowersList.filter((f) => !grower || f.properties.growerName.toLowerCase() === grower.toLowerCase());
    const uniqueFarms = getUnique(validFarmsList, 'farmName');

    // D. Fields: Filter by Program AND Grower AND Farm
    const validFieldsList = validFarmsList.filter((f) => !farm || f.properties.farmName.toLowerCase() === farm.toLowerCase());
    const uniqueFields = getUnique(validFieldsList, 'fieldName');

    return {
      programOptions: uniquePrograms,
      growerOptions: uniqueGrowers,
      farmOptions: uniqueFarms,
      fieldOptions: uniqueFields,
    };
  }, [allowedPrograms, allFields, program, grower, farm]);

  const handleProgramChange = (newVal) => {
    setProgram(newVal);
    setGrower(null);
    setFarm(null);
    setField(null);
  };

  const handleGrowerChange = (newVal) => {
    setGrower(newVal);
    setFarm(null);
    setField(null);
  };

  const handleFarmChange = (newVal) => {
    setFarm(newVal);
    setField(null);
  };

  const handleSaveField = async () => {
    // Validate form fields
    if (!program || !grower || !farm || !field || !season || !cashCrop || !coverCrops || coverCrops.length < 1) {
      alert('Please fill in all text fields');
      return;
    }

    const finalGeometry = processGeometries(features);
    if (!finalGeometry) {
      alert('Please draw a shape or upload a file.');
      return;
    }

    setIsSaving(true);

    try {
      const token = await getAccessTokenSilently();

      const payload = {
        programName: program,
        farmName: farm,
        growerName: grower,
        fieldName: field,
        season,
        cashCrop,
        coverCrop: coverCrops,
        geometry: finalGeometry,
      };

      await axios.post(`${API_BASE_URL}/fields`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setProgram(null);
      setGrower(null);
      setFarm(null);
      setField(null);
      setFeatures(null);

      alert('Field saved successfully!');
      navigate('/home');
    } catch (error) {
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else if (error.response) {
        alert(`Error: ${error.response.data?.error || 'Failed to save field'}`);
      } else {
        alert('Network error. Could not connect to server.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (['geojson', 'json'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const geojson = JSON.parse(reader.result);
          validateAndProcessGeoJSON(geojson, setFeatures, setLatLon, setBounds);
        } catch (err) {
          alert('Error parsing GeoJSON file');
        }
      };
      reader.readAsText(file);
    } else if (['shp', 'zip'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result;
          const geojson = await shpjs(arrayBuffer);
          validateAndProcessGeoJSON(geojson, setFeatures, setLatLon, setBounds);
        } catch (err) {
          alert('Error parsing Shapefile. Please ensure it is a valid .zip containing .shp, .shx, and .dbf files.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Unsupported file type. Please upload .geojson or .shp');
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Grid container justifyContent="center">
        <Grid
          item
          xs={12}
          md={10}
          sx={{
            marginTop: '1rem', padding: '2rem', backgroundColor: 'white', borderRadius: 5,
          }}
        >
          <Typography variant="h6" align="center">Please log in to enroll a field</Typography>
        </Grid>
      </Grid>
    );
  }

  if (!isAllowed) {
    return (
      <Grid container justifyContent="center">
        <Grid
          item
          xs={12}
          md={10}
          sx={{
            marginTop: '1rem', padding: '2rem', backgroundColor: 'white', borderRadius: 5,
          }}
        >
          <Typography variant="h6" align="center">Access denied</Typography>
        </Grid>
      </Grid>
    );
  }

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
        <Stack spacing="1.5rem">

          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#60802D' }}>
            Field Metadata
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                loading={loadingOptions}
                options={programOptions}
                value={program}
                onChange={(e, val) => handleProgramChange(val)}
                onInputChange={(e, newInputValue) => handleProgramChange(newInputValue)}
                renderInput={(params) => <PSATextField {...params} label="Select a Program name" />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                key={program}
                freeSolo
                loading={loadingOptions}
                options={growerOptions}
                value={grower}
                onChange={(e, val) => handleGrowerChange(val)}
                onInputChange={(e, newInputValue) => handleGrowerChange(newInputValue)}
                renderInput={(params) => <PSATextField {...params} label="Select a Grower name" />}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                key={grower}
                freeSolo
                loading={loadingOptions}
                options={farmOptions}
                value={farm}
                onChange={(e, val) => handleFarmChange(val)}
                onInputChange={(e, newInputValue) => handleFarmChange(newInputValue)}
                renderInput={(params) => <PSATextField {...params} label="Select a Farm name" />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                key={farm}
                freeSolo
                loading={loadingOptions}
                options={fieldOptions}
                value={field}
                onChange={(e, val) => setField(val)}
                onInputChange={(e, newInputValue) => setField(newInputValue)}
                renderInput={(params) => <PSATextField {...params} label="Select a Field name" />}
              />
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#60802D', mt: 1 }}>
            Crop Details
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                freeSolo
                options={SEASONS}
                value={season}
                onChange={(e, val) => setSeason(val)}
                onInputChange={(e, val) => setSeason(val)}
                renderInput={(params) => <PSATextField {...params} label="Season" />}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Autocomplete
                options={CASH_CROP_OPTIONS}
                value={cashCrop}
                onChange={(e, val) => setCashCrop(val)}
                renderInput={(params) => <PSATextField {...params} label="Cash Crop" />}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Autocomplete
                multiple
                options={COVER_CROP_OPTIONS}
                value={coverCrops}
                onChange={(e, val) => setCoverCrops(val)}
                renderInput={(params) => (
                  <PSATextField {...params} label="Cover Crops" />
                )}
              />
            </Grid>
          </Grid>

          <Typography variant="h4" align="center">
            Where is your Field located?
          </Typography>
          <Typography variant="h6" align="center">
            Enter your address, zip code, or GPS coordinates into the map search bar. If you
            know your exact coordinates, you can enter them separated by a comma (ex. 37.7,
            -80.2). You can also click the button to use your device&apos;s current location.
          </Typography>

          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            You can mark your field by using the tool to draw a shape (clicking twice to
            complete it). Alternatively, upload a shape file or GeoJSON of your field&apos;s
            boundary.
          </Typography>
          <Stack direction="row" justifyContent="flex-end">
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
                color: 'white',
                padding: '0.8rem 1.5rem',
                borderRadius: '2rem',
                backgroundColor: '#60802D',
                '&:hover': {
                  backgroundColor: '#60802D',
                  textDecoration: 'underline',
                  boxShadow: '0px 2px 2px rgba(160, 160, 160, 0.3)',
                },
              }}
            />
          </Stack>

          <Box sx={{ position: 'relative' }}>
            <PSAReduxMap
              setProperties={updateProperties}
              initWidth="100%"
              initHeight="380px"
              initLat={latLon[0]}
              initLon={latLon[1]}
              initStartZoom={zoom}
              initFeatures={features}
              initAddress={address?.address}
              initBounds={bounds}
              hasSearchBar
              hasClear
              hasMarker
              hasMarkerPopup
              hasMarkerMovable
              hasNavigation
              hasFullScreen
              hasGeolocate
              hasDrawing
              scrollZoom
              dragRotate
              dragPan
              keyboard
              doubleClickZoom={false}
              touchZoomRotate
              mapboxToken={mapboxToken}
            />
          </Box>

          <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
            <PSAButton
              title={isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save Field'}
              variant="contained"
              onClick={handleSaveField}
              disabled={isSaving || !program || !grower || !farm || !field || !season || !cashCrop || !coverCrops || coverCrops.length < 1}
              sx={{
                minWidth: '150px',
                color: 'white',
                padding: '0.8rem 1.5rem',
                borderRadius: '2rem',
                backgroundColor: '#60802D',
                '&:hover': {
                  backgroundColor: '#60802D',
                  textDecoration: 'underline',
                  boxShadow: '0px 2px 2px rgba(160, 160, 160, 0.3)',
                },
              }}
            />
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default AddField;
