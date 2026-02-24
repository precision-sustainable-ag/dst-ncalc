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
import { get, set } from '../../store/Store';
import Myslider from '../../shared/Slider';
import Help from '../../shared/Help';
import Required from '../../shared/Required';
import { useFetchCropNames } from '../../hooks/useFetchStatic';
import NavigateBar from '../../shared/Navigate';
import NavButton from '../../shared/Navigate/NavButton';

const CustomInputText = styled(Typography)({
  fontSize: '1.2rem',
  fontWeight: 400,
  color: '#4f6b14',
  marginTop: '1.3rem',
  marginBottom: '0.2rem',
});

const UAN_DATA = {
  'UAN 28%': { n: 0.28, density: 10.67 },
  'UAN 30%': { n: 0.3, density: 10.86 },
  'UAN 32%': { n: 0.32, density: 11.08 },
};

const CONVERSION_FACTOR = 1.12085; // lb n/acre -> kg n/ha

const NitrogenFertilizer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const isPM3DMode = useSelector(get.biomassCalcMode) === 'pm3d';
  const isUserSampledMode = useSelector(get.biomassCalcMode) === 'sampled';
  //   const unit = useSelector(get.unit);
  const cashCrop = useSelector(get.cashCrop);
  const targetN = useSelector(get.targetN);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);
  const crops = useFetchCropNames();
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);

  const [fertilizerType, setFertilizerType] = useState('liquid');
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

  //   const multiplier = useSelector(get.multiplier);

  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const isNextDisabled = (() => {
    if (!cashCropPlantingDate) return true;

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
    if (hasFixedNRate) {
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
    let newMultiplier = 1;

    if (fertilizerType === 'granular') {
      const nPercent = granularFertilizer === 'Urea' ? 0.46 : parseFloat(otherGranularFertilizerNPercentage) / 100 || 0;

      newMultiplier = CONVERSION_FACTOR * nPercent;
    } else if (fertilizerType === 'liquid') {
      let nPercent = 0;
      let lbsPerGal = 0;

      if (liquidFertilizer === 'Other') {
        nPercent = parseFloat(otherLiquidFertilizerNPercentage) / 100 || 0;
        lbsPerGal = parseFloat(otherLiquidFertilizerDensity) || 0;
      } else if (UAN_DATA[liquidFertilizer]) {
        nPercent = UAN_DATA[liquidFertilizer].n;
        lbsPerGal = UAN_DATA[liquidFertilizer].density;
      }

      newMultiplier = lbsPerGal * nPercent * CONVERSION_FACTOR;
    }

    dispatch(set.multiplier(newMultiplier));
  }, [
    fertilizerType,
    granularFertilizer,
    liquidFertilizer,
    otherLiquidFertilizerNPercentage,
    otherLiquidFertilizerDensity,
    otherGranularFertilizerNPercentage,
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
        <Typography variant="h4">Tell us about your Fertilizer</Typography>
        {error && (
        <Box sx={{ marginBottom: '1rem' }}>
          <Alert severity="error">{error}</Alert>
        </Box>
        )}
        <Box m={2}>
          <PSARadioButton
            options={[
              { label: 'Liquid Fertilizer', value: 'liquid' },
              { label: 'Granular Fertilizer', value: 'granular' },
            ]}
            selectedValue={fertilizerType}
            onChange={(value) => setFertilizerType(value)}
            row
            sx={{ marginLeft: '1em', display: 'inline-block' }}
            aria-label="position"
            name="position"
          />

          {fertilizerType === 'granular' && (
            <>
              <CustomInputText>Select a granular fertilizer:</CustomInputText>
              <Autocomplete
                options={['Urea', 'Other']}
                value={granularFertilizer}
                onChange={(e, val) => {
                  setGranularFertilizer(val);
                  if (val !== 'Other') {
                    setOtherGranularFertilizerName(null);
                    setOtherGranularFertilizerNPercentage(null);
                  }
                }}
                renderInput={(params) => <PSATextField {...params} label="" placeholder="Select a granular fertilizer" />}
              />
            </>
          )}

          {granularFertilizer && granularFertilizer === 'Other' && (
            <Stack direction={{ xs: 'column', md: 'row' }} mt={2}>
              <PSATextField
                fullWidth
                label="Fertilizer Name"
                value={otherGranularFertilizerName || ''}
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

          {fertilizerType === 'liquid' && (
            <>
              <CustomInputText>Select a liquid fertilizer:</CustomInputText>
              <Autocomplete
                options={['UAN 28%', 'UAN 30%', 'UAN 32%', 'Other']}
                value={liquidFertilizer}
                onChange={(e, val) => {
                  setLiquidFertilizer(val);
                  if (val !== 'Other') {
                    setOtherLiquidFertilizerName(null);
                    setOtherLiquidFertilizerDensity(null);
                    setOtherLiquidFertilizerNPercentage(null);
                  }
                }}
                renderInput={(params) => <PSATextField {...params} label="" placeholder="Select a liquid fertilizer" />}
              />
            </>
          )}

          {liquidFertilizer && liquidFertilizer === 'Other' && (
            <Stack direction={{ xs: 'column', md: 'row' }} mt={2}>
              <PSATextField
                fullWidth
                label="Liquid Fertilizer Name"
                value={otherLiquidFertilizerName || ''}
                onChange={(e) => setOtherLiquidFertilizerName(e.target.value)}
              />
              <PSATextField
                fullWidth
                label="Liquid Fertilizer Density"
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

          {isUserSampledMode && (
            <>
              <Stack direction="row" alignItems="center">
                <CustomInputText>Cash Crop: </CustomInputText>
                {!cashCrop && <Required />}
              </Stack>
              {crops && (
                <Autocomplete
                  placeholder="Start typing your crop, then select from the list"
                  disablePortal
                  id="combo-box-demo"
                  autoFocus
                  options={[...crops]}
                  sx={{ width: '100%' }}
                  // defaultValue={coverCrop ? coverCrop : ''}
                  value={cashCrop}
                  renderInput={(params) => <PSATextField {...params} placeholder="Select a cash crop" />}
                  onChange={(el, va) => {
                    dispatch(set.cashCrop(va));
                  }}
                />
              )}
            </>
          )}

          <PSARadioButton
            options={[
              { label: 'Fixed Rate', value: true },
              { label: 'Variable Rate', value: false },
            ]}
            selectedValue={hasFixedNRate}
            onChange={(value) => dispatch(set.hasFixedNRate(value))}
            row
            sx={{ marginLeft: '1em', display: 'inline-block' }}
            aria-label="position"
            name="position"
          />

          {hasFixedNRate && (
            <>
              <Box mt={2} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
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

          {!hasFixedNRate && (
            <Stack spacing={2} direction="column">
              <Stack justifyContent="space-around" sx={{ flexDirection: { sm: 'column', md: 'column' } }}>
                <Typography variant="subtitle">
                  {' '}
                  {fileName ? `Selected file: ${fileName}` : 'Select file'}
                  {' '}
                </Typography>
                <NavButton onClick={handleUploadClick}>Upload</NavButton>
                <input ref={fileInputRef} type="file" accept=".geojson,.shp,.zip" hidden style={{ display: 'none' }} onChange={handleFileSelect} />
              </Stack>
              {properties.length > 0 && (
                <Autocomplete
                  options={properties}
                  value={nitrogenSprayMapProperty}
                  onChange={(e, val) => dispatch(set.nitrogenSprayMapProperty(val))}
                  renderInput={(params) => <PSATextField {...params} label="Select a Property name" />}
                />
              )}
            </Stack>
          )}

          <Stack direction="row" alignItems="center">
            <CustomInputText>Side Dress Fertilization Date:</CustomInputText>
            {!cashCropPlantingDate && <Required />}
          </Stack>
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

        <NavigateBar
          next="next"
          nextOnClick={() => {
            dispatch(set.activeStep(6));
            navigate('/output');
          }}
          nextDisabled={isNextDisabled}
          back="back"
          backOnClick={() => {
            if (isSatelliteMode || isPM3DMode) {
              dispatch(set.activeStep(4));
              navigate('/covercrop');
            } else {
              dispatch(set.activeStep(4));
              navigate('/covercrop2');
            }
          }}
        />
      </Grid>
    </Grid>
  );
}; // NitrogenFertilizer

NitrogenFertilizer.desc = 'Cash Crop';

export default NitrogenFertilizer;
