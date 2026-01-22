/* eslint-disable operator-linebreak */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Stack, Typography, styled, Grid,
  useMediaQuery,
} from '@mui/material';
// import { PSATextField } from 'shared-react-components/src';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { get, set } from '../../store/Store';
import Myslider from '../../shared/Slider';
import Help from '../../shared/Help';
import Required from '../../shared/Required';
// import { useFetchCropNames } from '../../hooks/useFetchStatic';
import NavigateBar from '../../shared/Navigate';

const CustomInputText = styled(Typography)({
  fontSize: '1.2rem',
  fontWeight: 400,
  color: '#4f6b14',
  marginTop: '1.3rem',
  marginBottom: '0.2rem',
});

const CashCrop = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const isPM3DMode = useSelector(get.biomassCalcMode) === 'pm3d';
  const unit = useSelector(get.unit);
  // const cashCrop = useSelector(get.cashCrop);
  const targetN = useSelector(get.targetN);
  const Yield = useSelector(get.yield);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);
  // const crops = useFetchCropNames();
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);

  // const [plantingDate, setPlantingDate] = useState(cashCropPlantingDate);

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
        <Typography variant="h4">Tell us about your Target Rate</Typography>
        <Box m={2}>
          {/* <Stack direction="row" alignItems="center">
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
          )} */}
          <Stack direction="row" alignItems="center">
            <CustomInputText>Side Dress Fertilization Date: </CustomInputText>
            {!cashCropPlantingDate && <Required />}
          </Stack>
          {/* <PSATextField
            type="date"
            value={plantingDate}
            onChange={(e) => {
              setPlantingDate(e.target.value);
              dispatch(set.cashCropPlantingDate(e.target.value));
            }}
          /> */}
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

          {/* {cashCrop === 'Corn' && (
            <Box mt={2}>
              <Stack direction="row" alignItems="center">
                <CustomInputText>Yield Goal (bu/ac):</CustomInputText>
                {(!Yield || Yield <= 0) && <Required />}
              </Stack>
              <Myslider id="yield" min={0} max={300} />
            </Box>
          )} */}

          <Box mt={2} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Stack direction="row" alignItems="center">
              <CustomInputText>
                What is your Target Nitrogen Fertilizer Rate? (
                {unit}
                ):
              </CustomInputText>
              <Help ariaLabel="Specify the target N rate for your region.">
                Specify the target N rate for your region.
              </Help>
              {(!targetN || targetN <= 0) && <Required />}
            </Stack>
          </Box>

          <Myslider id="targetN" min={0} max={300} />

        </Box>

        <NavigateBar
          next="next"
          nextOnClick={() => {
            dispatch(set.activeStep(6));
            navigate('/output');
          }}
          nextDisabled={!cashCropPlantingDate || !targetN || targetN < 0 || !Yield || Yield < 0}
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
