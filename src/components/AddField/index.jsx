/* eslint-disable no-alert */
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Autocomplete,
  Box,
  CircularProgress,
  Grid, Stack, SvgIcon, Typography, useMediaQuery,
} from '@mui/material';
import { PSAButton, PSAReduxMap, PSATextField } from 'shared-react-components/src';
import { useSelector } from 'react-redux';
import shpjs from 'shpjs';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { get } from '../../store/redux-autosetters';
import { mapboxToken } from '../../utils/keys';
import { processGeometries, validateAndProcessGeoJSON } from '../../utils/geojsonUtils';

const API_BASE_URL = 'https://developpm3dapi.covercrop-ncalc.org/api/v1';
const ROLES = ['NIFA-Soy', 'Willard', 'Growmark'];

// TODO: Placeholder values - to be updated
const CASH_CROP_OPTIONS = ['Corn', 'Soybeans', 'Wheat', 'Cotton'];
// const SEASONS = ['Spring 2025', 'Fall 2025', 'Spring 2026', 'Fall 2026'];

const polygonIcon = (
  <SvgIcon
    viewBox="0 0 20 20"
    fontSize="inherit"
    sx={{ verticalAlign: 'middle', mx: 0.5 }}
  >
    <path
      d="m15 12.3v-4.6c.6-.3 1-1 1-1.7 0-1.1-.9-2-2-2-.7 0-1.4.4-1.7 1h-4.6c-.3-.6-1-1-1.7-1-1.1 0-2 .9-2 2 0 .7.4 1.4 1
      1.7v4.6c-.6.3-1 1-1 1.7 0 1.1.9 2 2 2 .7 0 1.4-.4 1.7-1h4.6c.3.6 1 1 1.7 1 1.1 0 2-.9 2-2 0-.7-.4-1.4-1-1.7zm-8-.3v-4l1-1h4l1
      1v4l-1 1h-4z"
    />
  </SvgIcon>
);

const gpsIcon = (
  <SvgIcon
    viewBox="0 0 24 24"
    fontSize="small"
    sx={{ verticalAlign: 'middle', mx: 0.5 }}
  >
    <path
      d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,
      3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,
      17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z"
    />
  </SvgIcon>
);

const fieldIcon = (
  <SvgIcon
    viewBox="0 0 24 24"
    fontSize="small"
    sx={{ verticalAlign: 'middle', mx: 0.5 }}
  >
    <path
      d="M19 19H15V21H19C20.1 21 21 20.1 21 19V15H19M19 3H15V5H19V9H21V5C21 3.9 20.1 3 19 3M5 5H9V3H5C3.9 3 3 3.9 3
      5V9H5M5 15H3V19C3 20.1 3.9 21 5 21H9V19H5V15M7 11H9V13H7V11M11 11H13V13H11V11M15 11H17V13H15V11Z"
    />
  </SvgIcon>
);

const AddField = () => {
  const {
    user, isAuthenticated, isLoading, getAccessTokenSilently,
  } = useAuth0();

  const navigate = useNavigate();
  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const COVER_CROP_OPTIONS = useSelector(get.species) || [];

  // FORM DATA STATE VARIABLES
  const [program, setProgram] = useState(null);
  const [grower, setGrower] = useState(null);
  const [farm, setFarm] = useState(null);
  const [field, setField] = useState(null);
  // const [season, setSeason] = useState(null);
  const [cashCrop, setCashCrop] = useState(null);
  const [coverCrops, setCoverCrops] = useState([]);
  const [cashCropPlantingDate, setCashCropPlantingDate] = useState(null);
  const [cashCropHarvestingDate, setCashCropHarvestingDate] = useState(null);
  const [coverCropPlantingDate, setCoverCropPlantingDate] = useState(null);
  const [coverCropTerminationDate, setCoverCropTerminationDate] = useState(null);
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

  // Reset dates start date > end date
  useEffect(() => {
    if (coverCropPlantingDate && coverCropTerminationDate && dayjs(coverCropPlantingDate) > dayjs(coverCropTerminationDate)) {
      setCoverCropTerminationDate(null);
      setCashCropPlantingDate(null);
      setCashCropHarvestingDate(null);
    }
    if (coverCropTerminationDate && cashCropPlantingDate && dayjs(coverCropTerminationDate) > dayjs(cashCropPlantingDate)) {
      setCashCropPlantingDate(null);
      setCashCropHarvestingDate(null);
    }
    if (cashCropHarvestingDate && cashCropPlantingDate && dayjs(cashCropPlantingDate) > dayjs(cashCropHarvestingDate)) {
      setCashCropHarvestingDate(null);
    }
  }, [cashCropPlantingDate, cashCropHarvestingDate, coverCropPlantingDate, coverCropTerminationDate]);

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
    if (!program || !grower || !farm || !field || !cashCrop || !coverCrops || coverCrops.length < 1
      || !cashCropPlantingDate || !cashCropHarvestingDate || !coverCropPlantingDate || !coverCropTerminationDate) {
      alert('Please fill in all the fields');
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
        cashCrop,
        coverCrop: coverCrops,
        geometry: finalGeometry,
        cashCropPlantingDate,
        cashCropHarvestingDate,
        coverCropPlantingDate,
        coverCropTerminationDate,
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
                renderInput={(params) => <PSATextField {...params} label="Select or enter a Grower name" />}
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
                renderInput={(params) => <PSATextField {...params} label="Select or enter a Farm name" />}
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
                renderInput={(params) => <PSATextField {...params} label="Select or enter a Field name" />}
              />
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#60802D', mt: 1 }}>
            Crop Details
          </Typography>

          <Grid container spacing={2}>
            {/* <Grid item xs={12} md={4}>
              <Autocomplete
                freeSolo
                options={SEASONS}
                value={season}
                onChange={(e, val) => setSeason(val)}
                onInputChange={(e, val) => setSeason(val)}
                renderInput={(params) => <PSATextField {...params} label="Season" />}
              />
            </Grid> */}

            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={COVER_CROP_OPTIONS}
                value={coverCrops}
                onChange={(e, val) => setCoverCrops(val)}
                renderInput={(params) => (
                  <PSATextField {...params} label="What cover crop species are planted in this field?" />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={CASH_CROP_OPTIONS}
                value={cashCrop}
                onChange={(e, val) => setCashCrop(val)}
                renderInput={(params) => <PSATextField {...params} label="What cash crop will be planted next?" />}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6} xl={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Cover Crop Planting Date"
                  value={coverCropPlantingDate ? dayjs(coverCropPlantingDate) : null}
                  onChange={(newValue) => {
                    setCoverCropPlantingDate(newValue ? newValue.format('YYYY-MM-DD') : null);
                    return null;
                  }}
                  sx={{ width: '100%' }}

                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Cover Crop Termination Month"
                  views={['year', 'month']}
                  openTo="month"
                  format="YYYY-MM"
                  minDate={dayjs(coverCropPlantingDate)}
                  value={coverCropTerminationDate ? dayjs(coverCropTerminationDate) : null}
                  onChange={(newValue) => {
                    setCoverCropTerminationDate(newValue ? newValue.endOf('month').format('YYYY-MM-DD') : null);
                    return null;
                  }}
                  sx={{ width: '100%' }}

                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Cash Crop Planting Month"
                  views={['year', 'month']}
                  openTo="month"
                  format="YYYY-MM"
                  minDate={dayjs(coverCropTerminationDate).add(1, 'day')}
                  value={cashCropPlantingDate ? dayjs(cashCropPlantingDate) : null}
                  onChange={(newValue) => {
                    setCashCropPlantingDate(newValue ? newValue.startOf('month').format('YYYY-MM-DD') : null);
                    return null;
                  }}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6} xl={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Cash Crop Harvest Month"
                  views={['year', 'month']}
                  openTo="month"
                  format="YYYY-MM"
                  minDate={dayjs(cashCropPlantingDate)}
                  value={cashCropHarvestingDate ? dayjs(cashCropHarvestingDate) : null}
                  onChange={(newValue) => {
                    setCashCropHarvestingDate(newValue ? newValue.endOf('month').format('YYYY-MM-DD') : null);
                    return null;
                  }}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          <Typography variant="h4" align="center">
            Where is your Field located?
          </Typography>
          <Typography variant="h6" align="center">
            Enter your address, zip code, or GPS coordinates into the map search bar. If you
            know your exact coordinates, you can enter them separated by a comma (ex. 37.7,
            -80.2). You can also click the
            {gpsIcon}
            button to use your device&apos;s current location.
          </Typography>

          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            You can draw the field boundaries using the polygon tool
            {polygonIcon}
            (Click twice or press enter to finish).
            Alternatively, upload a shape file or GeoJSON of your field boundaries.
          </Typography>

          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            You can also use the
            {fieldIcon}
            to guess the field boundaries of your current marker location. When clicked
            it will populate the map with the USDA Crop Sequence Boundary for your field if one exists.
            You can double click inside the field to edit the boundaries.
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
              hasFindField
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
              disabled={isSaving || !program || !grower || !farm || !field || !cashCrop || !coverCrops || coverCrops.length < 1
                || !cashCropPlantingDate || !cashCropHarvestingDate || !coverCropPlantingDate || !coverCropTerminationDate
                || !features || features.length < 1}
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
