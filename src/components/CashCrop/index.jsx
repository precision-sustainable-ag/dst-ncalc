/* eslint-disable operator-linebreak */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Autocomplete, Box, Stack, TextField, Typography, styled,
} from '@mui/material';
import { get, set } from '../../store/Store';
import Myslider from '../../shared/Slider';
import Input from '../../shared/Inputs';
import Help from '../../shared/Help';
import Required from '../../shared/Required';
import NavButton from '../../shared/Navigate/NavButton';
import { useFetchCropNames } from '../../hooks/useFetchStatic';
import { PSADropdown } from 'shared-react-components/src';

const CustomInputText = styled(Typography)({
  fontSize: '1.2rem',
  fontWeight: 400,
  color: '#4f6b14',
  marginTop: '1.3rem',
  marginBottom: '0.2rem',
});

const CashCrop = ({ barebone = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const unit = useSelector(get.unit);
  const cashCrop = useSelector(get.cashCrop);
  const targetN = useSelector(get.targetN);
  const Yield = useSelector(get.yield);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);
  const crops = useFetchCropNames()?.map((crop) => ({
    label: crop,
    value: crop,
  }));

  return (
    <Box
      sx={{
        justifyContent: 'center',
        margin: '0% 5% 0% 5%',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '1rem',
        flexDirection: 'column',
        width: '100%',
        // width: {
        //   xs: '100%',
        //   sm: '100%',
        //   md: '90%',
        //   lg: '70%',
        //   xl: '60%',
        // },
      }}
    >
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#fff',
          padding: '1rem',
          borderRadius: '1rem',
          width: '100%',
        }}
      >
        {barebone ? (
          <Typography variant="h5">Tell us about your Cash Crop</Typography>
        ) : (
          <Typography variant="h4">Tell us about your Cash Crop</Typography>
        )}
        <Box mt={2}>
          <Stack direction="row" alignItems="center">
            <CustomInputText>Cash Crop: </CustomInputText>
            {!cashCrop && <Required />}
          </Stack>
          {crops && (
            <PSADropdown
              label="Start typing your crop, then select from the list"
              items={crops}
              formSx={{ width: '100%' }}
              SelectProps={{
                value: cashCrop || '',
                onChange: (event) => {
                  const selectedValue = event.target.value;
                  dispatch(set.cashCrop(selectedValue));
                },
                variant: 'outlined',
              }}
            />
          )}
          <Stack direction="row" alignItems="center">
            <CustomInputText>Cash Crop Planting Date: </CustomInputText>
            {!cashCropPlantingDate && <Required />}
          </Stack>
          <Input type="date" id="cashCropPlantingDate" />

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
          {!barebone && (
            <Box
              sx={{
                justifyContent: 'space-around',
                alignItems: 'space-between',
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
              }}
              mt={6}
            >
              <NavButton
                onClick={() => {
                  dispatch(set.activeStep(3));
                  navigate('/covercrop');
                }}
              >
                BACK
              </NavButton>
              <NavButton
                onClick={() => {
                  dispatch(set.activeStep(5));
                  navigate('/output');
                }}
                disabled={!cashCrop || !cashCropPlantingDate || !targetN || targetN < 0 || !Yield || Yield < 0}
              >
                NEXT
              </NavButton>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}; // CashCrop

CashCrop.desc = 'Cash Crop';

export default CashCrop;
