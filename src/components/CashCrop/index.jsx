/* eslint-disable operator-linebreak */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Stack, Typography, Grid,
  useMediaQuery,
  Autocomplete,
} from '@mui/material';
import { PSATextField } from 'shared-react-components/src';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { get, set } from '../../store/Store';
import Myslider from '../../shared/Slider';
import Help from '../../shared/Help';
import Required from '../../shared/Required';
import { useFetchCropNames } from '../../hooks/useFetchStatic';
import NavigateBar from '../../shared/Navigate';

const CashCrop = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const isPM3DMode = useSelector(get.biomassCalcMode) === 'pm3d';
  const isUserSampledMode = useSelector(get.biomassCalcMode) === 'sampled';
  const unit = useSelector(get.unit);
  const cashCrop = useSelector(get.cashCrop);
  const targetN = useSelector(get.targetN);
  const Yield = useSelector(get.yield);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);
  const crops = useFetchCropNames();
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);

  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  // Set default cash crop planting date on mount if not set or invalid
  useEffect(() => {
    if (!cashCropPlantingDate || dayjs(cashCropPlantingDate).isBefore(dayjs(coverCropTerminationDate))) {
      dispatch(set.cashCropPlantingDate(dayjs(coverCropTerminationDate).add(7, 'day').format('YYYY-MM-DD')));
    }
  });

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
        <Stack spacing="2rem" width="100%" maxWidth="600px">

          <Typography variant="h4" align="center" color="primary">Tell us about your Target Rate</Typography>

          {isUserSampledMode && (
            <Stack gap={0}>
              <Stack direction="row" alignItems="center">
                <Typography variant="inputLabel">Cash Crop</Typography>
                {!cashCrop && <Required />}
              </Stack>
              {crops && (
                <Autocomplete
                  placeholder="Start typing your crop, then select from the list"
                  disablePortal
                  id="combo-box-demo"
                  autoFocus
                  options={[...crops]}
                  sx={{ mt: 0 }}
                  value={cashCrop}
                  renderInput={(params) => <PSATextField {...params} placeholder="Select a cash crop" />}
                  onChange={(el, va) => {
                    dispatch(set.cashCrop(va));
                  }}
                />
              )}
            </Stack>
          )}

          <Stack gap={1}>
            <Stack direction="row" alignItems="center">
              <Typography variant="inputLabel">Cash Crop Planting Date</Typography>
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
          </Stack>

          {isUserSampledMode && cashCrop === 'Corn' && (
            <Stack gap={1}>
              <Stack direction="row" alignItems="center">
                <Typography variant="inputLabel">Yield Goal (bu/ac)</Typography>
                {(!Yield || Yield <= 0) && <Required />}
              </Stack>
              <Myslider id="yield" min={0} max={300} />
            </Stack>
          )}

          <Stack gap={1}>
            <Stack direction="row" alignItems="center">
              <Typography variant="inputLabel">
                What is your Target Nitrogen Fertilizer Rate? (
                {unit}
                )
              </Typography>
              <Help ariaLabel="Specify the target N rate for your region.">
                Specify the target N rate for your region.
              </Help>
              {(!targetN || targetN <= 0) && <Required />}
            </Stack>
            <Myslider id="targetN" min={0} max={300} />
          </Stack>

        </Stack>

        <NavigateBar
          next="next"
          nextOnClick={() => {
            dispatch(set.activeStep(6));
            navigate('/output');
          }}
          nextDisabled={!cashCropPlantingDate || !targetN || targetN < 0 || !Yield || Yield < 0 || (isUserSampledMode && !cashCrop)}
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
}; // CashCrop

CashCrop.desc = 'Cash Crop';

export default CashCrop;
