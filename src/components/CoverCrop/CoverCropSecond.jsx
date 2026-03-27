import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  Stack, styled, Grid, useMediaQuery,
} from '@mui/material';
import { get, set } from '../../store/Store';
import Myslider from '../../shared/Slider';
import Help from '../../shared/Help';
import Required from '../../shared/Required';
import NavigateBar from '../../shared/Navigate';

const CustomInputText = styled(Typography)({
  fontSize: '1.2rem',
  fontWeight: 400,
  color: '#4f6b14',
  marginTop: '1.3rem',
  marginBottom: '0.2rem',
});

const CoverCropSecond = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const N = useSelector(get.N);
  const carb = useSelector(get.carb);
  const cell = useSelector(get.cell);
  const lign = useSelector(get.lign);
  const biomass = useSelector(get.biomass);
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';

  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  useEffect(() => {
    dispatch(set.residueN(Number((N * biomass * 0.01).toFixed(2))));
  }, [N, biomass, dispatch]);

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
        <Typography variant="h4">Tell us about your Cover Crop Quality</Typography>
        {isSatelliteMode && (
        <Typography variant="subtitle1" fontWeight={900}>
          These values are estimated based on plant species and growth stage
        </Typography>
        )}
        <Box sx={{ width: '50%', marginBottom: '1rem' }}>
          <Box mt={2} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Stack direction="row" alignItems="center">
              <CustomInputText>Nitrogen (%)</CustomInputText>
              <Help ariaLabel="Cover crop nitrogen concentration based on lab results.">
                Cover crop nitrogen concentration based on lab results.
              </Help>
              {!N && <Required />}
            </Stack>
            :
          </Box>
          <Myslider id="N" min={0} max={6} step={0.1} disabled={isSatelliteMode} />
          {!isSatelliteMode && N ? <p className="note">Adjust default values below based on lab results.</p> : ''}
          <Box mt={2} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Stack direction="row" alignItems="center">
              <CustomInputText>Carbohydrates (%)</CustomInputText>
              <Help ariaLabel="Non-structural labile carbohydrate concentration based on lab results. Click for more details.">
                <p>
                  Non-structural labile carbohydrate concentration based on lab results.
                  This represents the most readily decomposable C constituents in plant materials.
                </p>
                <p>The default value is based on the nitrogen concentration.</p>
                <p>If you have the raw data from near infra-red reflectance spectroscopy (NIRS) analysis, use the following equation:</p>
                <p>carbohydrates (%) = % crude protein (CP) + % fat + % non-fibrous carbohydrates (NFC)</p>
              </Help>
              {!carb && <Required />}
            </Stack>
            :
          </Box>
          <Myslider id="carb" min={20} max={70} step={0.1} disabled={isSatelliteMode} />
          <Box mt={2} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Stack direction="row" alignItems="center">
              <CustomInputText>Holo-cellulose (%)</CustomInputText>
              <Help ariaLabel="Structural holo-cellulose concentration based on lab results. Click for more details.">
                <p>
                  Structural holo-cellulose (i.e., both cellulose and hemi-cellulose) concentration based on lab results. This represents the
                  moderately decomposable C constituents in plant materials.
                </p>
                <p>The default value is based on the nitrogen concentration.</p>
                <p>If you have the raw data from near infra-red reflectance spectroscopy (NIRS) analysis, use the following equation:</p>
                <p>holo-cellulose (%) = % neutral detergent fiber (NDF) – (% lignin + % ash)</p>
              </Help>
              {!cell && <Required />}
            </Stack>
            :
          </Box>
          <Myslider id="cell" min={20} max={70} step={0.1} disabled={isSatelliteMode} />
          <Box mt={2} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Stack direction="row" alignItems="center">
              <CustomInputText>Lignin (%)</CustomInputText>
              <Help ariaLabel="Structural lignin concentration based on lab results.  Click for more details.">
                <p>
                  Structural lignin concentration based on lab results.
                  This represents the most recalcitrant C constituents in plant materials.
                </p>
                <p>The default value is based on the nitrogen concentration.</p>
              </Help>
              {!lign && <Required />}
            </Stack>
            :
          </Box>
          <Myslider id="lign" min={1} max={10} step={0.1} disabled={isSatelliteMode} />
        </Box>

        <NavigateBar
          next="next"
          nextOnClick={() => {
            dispatch(set.activeStep(5));
            navigate('/sidedress');
          }}
          nextDisabled={!N || !carb || !cell || !lign}
          back="back"
          backOnClick={() => navigate('/covercrop')}
        />
      </Grid>
    </Grid>

  );
}; // CoverCropSecond
CoverCropSecond.showInMenu = false;

export default CoverCropSecond;
