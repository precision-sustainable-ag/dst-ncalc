/* eslint-disable no-underscore-dangle */
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Autocomplete,
  Box,
  CircularProgress,
  Grid, Stack, SvgIcon, Tab, Tabs, Typography, useMediaQuery,
} from '@mui/material';
import { PSAButton, PSAReduxMap, PSATextField } from 'shared-react-components/src';
import { useDispatch, useSelector } from 'react-redux';
import shpjs from 'shpjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { get, set } from '../../store/redux-autosetters';
import { mapboxToken } from '../../utils/keys';
import { geometriesToFeatures, processGeometries, validateAndProcessGeoJSON } from '../../utils/geojsonUtils';
import { privateApi } from '../../utils/apiClient';
import { handleError } from '../../utils/apiError';
import {
  APPLIED_MAPS_ROLES, getRoles, hasAccess, isUserAdmin, isUserSuperAdmin,
} from '../../utils/roles';

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

// Maps each route to a tab index so the Tabs component stays in sync with the URL
const PATH_TO_TAB = {
  '/field': 0,
  '/editfield': 1,
  '/viewfield': 2,
  '/appliedmaps': 3,
};

const AddField = () => {
  const { user, isAuthenticated } = useAuth0();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isEdit = location.pathname === '/editfield';
  const isView = location.pathname === '/viewfield';
  const currentTab = PATH_TO_TAB[location.pathname] ?? 0;

  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const COVER_CROP_OPTIONS = useSelector(get.coverCropList) || [];
  const CASH_CROP_OPTIONS = useSelector(get.cashCropList) || [];

  // FORM DATA STATE VARIABLES
  const [programGroupLabel, setProgramGroupLabel] = useState(null);
  const [group, setGroup] = useState(null);
  const [grower, setGrower] = useState(null);
  const [farm, setFarm] = useState(null);
  const [field, setField] = useState(null);
  const [seasonsData, setSeasonsData] = useState([]);
  const [comments, setComments] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // MAP STATE VARIABLES
  const defaultLat = useSelector(get.lat);
  const defaultLon = useSelector(get.lon);
  const [address, setAddress] = useState({});
  const [zoom, setZoom] = useState(16);
  const [features, setFeatures] = useState(null);
  const [latLon, setLatLon] = useState([defaultLat, defaultLon]);
  const [bounds, setBounds] = useState(null);

  // DATA FOR ALL THE FIELDS
  const programGroups = useSelector(get.programGroups);
  const [allFields, setAllFields] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [refreshOptions, setRefreshOptions] = useState(false);

  // SELECTED FIELD (USED FOR EDIT/VIEW FIELD METADATA)
  const [selectedField, setSelectedField] = useState(null);

  const roles = getRoles(user);
  const isAdmin = isUserAdmin(roles);
  const isSuperAdmin = isUserSuperAdmin(roles);
  const showAppliedMaps = hasAccess(roles, APPLIED_MAPS_ROLES);
  const availableGroups = [...new Set((programGroups || []).map((pg) => pg.groupName))];
  const allowedGroups = (isSuperAdmin || isAdmin)
    ? availableGroups
    : availableGroups.filter((role) => roles.includes(role));

  const isTwoSeasons = programGroupLabel?.seasonsPerEntry === 2;
  const isSeasonsValid = seasonsData.length > 0 && seasonsData.every((s) => {
    // Start date is valid if it has a value (it can be NULL if it is 'winter' AND the program expects 2 seasons)
    const isStartDateValid = s.startDate || (s.season === 'winter' && isTwoSeasons);

    // End date and crops are always required
    return isStartDateValid && s.endDate && s.crops.length > 0;
  });
  const isEmailValid = email && email !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const updateProperties = (properties) => {
    setAddress(properties?.address);
    setZoom(properties?.zoom);
    setFeatures(properties?.features);
    setLatLon([properties?.lat, properties?.lon]);
  };

  const fetchProgamGroups = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setLoadingOptions(true);
        const url = 'program-config';
        const response = await privateApi.get(url);
        dispatch(set.programGroups(response?.data?.data));
      } catch (error) {
        handleError(error, dispatch);
      } finally {
        setLoadingOptions(false);
      }
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    fetchProgamGroups();
  }, [fetchProgamGroups]);

  const fetchOptions = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setLoadingOptions(true);
        const url = isEdit ? '/fields-identifiers?mode=edit' : '/fields-identifiers';
        const response = await privateApi.get(url);
        setAllFields(response.data);
      } catch (error) {
        handleError(error, dispatch);
      } finally {
        setLoadingOptions(false);
      }
    }
  }, [dispatch, isAuthenticated, isEdit]);

  useEffect(() => {
    fetchOptions();
  }, [isEdit, fetchOptions]);

  useEffect(() => {
    if (refreshOptions) {
      setRefreshOptions(false);
      fetchOptions();
    }
  }, [refreshOptions, fetchOptions]);

  // Initialize dynamic seasons for a new field when a program is selected
  useEffect(() => {
    if (!selectedField && programGroupLabel?.seasons) {
      const seasonOrder = ['winter', 'summer'];
      const availableSeasons = Object.keys(programGroupLabel.seasons).sort(
        (a, b) => seasonOrder.indexOf(a) - seasonOrder.indexOf(b),
      );

      if (programGroupLabel.seasonsPerEntry === 2) {
        const initialSeasons = availableSeasons.map((seasonName) => ({
          season: seasonName,
          startDate: null,
          endDate: null,
          crops: [],
        }));
        setSeasonsData(initialSeasons);
      } else if (programGroupLabel.seasonsPerEntry === 1) {
        const initialSeasons = [{
          season: availableSeasons[0],
          startDate: null,
          endDate: null,
          crops: [],
        }];
        setSeasonsData(initialSeasons);
      }
    }
  }, [programGroupLabel, selectedField]);

  // Function to clear all the form values
  const resetForm = () => {
    setSelectedField(null);
    setProgramGroupLabel(null);
    setGroup(null);
    setGrower(null);
    setFarm(null);
    setField(null);
    setSeasonsData([]);
    setComments('');
    setEmail('');
    setFeatures([]);
    setAddress({});
    setZoom(16);
  };

  useEffect(() => {
    if (!selectedField) {
      resetForm();
      return;
    }

    const programGroup = programGroups.find(
      (option) => option.groupName === selectedField.properties.groupName && option.programName === selectedField.properties.programName,
    );

    setProgramGroupLabel(programGroup);
    setGroup(selectedField?.properties.groupName);
    setGrower(selectedField?.properties.growerName);
    setFarm(selectedField?.properties.farmName);
    setField(selectedField?.properties.fieldName);
    setSeasonsData(selectedField?.properties.seasons || []);
    setComments(selectedField?.properties.comments || '');
    setEmail(selectedField?.properties.email || '');
    geometriesToFeatures(selectedField?.geometry, setFeatures, setLatLon, setBounds);
  }, [selectedField, programGroups]);

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
    setSeasonsData([]);
    setProgramGroupLabel(newVal);
    setGroup(newVal ? newVal.groupName : null);
  };

  const handleGrowerChange = (newVal) => {
    setGrower(newVal);
  };

  const handleFarmChange = (newVal) => {
    setFarm(newVal);
  };

  const handleSeasonChange = (index, fieldKey, value) => {
    const updatedSeasons = [...seasonsData];
    updatedSeasons[index][fieldKey] = value;

    // Date range reset logic
    if (fieldKey === 'startDate' && updatedSeasons[index].endDate && dayjs(value) > dayjs(updatedSeasons[index].endDate)) {
      updatedSeasons[index].endDate = null;
    }
    if (fieldKey === 'endDate' && updatedSeasons[index].startDate && dayjs(value) < dayjs(updatedSeasons[index].startDate)) {
      updatedSeasons[index].startDate = null;
    }

    setSeasonsData(updatedSeasons);
  };

  const preparePayload = (finalGeometry) => {
    const formattedSeasons = seasonsData.map((s, idx) => {
      const seasonPayload = {
        year: s.startDate ? dayjs(s.startDate).year() : dayjs().year(),
        season: s.season,
        startDate: s.startDate,
        endDate: s.endDate,
        crops: s.crops,
      };

      // Inject root comments into the first season array block as required by schema
      if (idx === 0 && comments) {
        seasonPayload.comments = comments;
      }
      return seasonPayload;
    });

    return {
      programName: programGroupLabel?.programName,
      groupName: group,
      farmName: farm,
      growerName: grower,
      fieldName: field,
      seasons: formattedSeasons,
      geometry: finalGeometry,
    };
  };

  const handleSaveField = async () => {
    // Validate form fields
    // coverCropPlantingDate is temporarily not a required field
    if (!group || !grower || !farm || !field || !isSeasonsValid) {
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
      handleError(null, dispatch, 'Please draw a shape or upload a file.');
      return;
    }

    setIsSaving(true);

    try {
      const payload = preparePayload(finalGeometry);

      await privateApi.post('/fields', payload);

      resetForm();
      setAllFields([]);
      setRefreshOptions(true);

      dispatch(set.actionModal({
        open: true,
        type: 'info',
        title: 'Field Saved',
        message: 'Field saved successfully!',
      }));
    } catch (error) {
      handleError(error, dispatch);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateField = async () => {
    // Validate form fields
    if (!group || !grower || !farm || !field || !isSeasonsValid) {
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
      handleError(null, dispatch, 'Please draw a shape or upload a file.');
      return;
    }

    setIsSaving(true);

    try {
      const fieldId = selectedField?._id;
      const payload = preparePayload(finalGeometry);
      if (isSuperAdmin && isEdit) payload.email = email;

      await privateApi.put(`/fields/${fieldId}`, payload);

      resetForm();
      setAllFields([]);
      setRefreshOptions(true);

      dispatch(set.actionModal({
        open: true,
        type: 'info',
        title: 'Field Updated',
        message: 'Field updated successfully!',
      }));
    } catch (error) {
      handleError(error, dispatch);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteField = async () => {
    dispatch(set.actionModal({ open: false }));
    setIsDeleting(true);

    try {
      const fieldId = selectedField?._id;
      const response = await privateApi.delete(`/fields/${fieldId}`);

      if (response.status === 200) {
        resetForm();
        setAllFields([]);
        setRefreshOptions(true);

        dispatch(set.actionModal({
          open: true,
          type: 'info',
          title: 'Field Deleted',
          message: 'Field deleted successfully!',
        }));
      }
    } catch (error) {
      handleError(error, dispatch);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDelete = () => {
    dispatch(set.actionModal({
      open: true,
      type: 'confirm',
      onConfirm: handleDeleteField,
      title: 'Delete Field',
      message: 'Are you sure you want to delete this field? This will deactivate the current seasonal data.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    }));
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
          validateAndProcessGeoJSON(geojson, setFeatures, setLatLon, setBounds);
        } catch (err) {
          handleError(err, dispatch, 'Error parsing Shapefile. Please ensure it is a valid .zip containing .shp, .shx, and .dbf files.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      handleError(null, dispatch, 'Unsupported file type. Please upload .geojson or .shp');
    }
  };

  // Shared disabled logic: inputs lock when a field hasn't been selected yet in edit/view mode
  const inputDisabled = isView || (isEdit && !selectedField);

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
              resetForm(); navigate(Object.keys(PATH_TO_TAB)[newTab]);
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
          {(isEdit || isView)
            ? (
              <>
                <Typography variant="h4" align="center" color="primary" sx={{ fontWeight: 'bold' }}>
                  {isEdit ? 'Edit Field Details' : 'View Field Details'}
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

          {/* FIELD METADATA */}
          <Stack gap={1}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }} color="primary">
              Field Metadata
            </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <Box sx={{ flex: 1 }}>
                <Autocomplete
                  key={group}
                  freeSolo={isEdit}
                  loading={loadingOptions}
                  options={programGroups.filter((option) => groupOptions.includes(option.groupName))}
                  value={programGroupLabel}
                  getOptionLabel={(option) => option?.displayLabel || ''}
                  onChange={(e, val) => handleGroupChange(val)}
                  renderInput={(params) => <PSATextField {...params} label="Select a Program name" required />}
                  readOnly={inputDisabled}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Autocomplete
                  key={group}
                  freeSolo
                  loading={loadingOptions}
                  options={growerOptions}
                  value={grower}
                  onChange={(e, val) => handleGrowerChange(val)}
                  onInputChange={(e, newInputValue) => handleGrowerChange(newInputValue)}
                  renderInput={(params) => <PSATextField {...params} label="Select or enter a Grower name" required />}
                  readOnly={inputDisabled}
                />
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <Box sx={{ flex: 1 }}>
                <Autocomplete
                  key={grower}
                  freeSolo
                  loading={loadingOptions}
                  options={farmOptions}
                  value={farm}
                  onChange={(e, val) => handleFarmChange(val)}
                  onInputChange={(e, newInputValue) => handleFarmChange(newInputValue)}
                  renderInput={(params) => <PSATextField {...params} label="Select or enter a Farm name" required />}
                  readOnly={inputDisabled}
                  sx={{ flex: 1 }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Autocomplete
                  key={farm}
                  freeSolo
                  loading={loadingOptions}
                  options={fieldOptions}
                  value={field}
                  onChange={(e, val) => setField(val)}
                  onInputChange={(e, newInputValue) => setField(newInputValue)}
                  renderInput={(params) => <PSATextField {...params} label="Select or enter a Field name" required />}
                  readOnly={inputDisabled}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Stack>
          </Stack>

          {/* DYNAMIC SEASONAL DETAILS */}
          {seasonsData.map((seasonItem, index) => {
            const availableSeasons = Object.keys(programGroupLabel?.seasons || {});
            const showSeasonDropdown = programGroupLabel?.seasonsPerEntry === 1 && availableSeasons.length > 1;

            const seasonConfigCrops = programGroupLabel?.seasons?.[seasonItem.season] || [];

            // Build relevant dropdown list based on config requirements
            let cropOptions = [];
            const hasCover = seasonConfigCrops.includes('cover');
            const hasCash = seasonConfigCrops.includes('cash');

            if (hasCover) cropOptions = [...cropOptions, ...COVER_CROP_OPTIONS];
            if (hasCash) cropOptions = [...cropOptions, ...CASH_CROP_OPTIONS];

            let cropLabel = '';
            if (hasCover && hasCash) {
              cropLabel = seasonItem.season
                ? seasonItem.season.charAt(0).toUpperCase() + seasonItem.season.slice(1)
                : 'Crop';
            } else if (hasCover) cropLabel = 'Cover Crop';
            else if (hasCash) cropLabel = 'Cash Crop';

            const startLabel = cropLabel === 'Cover Crop' ? 'Planting Date' : 'Planting Month';
            const endLabel = cropLabel === 'Cash Crop' ? 'Harvest Month' : 'Termination Month';

            const prevSeasonEndDate = index > 0 ? seasonsData[index - 1]?.endDate : null;
            const minStartDate = (isTwoSeasons && prevSeasonEndDate) ? dayjs(prevSeasonEndDate).startOf('month') : null;
            const minEndDate = seasonItem.startDate ? dayjs(seasonItem.startDate) : null;

            const isFirstOfTwo = isTwoSeasons && index === 0;

            return (
              <Stack key={seasonItem.season} gap={1}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }} color="primary">
                  {cropLabel}
                  {' '}
                  {hasCash && hasCover ? 'Season ' : ''}
                  Details
                </Typography>

                {showSeasonDropdown && (
                  <Autocomplete
                    options={availableSeasons}
                    getOptionLabel={(option) => (option ? option.charAt(0).toUpperCase() + option.slice(1) : '')}
                    value={seasonItem.season || null}
                    onChange={(e, val) => {
                      // reset seasons array
                      const updatedSeasons = [...seasonsData];
                      updatedSeasons[index] = {
                        ...updatedSeasons[index],
                        season: val || '',
                        crops: [],
                        startDate: null,
                        endDate: null,
                      };
                      setSeasonsData(updatedSeasons);
                    }}
                    renderInput={(params) => (
                      <PSATextField {...params} label="Select Season" required />
                    )}
                    disabled={inputDisabled}
                    disableClearable
                    sx={{ width: { xs: '100%', md: '50%' } }}
                  />
                )}

                <Autocomplete
                  multiple
                  options={cropOptions}
                  value={seasonItem.crops || []}
                  onChange={(e, val) => handleSeasonChange(index, 'crops', val)}
                  renderInput={(params) => (
                    <PSATextField {...params} label={`What crops are planted in the ${cropLabel} season?`} required />
                  )}
                  readOnly={inputDisabled}
                  sx={{ mb: 1 }}
                />

                <Stack direction={{ xs: 'column', md: 'row' }} columnGap={1} rowGap={2}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label={`${cropLabel} ${startLabel}`}
                      {...(!isFirstOfTwo ? {
                        views: ['year', 'month'],
                        openTo: 'month',
                        format: 'YYYY-MM',
                      } : {})}
                      minDate={minStartDate}
                      value={seasonItem.startDate ? dayjs(seasonItem.startDate) : null}
                      onChange={(newValue) => {
                        let formattedDate;
                        if (isFirstOfTwo) formattedDate = newValue ? newValue.format('YYYY-MM-DD') : null;
                        else formattedDate = newValue ? newValue.startOf('month').format('YYYY-MM-DD') : null;
                        handleSeasonChange(index, 'startDate', formattedDate);
                      }}
                      slotProps={{
                        textField: { required: !isFirstOfTwo },
                        field: { clearable: isFirstOfTwo },
                      }}
                      readOnly={inputDisabled}
                      sx={{ flex: 1 }}
                    />
                  </LocalizationProvider>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label={`${cropLabel} ${endLabel}`}
                      views={['year', 'month']}
                      openTo="month"
                      format="YYYY-MM"
                      minDate={minEndDate}
                      value={seasonItem.endDate ? dayjs(seasonItem.endDate) : null}
                      onChange={(newValue) => {
                        const formattedDate = newValue ? newValue.endOf('month').format('YYYY-MM-DD') : null;
                        handleSeasonChange(index, 'endDate', formattedDate);
                      }}
                      slotProps={{ textField: { required: true } }}
                      readOnly={inputDisabled}
                      sx={{ flex: 1 }}
                    />
                  </LocalizationProvider>
                </Stack>
              </Stack>
            );
          })}

          <Box sx={{ width: { xs: '100%', md: '50%' } }}>
            <PSATextField
              label="Additional comments (optional)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              fullWidth
              autoComplete="off"
              disabled={inputDisabled}
              sx={{
                '& .MuiInputBase-root': { padding: 1 },
              }}
            />
          </Box>

          {isSuperAdmin && isEdit && (
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <PSATextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                autoComplete="off"
                error={!isEmailValid}
                disabled={inputDisabled}
                sx={{
                  '& .MuiInputBase-root': { padding: 1 },
                }}
              />
            </Box>
          )}

          {/* FIELD LOCATION */}
          <Stack gap={1}>
            <Typography variant="h5" align="center" sx={{ fontWeight: 'bold' }} color="primary">
              Where is your Field located?
            </Typography>
            <Typography variant="h6" align="center">
              Enter your address, zip code, or GPS coordinates into the map search bar. If you
              know your exact coordinates, you can enter them separated by a comma (ex. 37.7,
              -80.2). You can also click the
              {gpsIcon}
              button to use your device&apos;s current location.
            </Typography>

            <Typography variant="h6" align="center">
              You can draw the field boundaries using the polygon tool
              {polygonIcon}
              (Click twice or press enter to finish).
              Alternatively, upload a shape file or GeoJSON of your field boundaries.
            </Typography>

            {!isEdit && !isView && (
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
                    padding: '0.8rem 1.5rem',
                    borderRadius: '2rem',
                  }}
                />
              </Stack>
            )}

            <Box sx={{ position: 'relative' }}>
              <PSAReduxMap
                key={location.pathname}
                setProperties={updateProperties}
                initWidth="100%"
                initHeight="380px"
                initLat={latLon[0]}
                initLon={latLon[1]}
                initStartZoom={zoom}
                initFeatures={features}
                initAddress={address?.address}
                initBounds={bounds}
                hasSearchBar={!isEdit && !isView}
                hasClear={!isEdit && !isView}
                hasMarker
                hasMarkerPopup
                hasMarkerMovable
                hasNavigation
                hasFullScreen
                hasGeolocate={!isEdit && !isView}
                hasDrawing={!isEdit && !isView}
                scrollZoom
                dragRotate
                dragPan
                keyboard
                doubleClickZoom={false}
                touchZoomRotate
                mapboxToken={mapboxToken}
              />
            </Box>
          </Stack>

          {!isView && (
            <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 2 }}>
              <PSAButton
                // eslint-disable-next-line no-nested-ternary
                title={isSaving ? <CircularProgress size={24} color="inherit" /> : isEdit ? 'Update Field' : 'Save Field'}
                variant="contained"
                onClick={isEdit ? handleUpdateField : handleSaveField}
                disabled={isSaving || isDeleting || !group || !grower || !farm || !field || !isSeasonsValid
                  || (isEdit && isSuperAdmin && !isEmailValid)
                  || !features || features.length < 1}
                sx={{
                  minWidth: '150px',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '2rem',
                }}
              />
              {isEdit
              && (
              <PSAButton
                title={isDeleting ? <CircularProgress size={24} color="inherit" /> : 'Delete Field'}
                variant="contained"
                onClick={handleConfirmDelete}
                disabled={isSaving || isDeleting || !selectedField}
                color="error"
                sx={{
                  minWidth: '150px',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '2rem',
                }}
              />
              )}
            </Stack>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default AddField;
