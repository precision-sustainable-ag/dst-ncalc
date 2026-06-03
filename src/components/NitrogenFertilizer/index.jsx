/* eslint-disable no-nested-ternary */
/* eslint-disable operator-linebreak */
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Stack, Typography, Grid, useMediaQuery, Autocomplete, InputAdornment,
  Alert,
} from '@mui/material';
import { PSARadioButton, PSATextField } from 'shared-react-components/src';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import shpjs from 'shpjs';
import { useAuth0 } from '@auth0/auth0-react';
import { get, set } from '../../store/Store';
import Myslider from '../../shared/Slider';
import Help from '../../shared/Help';
import Required from '../../shared/Required';
import NavigateBar from '../../shared/Navigate';
import NavButton from '../../shared/Navigate/NavButton';
import { handleError } from '../../utils/apiError';
import { mergeFeatureCollections } from '../../utils/geojsonUtils';
import { publicApi } from '../../utils/apiClient';

const CONVERSION_FACTOR = 1.12085; // lb n/acre -> kg n/ha

const NitrogenFertilizer = () => {
  // const isDevelopOrLocal = window.location.hostname === 'localhost'
  //   || window.location.hostname === '127.0.0.1'
  //   || window.location.href.includes('develop');
  const {
    isAuthenticated, getAccessTokenSilently,
  } = useAuth0();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  //   const unit = useSelector(get.unit);
  const targetN = useSelector(get.targetN);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const sidedressFertilizationDate = useSelector(get.sidedressFertilizationDate);
  const [showSidedressDateWarning, setShowSidedressDateWarning] = useState(false);

  const [isFetching, setIsFetching] = useState(false);
  const fertilizers = useSelector(get.fertilizers);

  const fertilizerType = useSelector(get.fertilizerType);
  const granularFertilizer = useSelector(get.granularFertilizer);
  const otherGranularFertilizer = useSelector(get.otherGranularFertilizer);
  const liquidFertilizer = useSelector(get.liquidFertilizer);
  const otherLiquidFertilizer = useSelector(get.otherLiquidFertilizer);

  const inputMode = useSelector(get.inputMode);
  const hasFixedNRate = useSelector(get.hasFixedNRate);

  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const nitrogenSprayMap = useSelector(get.nitrogenSprayMap);
  const [properties, setProperties] = useState([]);
  const nitrogenSprayMapProperty = useSelector(get.nitrogenSprayMapProperty);

  const gridSize = useSelector(get.gridSize);

  const granularOptions = !isFetching
    ? [...fertilizers.filter((f) => f.type === 'granular').map((f) => f.name), 'Other']
    : [];

  const liquidOptions = !isFetching
    ? [...fertilizers.filter((f) => f.type === 'liquid').map((f) => f.name), 'Other']
    : [];

  const granularExists = fertilizerType === 'granular' &&
  fertilizers.some((f) => f.type === 'granular' &&
    f.name.toLowerCase() === otherGranularFertilizer.fertilizerName?.toLowerCase().trim());

  const liquidExists = fertilizerType === 'liquid' &&
  fertilizers.some((f) => f.type === 'liquid' &&
    f.name.toLowerCase() === otherLiquidFertilizer.fertilizerName?.toLowerCase().trim());

  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const isNextDisabled = (() => {
    if (!isSatelliteMode && !sidedressFertilizationDate) return true;
    if (granularExists || liquidExists) return true;

    // Fertilizer specific requirements
    if (fertilizerType === 'granular') {
      if (!granularFertilizer) return true;
      if (granularFertilizer === 'Other' && (!otherGranularFertilizer.fertilizerName || !otherGranularFertilizer.NPercent)) return true;
    } else if (fertilizerType === 'liquid') {
      if (!liquidFertilizer) return true;
      if (liquidFertilizer === 'Other' &&
        (!otherLiquidFertilizer.fertilizerName || !otherLiquidFertilizer.density || !otherLiquidFertilizer.NPercent)) return true;
    }

    // Rate specific requirements
    if (hasFixedNRate === 'fixed') {
      if (!targetN || targetN <= 0) return true;
    } else if (!nitrogenSprayMap || !nitrogenSprayMapProperty || fileName === '') return true;

    if (isSatelliteMode && (!gridSize || gridSize < 0.5 || gridSize > 5)) return true;

    return false;
  })();

  // Set default side dress planting date on mount if not set or invalid
  useEffect(() => {
    if (isSatelliteMode) return;
    if (!sidedressFertilizationDate) {
      dispatch(set.sidedressFertilizationDate(dayjs().format('YYYY-MM-DD')));
    }
  });

  // Show warning if sidedress date is before the cash crop planting date
  useEffect(() => {
    if (dayjs(sidedressFertilizationDate).isBefore(dayjs(cashCropPlantingDate))) setShowSidedressDateWarning(true);
    else setShowSidedressDateWarning(false);
  }, [sidedressFertilizationDate, cashCropPlantingDate]);

  useEffect(() => {
    const fetchFertilizers = async () => {
      try {
        setIsFetching(true);
        const response = await publicApi.get('fertilizers');
        dispatch(set.fertilizers(response.data?.data || []));
      } catch (err) {
        dispatch(set.fertilizers([]));
        handleError(err, dispatch, 'Failed to load list of fertilizers.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchFertilizers();
  }, [isAuthenticated, getAccessTokenSilently, dispatch]);

  useEffect(() => {
    let newMultiplier = 1;

    if (fertilizerType === 'granular') {
      const selected = fertilizers.find((f) => f.name === granularFertilizer);
      const nPercent = granularFertilizer === 'Other' ? parseFloat(otherGranularFertilizer.NPercent) / 100 || 0 : (selected?.n_percent || 0) / 100;

      newMultiplier = CONVERSION_FACTOR * nPercent;
    } else if (fertilizerType === 'liquid') {
      const selected = fertilizers.find((f) => f.name === liquidFertilizer);

      let nPercent = 0;
      let density = 0;

      if (liquidFertilizer === 'Other') {
        nPercent = parseFloat(otherLiquidFertilizer.NPercent) / 100 || 0;
        density = parseFloat(otherLiquidFertilizer.density) || 0;
      } else {
        nPercent = (selected?.n_percent || 0) / 100;
        density = selected?.density || 0;
      }

      newMultiplier = density * nPercent * CONVERSION_FACTOR;
    }

    dispatch(set.multiplier(newMultiplier));
  }, [
    fertilizerType,
    granularFertilizer,
    liquidFertilizer,
    otherLiquidFertilizer.NPercent,
    otherLiquidFertilizer.density,
    otherGranularFertilizer.NPercent,
    fertilizers,
    dispatch,
  ]);

  useEffect(() => {
    if (fertilizerType === 'granular') {
      dispatch(set.liquidFertilizer(null));
      dispatch(set.otherLiquidFertilizer.fertilizerName(null));
      dispatch(set.otherLiquidFertilizer.density(null));
      dispatch(set.otherLiquidFertilizer.NPercent(null));
    } else if (fertilizerType === 'liquid') {
      dispatch(set.granularFertilizer(null));
      dispatch(set.otherGranularFertilizer.fertilizerName(null));
      dispatch(set.otherGranularFertilizer.NPercent(null));
    }
  }, [dispatch, fertilizerType]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setError('');
    setFileName(file.name);
    dispatch(set.nitrogenSprayMapProperty(null));

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result;
        const geojson = await shpjs(arrayBuffer);
        const featureCollection = mergeFeatureCollections(geojson);

        let propertyKeys = [];
        if (featureCollection.features && featureCollection.features.length > 0) {
          propertyKeys = Object.keys(featureCollection.features[0].properties);
        }

        dispatch(set.nitrogenSprayMap(featureCollection));
        setProperties(propertyKeys);

        // console.log('Feature Collection:', featureCollection);
        // console.log('Property Keys:', propertyKeys);
      } catch (err) {
        setError('Invalid file format. Try uploading a different file.');
        setFileName('');
        dispatch(set.nitrogenSprayMap(null));
        setProperties([]);
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
      setFileName('');
      dispatch(set.nitrogenSprayMap(null));
      setProperties([]);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const saveCustomFertilizer = async () => {
    // Only proceed if 'Other' is selected
    const isOtherGranular = fertilizerType === 'granular' && granularFertilizer === 'Other';
    const isOtherLiquid = fertilizerType === 'liquid' && liquidFertilizer === 'Other';

    if (!isOtherGranular && !isOtherLiquid) return;

    try {
      const payload = fertilizerType === 'granular'
        ? {
          type: 'granular',
          name: otherGranularFertilizer.fertilizerName,
          n_percent: parseFloat(otherGranularFertilizer.NPercent),
        }
        : {
          type: 'liquid',
          name: otherLiquidFertilizer.fertilizerName,
          n_percent: parseFloat(otherLiquidFertilizer.NPercent),
          density: parseFloat(otherLiquidFertilizer.density),
        };

      publicApi.post('fertilizers', payload);
    } catch (err) { /* empty */ }
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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Stack direction="column" spacing="2rem" width="100%" maxWidth="600px">

          <Typography variant="h4" align="center" color="primary" gutterBottom>Tell us about your Fertilizer</Typography>

          {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>
          )}

          <Stack gap={2}>
            <PSARadioButton
              options={[
                { label: 'Liquid Fertilizer', value: 'liquid' },
                { label: 'Granular Fertilizer', value: 'granular' },
              ]}
              selectedValue={fertilizerType}
              onChange={(value) => dispatch(set.fertilizerType(value))}
              row
            />

            {fertilizerType === 'granular' && (
            <>
              {/* <CustomInputText>Select a granular fertilizer:</CustomInputText> */}
              <Autocomplete
                fullWidth
                loading={isFetching}
                options={granularOptions}
                value={granularFertilizer}
                onChange={(e, val) => {
                  dispatch(set.granularFertilizer(val));
                  if (val !== 'Other') {
                    dispatch(set.otherGranularFertilizer.fertilizerName(null));
                    dispatch(set.otherGranularFertilizer.NPercent(null));
                  }
                }}
                renderOption={(props, option) => {
                  const selected = fertilizers.find((f) => f.name === option);
                  return (
                    <Box component="li" {...props}>
                      <Stack>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {option}
                        </Typography>
                        {selected && (
                          <Typography variant="caption" color="textSecondary">
                            Nitrogen Content:
                            {' '}
                            {selected.n_percent}
                            %
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  );
                }}
                renderInput={(params) => <PSATextField {...params} label="Granular Fertilizer" placeholder="Select a granular fertilizer" />}
              />

              {granularFertilizer && granularFertilizer === 'Other' && (
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 2 }} mt={3}>
                <PSATextField
                  fullWidth
                  label="Fertilizer Name"
                  value={otherGranularFertilizer.fertilizerName || ''}
                  error={granularExists}
                  helperText={granularExists ? 'This fertilizer already exists in the list.' : ''}
                  onChange={(e) => dispatch(set.otherGranularFertilizer.fertilizerName(e.target.value))}
                />
                <PSATextField
                  fullWidth
                  label="Nitrogen Content (%)"
                  type="number"
                  value={otherGranularFertilizer.NPercent || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) {
                      dispatch(set.otherGranularFertilizer.NPercent(val));
                    }
                  }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Stack>
              )}
            </>
            )}

            {fertilizerType === 'liquid' && (
            <>
              {/* <CustomInputText>Select a liquid fertilizer:</CustomInputText> */}
              <Autocomplete
                fullWidth
                loading={isFetching}
                options={liquidOptions}
                value={liquidFertilizer}
                onChange={(e, val) => {
                  dispatch(set.liquidFertilizer(val));
                  if (val !== 'Other') {
                    dispatch(set.otherLiquidFertilizer.fertilizerName(null));
                    dispatch(set.otherLiquidFertilizer.density(null));
                    dispatch(set.otherLiquidFertilizer.NPercent(null));
                  }
                }}
                renderOption={(props, option) => {
                  const selected = fertilizers.find((f) => f.name === option);
                  return (
                    <Box component="li" {...props}>
                      <Stack>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {option}
                        </Typography>
                        {selected && (
                          <Typography variant="caption" color="textSecondary">
                            Nitrogen Content:
                            {' '}
                            {selected.n_percent}
                            %
                            {' - '}
                            Density:
                            {' '}
                            {selected.density}
                            {' '}
                            lb/gal
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  );
                }}
                renderInput={(params) => <PSATextField {...params} label="Liquid Fertilizer" placeholder="Select a liquid fertilizer" />}
              />

              {liquidFertilizer && liquidFertilizer === 'Other' && (
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 2 }} mt={3}>
                <PSATextField
                  fullWidth
                  label="Liquid Fertilizer Name"
                  value={otherLiquidFertilizer.fertilizerName || ''}
                  error={liquidExists}
                  helperText={liquidExists ? 'This fertilizer already exists in the list.' : ''}
                  onChange={(e) => dispatch(set.otherLiquidFertilizer.fertilizerName(e.target.value))}
                />
                <PSATextField
                  fullWidth
                  label="Density (lb/gal)"
                  type="number"
                  value={otherLiquidFertilizer.density || ''}
                  onChange={(e) => dispatch(set.otherLiquidFertilizer.density(e.target.value))}
                />
                <PSATextField
                  fullWidth
                  label="Nitrogen Content (%)"
                  type="number"
                  value={otherLiquidFertilizer.NPercent || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) {
                      dispatch(set.otherLiquidFertilizer.NPercent(val));
                    }
                  }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Stack>
              )}
            </>
            )}
          </Stack>

          <Box sx={{ borderBottom: '1px solid #eee' }} />

          <Stack gap={2} sx={{ minHeight: '140px' }}>
            <PSARadioButton
              options={[
                { label: 'Enter lbs N / acre', value: 'nitrogen' },
                { label: `Enter ${fertilizerType === 'granular' ? 'lbs/acre' : 'gals/acre'} of fertilizer`, value: 'fertilizer' },
              ]}
              selectedValue={inputMode}
              onChange={(value) => dispatch(set.inputMode(value))}
              row
            />
            <PSARadioButton
              options={[
                { label: 'Fixed Rate', value: 'fixed' },
                { label: 'Variable Rate', value: 'variable' },
              ]}
              selectedValue={hasFixedNRate}
              onChange={(value) => dispatch(set.hasFixedNRate(value))}
              row
            />

            {hasFixedNRate === 'fixed' && (
            <Stack gap={1}>
              <Stack direction="row" alignItems="center">
                <Typography variant="inputLabel">
                  {inputMode === 'nitrogen'
                    ? 'What is your Target N Rate? (lb N/ac):'
                    : `What is your Target Nitrogen Fertilizer Rate? ${fertilizerType === 'granular' ? '(lb/ac)' : '(gal/ac)'}:`}
                </Typography>
                <Help ariaLabel="Specify the target N rate for your region.">Specify the target N rate for your region.</Help>
                {(!targetN || targetN <= 0) && <Required />}
              </Stack>

              <Myslider
                id="targetN"
                min={0}
                max={
                  inputMode === 'nitrogen'
                    ? 250
                    : fertilizerType === 'liquid'
                      ? 85
                      : 500
                }
              />
            </Stack>
            )}

            {hasFixedNRate === 'variable' && (
            <Stack gap={2}>
              <Stack direction={{ sm: 'column', md: 'row' }} gap={1} justifyContent="space-between">
                <Typography variant="body1" color="text.secondary" alignContent="center">
                  {' '}
                  {fileName ? `Selected file: ${fileName}` : 'No file selected'}
                  {' '}
                </Typography>
                <NavButton onClick={handleUploadClick}>Upload Map</NavButton>
                <input ref={fileInputRef} type="file" accept=".geojson,.shp,.zip" hidden onChange={handleFileSelect} />
              </Stack>
              {properties.length > 0 && (
              <Autocomplete
                options={properties}
                value={nitrogenSprayMapProperty}
                onChange={(e, val) => dispatch(set.nitrogenSprayMapProperty(val))}
                renderInput={(params) => <PSATextField {...params} label="Select the N rate column name" />}
              />
              )}
            </Stack>
            )}
          </Stack>

          <Box sx={{ borderBottom: '1px solid #eee' }} />

          {!isSatelliteMode &&
          (
            <Stack gap={1}>
              <Typography variant="inputLabel">Side Dress Fertilization Date</Typography>
              {!sidedressFertilizationDate && <Required />}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  // minDate={dayjs(coverCropTerminationDate).add(7, 'day')}
                  value={dayjs(sidedressFertilizationDate)}
                  onChange={(newValue) => {
                    dispatch(set.sidedressFertilizationDate(newValue.format('YYYY-MM-DD')));
                    return null;
                  }}
                  shouldDisableDate={(date) => date.isBefore(dayjs(coverCropTerminationDate), 'day')}
                />
              </LocalizationProvider>
                {showSidedressDateWarning && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  The selected sidedress fertilization date is before the cash crop planting date.
                </Alert>
                )}
              <Box sx={{ borderBottom: '1px solid #eee', mt: 4, mb: 2 }} />
            </Stack>
          )}

          {isSatelliteMode && (
          <>
            <Stack gap={1}>
              <Stack direction="row" alignItems="center">
                <Typography variant="inputLabel">Grid Size</Typography>
                {(!gridSize || gridSize < 0.5) && <Required />}
              </Stack>
              <PSATextField
                variant="standard"
                value={gridSize}
                disabled
                InputProps={{
                  endAdornment: <InputAdornment position="end">acre</InputAdornment>,
                }}
                sx={{ mt: 0, width: '25%' }}
              />
              <Myslider id="gridSize" min={0.5} max={5} step={0.5} marks noTextfield />
            </Stack>
            <Box sx={{ borderBottom: '1px solid #eee' }} />
          </>
          )}
        </Stack>

        <NavigateBar
          next="next"
          nextOnClick={() => {
            saveCustomFertilizer();
            dispatch(set.activeStep(6));
            navigate('/output');
          }}
          nextDisabled={isNextDisabled}
          back="back"
          backOnClick={() => {
            dispatch(set.activeStep(4));
            navigate('/covercrop');
          }}
        />
      </Grid>
    </Grid>
  );
}; // NitrogenFertilizer

NitrogenFertilizer.desc = 'Cash Crop';

export default NitrogenFertilizer;
