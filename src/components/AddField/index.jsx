/* eslint-disable no-underscore-dangle */
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
import { useDispatch, useSelector } from 'react-redux';
import shpjs from 'shpjs';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { get, set } from '../../store/redux-autosetters';
import { mapboxToken, ncalcApiUrl } from '../../utils/keys';
import { geometriesToFeatures, processGeometries, validateAndProcessGeoJSON } from '../../utils/geojsonUtils';

const API_BASE_URL = ncalcApiUrl;

// Roles are assigned in auth0 and included in the user's ID token. They are the 'groups' that the user has access to.
const ROLES = ['NIFA-Soy', 'Willard', 'Growmark'];

const PROGRAM_GROUP_OPTIONS = [
  { label: 'Willard - RCPP', group: 'Willard', program: 'RCPP' },
  { label: 'Willard - RCPP Report Only', group: 'Willard', program: 'RCPP-Report-Only' },
  { label: 'Growmark - RCPP', group: 'Growmark', program: 'RCPP' },
  { label: 'Growmark - RCPP Report Only', group: 'Growmark', program: 'RCPP-Report-Only' },
  { label: 'NIFA-Soy', group: 'NIFA-Soy', program: 'NIFA-Soy' },
];

// TODO: Placeholder values - to be updated
const CASH_CROP_OPTIONS = ['Corn', 'Soybeans', 'Wheat', 'Cotton'];

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

const AddField = () => {
  const {
    user, isAuthenticated, getAccessTokenSilently,
  } = useAuth0();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isEdit = location.pathname === '/editfield';

  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const COVER_CROP_OPTIONS = useSelector(get.species) || [];

  // FORM DATA STATE VARIABLES
  const [programGroupLabel, setProgramGroupLabel] = useState(null);
  const [group, setGroup] = useState(null);
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
  const [comments, setComments] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // SELECTED FIELD (USED FOR EDIT FIELD METADATA)
  const [selectedField, setSelectedField] = useState(null);

  const roles = user?.['https://dst-ncalc.org/claims'] || [];
  const isAdmin = roles.includes('admin');
  const allowedGroups = isAdmin
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
    // if (coverCropTerminationDate && cashCropPlantingDate && dayjs(coverCropTerminationDate) > dayjs(cashCropPlantingDate)) {
    //   setCashCropPlantingDate(null);
    //   setCashCropHarvestingDate(null);
    // }
    if (cashCropHarvestingDate && cashCropPlantingDate && dayjs(cashCropPlantingDate) > dayjs(cashCropHarvestingDate)) {
      setCashCropHarvestingDate(null);
    }
  }, [cashCropPlantingDate, cashCropHarvestingDate, coverCropPlantingDate, coverCropTerminationDate]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const token = await getAccessTokenSilently();
        const url = isEdit ? `${API_BASE_URL}/fields-identifiers?mode=edit` : `${API_BASE_URL}/fields-identifiers`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllFields(response.data);
      } catch (error) {
        dispatch(set.actionModal({
          open: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to load dropdown options. Please refresh the page or try again later.',
        }));
      } finally {
        setLoadingOptions(false);
      }
    };

    if (isAuthenticated) {
      fetchOptions();
    }
  }, [isAuthenticated, getAccessTokenSilently, isEdit, dispatch]);

  useEffect(() => {
    if (!selectedField) return;

    const programGroup = PROGRAM_GROUP_OPTIONS.find(
      (option) => option.group === selectedField.properties.groupName && option.program === selectedField.properties.programName,
    );

    setProgramGroupLabel(programGroup);
    setGroup(selectedField?.properties.groupName);
    setGrower(selectedField?.properties.growerName);
    setFarm(selectedField?.properties.farmName);
    setField(selectedField?.properties.fieldName);
    setCoverCrops(selectedField?.properties.coverCrop);
    setCashCrop(selectedField?.properties.cashCrop);
    setCoverCropPlantingDate(selectedField?.properties.coverCropPlantingDate || null);
    setCoverCropTerminationDate(selectedField?.properties.coverCropTerminationDate || null);
    setCashCropPlantingDate(selectedField?.properties.cashCropPlantingDate || null);
    setCashCropHarvestingDate(selectedField?.properties.cashCropHarvestingDate || null);
    setComments(selectedField?.properties.comments);
    geometriesToFeatures(selectedField?.geometry, setFeatures, setLatLon, setBounds);
  }, [selectedField]);

  // Reset states when switching between create and edit
  useEffect(() => {
    if (isEdit && selectedField) return;

    setProgramGroupLabel(null);
    setGroup(null);
    setGrower(null);
    setFarm(null);
    setField(null);
    setCoverCrops([]);
    setCashCrop(null);
    setCoverCropPlantingDate(null);
    setCoverCropTerminationDate(null);
    setCashCropPlantingDate(null);
    setCashCropHarvestingDate(null);
    setComments(null);
    setFeatures([]);
    setAddress({});
    setZoom(13);
  }, [isEdit, selectedField]);

  const {
    groupOptions, growerOptions, farmOptions, fieldOptions,
  } = useMemo(() => {
    // Helper to extract unique values from a filtered list
    const getUnique = (list, key) => [...new Set(list.map((item) => item.properties[key]).filter(Boolean))].sort();

    // A. Programs: Show programs list according to the user's role
    const uniqueGroups = allowedGroups;

    // B. Growers: Filter master list by Selected Program
    const validGrowersList = allFields.filter((f) => !group || f.properties.groupName?.toLowerCase() === group.toLowerCase());
    const uniqueGrowers = getUnique(validGrowersList, 'growerName');

    // C. Farms: Filter by Selected Program AND Selected Grower
    const validFarmsList = validGrowersList.filter((f) => !grower || f.properties.growerName?.toLowerCase() === grower.toLowerCase());
    const uniqueFarms = getUnique(validFarmsList, 'farmName');

    // D. Fields: Filter by Program AND Grower AND Farm
    const validFieldsList = validFarmsList.filter((f) => !farm || f.properties.farmName?.toLowerCase() === farm.toLowerCase());
    const uniqueFields = getUnique(validFieldsList, 'fieldName');

    return {
      groupOptions: uniqueGroups,
      growerOptions: uniqueGrowers,
      farmOptions: uniqueFarms,
      fieldOptions: uniqueFields,
    };
  }, [allowedGroups, allFields, group, grower, farm]);

  const handleGroupChange = (newVal) => {
    setProgramGroupLabel(newVal);
    setGroup(newVal ? newVal.group : null);
  };

  const handleGrowerChange = (newVal) => {
    setGrower(newVal);
  };

  const handleFarmChange = (newVal) => {
    setFarm(newVal);
  };

  const handleSaveField = async () => {
    // Validate form fields
    // coverCropPlantingDate is temporarily not a required field
    if (!group || !grower || !farm || !field || !cashCrop || !coverCrops || coverCrops.length < 1
      || !cashCropPlantingDate || !cashCropHarvestingDate || !coverCropTerminationDate) {
      alert('Please fill in all the fields');
      dispatch(set.actionModal({
        open: true,
        type: 'error',
        title: 'Missing required fields',
        message: 'Please fill in all the fields',
      }));
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
        programName: programGroupLabel?.program,
        groupName: group,
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
        comments,
      };

      await axios.post(`${API_BASE_URL}/fields`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setProgramGroupLabel(null);
      setGroup(null);
      setGrower(null);
      setFarm(null);
      setField(null);
      setFeatures(null);
      setComments(null);

      // alert('Field saved successfully!');
      dispatch(set.actionModal({
        open: true,
        type: 'info',
        title: 'Field Saved',
        message: 'Field saved successfully!',
      }));
      navigate('/home');
    } catch (error) {
      let message = '';
      if (error.response?.data?.message) {
        message = `Error: ${error.response.data.message}`;
      } else if (error.response) {
        message = `Error: ${error.response.data?.error || 'Failed to save field'}`;
      } else {
        message = 'Network error. Could not connect to server.';
      }
      dispatch(set.actionModal({
        open: true,
        type: 'error',
        title: 'Error',
        message,
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateField = async () => {
    // Validate form fields
    if (!group || !grower || !farm || !field || !cashCrop || !coverCrops || coverCrops.length < 1
      || !cashCropPlantingDate || !cashCropHarvestingDate || !coverCropTerminationDate) {
      dispatch(set.actionModal({
        open: true,
        type: 'error',
        title: 'Missing required fields',
        message: 'Please fill in all the fields',
      }));
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

      const fieldId = selectedField?._id;

      const payload = {
        programName: programGroupLabel?.program,
        groupName: group,
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
        comments,
      };

      await axios.put(`${API_BASE_URL}/fields/${fieldId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setProgramGroupLabel(null);
      setGroup(null);
      setGrower(null);
      setFarm(null);
      setField(null);
      setFeatures(null);

      // alert('Field updated successfully!');
      dispatch(set.actionModal({
        open: true,
        type: 'info',
        title: 'Field Updated',
        message: 'Field updated successfully!',
      }));
      navigate('/home');
    } catch (error) {
      let message = '';
      if (error.response?.data?.message) {
        message = `Error: ${error.response.data.message}`;
      } else if (error.response) {
        message = `Error: ${error.response.data?.error || 'Failed to update field'}`;
      } else {
        message = 'Network error. Could not connect to server.';
      }
      dispatch(set.actionModal({
        open: true,
        type: 'error',
        title: 'Error',
        message,
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteField = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this field? This will deactivate the current seasonal data.');

    if (!confirmDelete) return;

    setIsDeleting(true);

    try {
      const token = await getAccessTokenSilently();

      const fieldId = selectedField?._id;
      const response = await axios.delete(`${API_BASE_URL}/fields/${fieldId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setSelectedField(null);
        // alert('Field deactivated successfully.');
        dispatch(set.actionModal({
          open: true,
          type: 'info',
          title: 'Field Deleted',
          message: 'Field deleted successfully!',
        }));
        navigate('/home');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error deleting field. Please try again.';
      // alert(errorMessage);
      dispatch(set.actionModal({
        open: true,
        type: 'error',
        title: 'Error',
        errorMessage,
      }));
    } finally {
      setIsDeleting(false);
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
          boxShadow: 5,
          borderRadius: 5,
          opacity: 0.9,
          backgroundColor: 'white',
        }}
      >
        <Stack
          direction="row"
          sx={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
          }}
        >
          <PSAButton
            title={isEdit ? 'Go To Create Field' : 'Go To Edit Field'}
            variant="contained"
            onClick={isEdit ? () => navigate('/field') : () => navigate('/editfield')}
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

        <Stack spacing="1.5rem">
          {isEdit
            ? (
              <>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#60802D' }}>
                  Edit Field Details
                </Typography>

                <Autocomplete
                  loading={loadingOptions}
                  loadingText="Loading fields..."
                  options={allFields}
                  value={selectedField}
                  key={`${allFields.groupName}-${allFields.growerName}`}
                  onChange={(event, newValue) => {
                    setSelectedField(newValue);
                  }}
                  getOptionLabel={(option) => {
                    const p = option.properties;
                    return `${p.programName} / ${p.groupName} / ${p.growerName} / ${p.farmName} / ${p.fieldName}`;
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Stack>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {option.properties.fieldName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {option.properties.programName}
                          {' - '}
                          {option.properties.groupName}
                          {' - '}
                          {option.properties.growerName}
                          {' - '}
                          {option.properties.farmName}
                          {/* {' - '}
                      {option.properties.season} */}
                        </Typography>
                      </Stack>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <PSATextField
                      {...params}
                      label="Select Field (Program / Group / Grower / Farm / Field)"
                      placeholder="Type to search..."
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingOptions ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </>
            )
            : null}

          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#60802D' }}>
            Field Metadata
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                key={group}
                freeSolo={isEdit}
                loading={loadingOptions}
                options={PROGRAM_GROUP_OPTIONS.filter((option) => groupOptions.includes(option.group))}
                value={programGroupLabel}
                getOptionLabel={(option) => option?.label || ''}
                onChange={(e, val) => handleGroupChange(val)}
                renderInput={(params) => <PSATextField {...params} label="Select a Program name" />}
                disabled={isEdit && !selectedField}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                key={group}
                freeSolo
                loading={loadingOptions}
                options={growerOptions}
                value={grower}
                onChange={(e, val) => handleGrowerChange(val)}
                onInputChange={(e, newInputValue) => handleGrowerChange(newInputValue)}
                renderInput={(params) => <PSATextField {...params} label="Select or enter a Grower name" />}
                disabled={isEdit && !selectedField}
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
                disabled={isEdit && !selectedField}
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
                disabled={isEdit && !selectedField}
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
                disabled={isEdit && !selectedField}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={CASH_CROP_OPTIONS}
                value={cashCrop}
                onChange={(e, val) => setCashCrop(val)}
                renderInput={(params) => <PSATextField {...params} label="What cash crop will be planted next?" />}
                disabled={isEdit && !selectedField}
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
                  slotProps={{
                    field: { clearable: true, onClear: () => setCoverCropTerminationDate(null) },
                  }}
                  disabled={isEdit && !selectedField}
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
                  disabled={isEdit && !selectedField}
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
                  minDate={dayjs(coverCropTerminationDate).startOf('month')}
                  value={cashCropPlantingDate ? dayjs(cashCropPlantingDate) : null}
                  onChange={(newValue) => {
                    setCashCropPlantingDate(newValue ? newValue.startOf('month').format('YYYY-MM-DD') : null);
                    return null;
                  }}
                  disabled={isEdit && !selectedField}
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
                  disabled={isEdit && !selectedField}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <PSATextField
                label="Additional comments (optional)"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                fullWidth
                autoComplete="off"
                disabled={isEdit && !selectedField}
                sx={{
                  '& .MuiInputBase-root': { padding: 1 },
                }}
              />
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

          {!isEdit && (
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
          )}

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
              hasDrawing={!isEdit}
              scrollZoom
              dragRotate
              dragPan
              keyboard
              doubleClickZoom={false}
              touchZoomRotate
              mapboxToken={mapboxToken}
            />
          </Box>

          <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 2 }}>
            <PSAButton
              // eslint-disable-next-line no-nested-ternary
              title={isSaving ? <CircularProgress size={24} color="inherit" /> : isEdit ? 'Update Field' : 'Save Field'}
              variant="contained"
              onClick={isEdit ? handleUpdateField : handleSaveField}
              disabled={isSaving || isDeleting || !group || !grower || !farm || !field || !cashCrop || !coverCrops || coverCrops.length < 1
                || !cashCropPlantingDate || !cashCropHarvestingDate || !coverCropTerminationDate
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
            {isEdit
            && (
            <PSAButton
              title={isDeleting ? <CircularProgress size={24} color="inherit" /> : 'Delete Field'}
              variant="contained"
              onClick={handleDeleteField}
              disabled={isSaving || isDeleting || !selectedField}
              sx={{
                minWidth: '150px',
                color: 'white',
                padding: '0.8rem 1.5rem',
                borderRadius: '2rem',
                backgroundColor: '#D32F2F',
                '&:hover': {
                  backgroundColor: '#B71C1C',
                  textDecoration: 'underline',
                  boxShadow: '0px 2px 2px rgba(160, 160, 160, 0.3)',
                },
              }}
            />
            )}
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default AddField;
