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
import { get, set } from '../../store/Store';
import Myslider from '../../shared/Slider';
import Help from '../../shared/Help';
import Required from '../../shared/Required';
import NavigateBar from '../../shared/Navigate';
import NavButton from '../../shared/Navigate/NavButton';
import { mergeFeatureCollections } from '../../utils/geojsonUtils';

const TargetRate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const targetN = useSelector(get.targetN);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const sidedressFertilizationDate = useSelector(get.sidedressFertilizationDate);
  const [showSidedressDateWarning, setShowSidedressDateWarning] = useState(false);

  const fertilizerType = useSelector(get.fertilizerType);

  const inputMode = useSelector(get.inputMode);
  const hasFixedNRate = useSelector(get.hasFixedNRate);

  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const nitrogenSprayMap = useSelector(get.nitrogenSprayMap);
  const [properties, setProperties] = useState([]);
  const nitrogenSprayMapProperty = useSelector(get.nitrogenSprayMapProperty);

  const gridSize = useSelector(get.gridSize);

  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const isNextDisabled = (() => {
    if (!isSatelliteMode && !sidedressFertilizationDate) return true;

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

          <Typography variant="h4" align="center" color="primary" gutterBottom>Tell us about your Target N Rate</Typography>

          {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>
          )}

          <Stack gap={2} sx={{ minHeight: '140px' }}>
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
            dispatch(set.activeStep(7));
            navigate('/output');
          }}
          nextDisabled={isNextDisabled}
          back="back"
          backOnClick={() => {
            dispatch(set.activeStep(5));
            navigate('/fertilizer');
          }}
        />
      </Grid>
    </Grid>
  );
};

export default TargetRate;
