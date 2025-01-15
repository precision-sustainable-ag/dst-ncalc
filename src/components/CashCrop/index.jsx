/* eslint-disable operator-linebreak */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Autocomplete, Box, Stack, Typography, styled, Grid,
} from '@mui/material';
import { PSATextField } from 'shared-react-components/src';
import { get, set } from '../../store/Store';
import Myslider from '../../shared/Slider';
import Help from '../../shared/Help';
import Required from '../../shared/Required';
import NavButton from '../../shared/Navigate/NavButton';
import { useFetchCropNames } from '../../hooks/useFetchStatic';
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
  const unit = useSelector(get.unit);
  const cashCrop = useSelector(get.cashCrop);
  const targetN = useSelector(get.targetN);
  const Yield = useSelector(get.yield);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);
  const crops = useFetchCropNames();

  const [plantingDate, setPlantingDate] = useState(cashCropPlantingDate);

  return (
    <Grid container justifyContent="center">
      <Grid
        item
        xs={12}
        lg={10}
        sx={{
          marginTop: '1rem',
          padding: '2rem 4rem',
          boxShadow: 5,
          borderRadius: 5,
          opacity: 0.9,
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4">Tell us about your Cash Crop</Typography>
        <Box m={2}>
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
          <Stack direction="row" alignItems="center">
            <CustomInputText>Cash Crop Planting Date: </CustomInputText>
            {!cashCropPlantingDate && <Required />}
          </Stack>
          <PSATextField
            type="date"
            value={plantingDate}
            onChange={(e) => {
              setPlantingDate(e.target.value);
              dispatch(set.cashCropPlantingDate(e.target.value));
            }}
          />
          {cashCrop === 'Corn' && (
            <Box mt={2}>
              <Stack direction="row" alignItems="center">
                <CustomInputText>Yield Goal (bu/ac):</CustomInputText>
                {(!Yield || Yield <= 0) && <Required />}
              </Stack>
              <Myslider id="yield" min={0} max={300} />
            </Box>
          )}

          <Box mt={2} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Stack direction="row" alignItems="center">
              <CustomInputText>
                What is your Target Nitrogen Fertilizer Rate? (
                {unit}
                ):
              </CustomInputText>
              <Help>Specify the target N rate for your region.</Help>
              {(!targetN || targetN <= 0) && <Required />}
            </Stack>
          </Box>

          <Myslider id="targetN" min={0} max={300} />

        </Box>

        <NavigateBar
          next="next"
          nextOnClick={() => {
            dispatch(set.activeStep(5));
            navigate('/output');
          }}
          nextDisabled={!cashCrop || !cashCropPlantingDate || !targetN || targetN < 0 || !Yield || Yield < 0}
          back="back"
          backOnClick={() => {
            dispatch(set.activeStep(3));
            navigate('/covercrop');
          }}
        />
      </Grid>
    </Grid>

  );
}; // CashCrop

CashCrop.desc = 'Cash Crop';

export default CashCrop;
