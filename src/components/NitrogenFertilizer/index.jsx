/* eslint-disable operator-linebreak */
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Stack, Typography, styled, Grid, useMediaQuery, Autocomplete, InputAdornment,
  Alert,
} from '@mui/material';
import { PSARadioButton, PSATextField } from 'shared-react-components/src';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import shpjs from 'shpjs';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { get, set } from '../../store/Store';
import Myslider from '../../shared/Slider';
import Help from '../../shared/Help';
import Required from '../../shared/Required';
import NavigateBar from '../../shared/Navigate';
import NavButton from '../../shared/Navigate/NavButton';
import { ncalcApiUrl } from '../../utils/keys';

const CustomInputText = styled(Typography)({
  fontSize: '1.2rem',
  fontWeight: 400,
  color: '#4f6b14',
  marginTop: '0.5rem',
  marginBottom: '0.2rem',
});

const MainContentBox = styled(Box)({
  width: '100%',
  maxWidth: '600px',
  minHeight: '450px',
  display: 'flex',
  flexDirection: 'column',
});

// const UAN_DATA = {
//   'UAN 28%': { n: 0.28, density: 10.67 },
//   'UAN 30%': { n: 0.3, density: 10.86 },
//   'UAN 32%': { n: 0.32, density: 11.08 },
// };

const CONVERSION_FACTOR = 1.12085; // lb n/acre -> kg n/ha

const API_BASE_URL = ncalcApiUrl;

const NitrogenFertilizer = () => {
  const {
    isAuthenticated, getAccessTokenSilently,
  } = useAuth0();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  //   const unit = useSelector(get.unit);
  const targetN = useSelector(get.targetN);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);

  const [isFetching, setIsFetching] = useState(false);
  const [fertilizers, setFertilizers] = useState([]);

  const fertilizerType = useSelector(get.fertilizerType);
  const [granularFertilizer, setGranularFertilizer] = useState(null);
  const [otherGranularFertilizerName, setOtherGranularFertilizerName] = useState(null);
  const [otherGranularFertilizerNPercentage, setOtherGranularFertilizerNPercentage] = useState(null);
  const [liquidFertilizer, setLiquidFertilizer] = useState(null);
  const [otherLiquidFertilizerName, setOtherLiquidFertilizerName] = useState(null);
  const [otherLiquidFertilizerDensity, setOtherLiquidFertilizerDensity] = useState(null);
  const [otherLiquidFertilizerNPercentage, setOtherLiquidFertilizerNPercentage] = useState(null);

  const hasFixedNRate = useSelector(get.hasFixedNRate);

  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const nitrogenSprayMap = useSelector(get.nitrogenSprayMap);
  const [properties, setProperties] = useState([]);
  const nitrogenSprayMapProperty = useSelector(get.nitrogenSprayMapProperty);

  const granularOptions = !isFetching
    ? [...fertilizers.filter((f) => f.type === 'granular').map((f) => f.name), 'Other']
    : [];

  const liquidOptions = !isFetching
    ? [...fertilizers.filter((f) => f.type === 'liquid').map((f) => f.name), 'Other']
    : [];

  const granularExists = fertilizerType === 'granular' &&
  fertilizers.some((f) => f.type === 'granular' &&
    f.name.toLowerCase() === otherGranularFertilizerName?.toLowerCase().trim());

  const liquidExists = fertilizerType === 'liquid' &&
  fertilizers.some((f) => f.type === 'liquid' &&
    f.name.toLowerCase() === otherLiquidFertilizerName?.toLowerCase().trim());

  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const isNextDisabled = (() => {
    if (!cashCropPlantingDate) return true;
    if (granularExists || liquidExists) return true;

    // Fertilizer specific requirements
    if (fertilizerType === 'granular') {
      if (!granularFertilizer) return true;
      if (granularFertilizer === 'Other' && (!otherGranularFertilizerName || !otherGranularFertilizerNPercentage)) return true;
    } else if (fertilizerType === 'liquid') {
      if (!liquidFertilizer) return true;
      if (liquidFertilizer === 'Other' &&
        (!otherLiquidFertilizerName || !otherLiquidFertilizerDensity || !otherLiquidFertilizerNPercentage)) return true;
    }

    // Rate specific requirements
    if (hasFixedNRate === 'fixed') {
      if (!targetN || targetN <= 0) return true;
    } else if (!nitrogenSprayMap || !nitrogenSprayMapProperty) return true;

    return false;
  })();

  // Set default cash crop planting date on mount if not set or invalid
  useEffect(() => {
    if (!cashCropPlantingDate || dayjs(cashCropPlantingDate).isBefore(dayjs(coverCropTerminationDate))) {
      dispatch(set.cashCropPlantingDate(dayjs(coverCropTerminationDate).add(7, 'day').format('YYYY-MM-DD')));
    }
  });

  useEffect(() => {
    const fetchFertilizers = async () => {
      try {
        setIsFetching(true);
        const token = await getAccessTokenSilently();
        const response = await axios.get(`${API_BASE_URL}/fertilizers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFertilizers(response.data?.data || []);
      } catch (e) {
        // console.error('Failed to load options', e);
        setFertilizers([]);
      } finally {
        setIsFetching(false);
      }
    };

    if (isAuthenticated) {
      fetchFertilizers();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    let newMultiplier = 1;

    if (fertilizerType === 'granular') {
      const selected = fertilizers.find((f) => f.name === granularFertilizer);
      const nPercent = granularFertilizer === 'Other' ? parseFloat(otherGranularFertilizerNPercentage) / 100 || 0 : (selected?.n_percent || 0) / 100;

      newMultiplier = CONVERSION_FACTOR * nPercent;
    } else if (fertilizerType === 'liquid') {
      const selected = fertilizers.find((f) => f.name === liquidFertilizer);

      let nPercent = 0;
      let density = 0;

      if (liquidFertilizer === 'Other') {
        nPercent = parseFloat(otherLiquidFertilizerNPercentage) / 100 || 0;
        density = parseFloat(otherLiquidFertilizerDensity) || 0;
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
    otherLiquidFertilizerNPercentage,
    otherLiquidFertilizerDensity,
    otherGranularFertilizerNPercentage,
    fertilizers,
    dispatch,
  ]);

  useEffect(() => {
    if (fertilizerType === 'granular') {
      setLiquidFertilizer(null);
      setOtherLiquidFertilizerName(null);
      setOtherLiquidFertilizerDensity(null);
      setOtherLiquidFertilizerNPercentage(null);
    } else if (fertilizerType === 'liquid') {
      setGranularFertilizer(null);
      setOtherGranularFertilizerName(null);
      setOtherGranularFertilizerNPercentage(null);
    }
  }, [fertilizerType]);

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
        const featureCollection = Array.isArray(geojson) ? geojson[0] : geojson;

        let propertyKeys = [];
        if (featureCollection.features && featureCollection.features.length > 0) {
          propertyKeys = Object.keys(featureCollection.features[0].properties);
        }

        dispatch(set.nitrogenSprayMap(featureCollection));
        setProperties(propertyKeys);

        // console.log('Feature Collection:', featureCollection);
        // console.log('Property Keys:', propertyKeys);
      } catch (err) {
        setError(err.message || 'Invalid file format');
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
      const token = await getAccessTokenSilently();

      const payload = fertilizerType === 'granular'
        ? {
          type: 'granular',
          name: otherGranularFertilizerName,
          n_percent: parseFloat(otherGranularFertilizerNPercentage),
        }
        : {
          type: 'liquid',
          name: otherLiquidFertilizerName,
          n_percent: parseFloat(otherLiquidFertilizerNPercentage),
          density: parseFloat(otherLiquidFertilizerDensity),
        };

      axios.post(`${API_BASE_URL}/fertilizers`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        <Typography variant="h4" gutterBottom>Tell us about your Fertilizer</Typography>

        {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>
        )}

        <MainContentBox>
          <Box sx={{ mb: 2 }}>
            <PSARadioButton
              options={[
                { label: 'Liquid Fertilizer', value: 'liquid' },
                { label: 'Granular Fertilizer', value: 'granular' },
              ]}
              selectedValue={fertilizerType}
              onChange={(value) => dispatch(set.fertilizerType(value))}
              row
            />
          </Box>

          {fertilizerType === 'granular' && (
          <>
            {/* <CustomInputText>Select a granular fertilizer:</CustomInputText> */}
            <Autocomplete
              fullWidth
              loading={isFetching}
              options={granularOptions}
              value={granularFertilizer}
              onChange={(e, val) => {
                setGranularFertilizer(val);
                if (val !== 'Other') {
                  setOtherGranularFertilizerName(null);
                  setOtherGranularFertilizerNPercentage(null);
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
                value={otherGranularFertilizerName || ''}
                error={granularExists}
                helperText={granularExists ? 'This fertilizer already exists in the list.' : ''}
                onChange={(e) => setOtherGranularFertilizerName(e.target.value)}
              />
              <PSATextField
                fullWidth
                label="Nitrogen Content (%)"
                type="number"
                value={otherGranularFertilizerNPercentage || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) {
                    setOtherGranularFertilizerNPercentage(val);
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
                setLiquidFertilizer(val);
                if (val !== 'Other') {
                  setOtherLiquidFertilizerName(null);
                  setOtherLiquidFertilizerDensity(null);
                  setOtherLiquidFertilizerNPercentage(null);
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
                value={otherLiquidFertilizerName || ''}
                error={liquidExists}
                helperText={liquidExists ? 'This fertilizer already exists in the list.' : ''}
                onChange={(e) => setOtherLiquidFertilizerName(e.target.value)}
              />
              <PSATextField
                fullWidth
                label="Density (lb/gal)"
                type="number"
                value={otherLiquidFertilizerDensity || ''}
                onChange={(e) => setOtherLiquidFertilizerDensity(e.target.value)}
              />
              <PSATextField
                fullWidth
                label="Nitrogen Content (%)"
                type="number"
                value={otherLiquidFertilizerNPercentage || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) {
                    setOtherLiquidFertilizerNPercentage(val);
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

          <Box sx={{ borderBottom: '1px solid #eee', my: 3 }} />

          <Box sx={{ minHeight: '140px' }}>
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
            <>
              <Box mt={1}>
                <Stack direction="row" alignItems="center">
                  <CustomInputText>
                    What is your Target Nitrogen Fertilizer Rate?
                    {' '}
                    {fertilizerType === 'granular' ? '(lb/ac)' : '(gal/ac)'}
                    :
                  </CustomInputText>
                  <Help ariaLabel="Specify the target N rate for your region.">Specify the target N rate for your region.</Help>
                  {(!targetN || targetN <= 0) && <Required />}
                </Stack>
              </Box>

              <Myslider id="targetN" min={0} max={300} />
            </>
            )}

            {hasFixedNRate === 'variable' && (
            <Stack spacing={2} mt={3}>
              <Stack direction={{ sm: 'column', md: 'row' }} justifyContent="space-between">
                <Typography variant="body1" sx={{ color: '#666', alignContent: 'center' }}>
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
          </Box>

          <Box sx={{ borderBottom: '1px solid #eee', mt: 4, mb: 2 }} />

          <Box mt={0} sx={{ mt: 'auto' }}>
            <CustomInputText>Side Dress Fertilization Date:</CustomInputText>
            {!cashCropPlantingDate && <Required />}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                minDate={dayjs(coverCropTerminationDate).add(7, 'day')}
                value={dayjs(cashCropPlantingDate)}
                onChange={(newValue) => {
                  dispatch(set.cashCropPlantingDate(newValue.format('YYYY-MM-DD')));
                  return null;
                }}
                shouldDisableDate={(date) => date.isBefore(dayjs(coverCropTerminationDate), 'day')}
              />
            </LocalizationProvider>
          </Box>
        </MainContentBox>

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
