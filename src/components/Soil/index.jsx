/* eslint-disable no-nested-ternary */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Stack, Typography, Grid,
} from '@mui/material';
import { PSALoadingSpinner } from 'shared-react-components/src';
import { get, set } from '../../store/Store';
import Myslider from '../../shared/Slider';
import Help from '../../shared/Help';
import { useFetchSSURGO } from '../../hooks/useFetchApi';
import NavButton from '../../shared/Navigate/NavButton';

/// /// /// ROOT COMPONENT /// /// ///
const Soil = () => {
  /// /// /// VARIABLES /// /// ///
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const ssurgo = useSelector(get.SSURGO);
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  /// /// /// HOOKS /// /// ///
  useFetchSSURGO();

  /// /// /// RETURN JSX /// ///
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
        }}
      >
        <Stack spacing="1rem">
          <Typography variant="h4" align="center">Tell us about your Soil</Typography>
          {ssurgo ? (
            isSatelliteMode ? (
              <Box>
                <Typography variant="h6" my={2} align="center">
                  This model will use the NRCS&apos;s Soil Survey Geographic database (SSURGO) soil data from your field to estimate cover crop
                  decompostition
                </Typography>
                <Stack direction="row" spacing={6}>
                  <Stack direction="column" spacing={3}>
                    <Stack direction="row" spacing={1}>
                      <Typography variant="h6" my={2}>
                        Organic Matter (%):
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Typography variant="h6" my={2}>
                        Bulk Density (g/cm
                        <sup>3</sup>
                        ):
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Typography variant="h6" my={2}>
                        Soil Inorganic N (ppm or mg/kg):
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="column" spacing={3}>
                    <Stack direction="row" spacing={1}>
                      <Typography variant="h6" my={2}>
                        {ssurgo && Object.keys(ssurgo).length > 0 && ssurgo[0].om_r}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Typography variant="h6" my={2}>
                        {ssurgo && Object.keys(ssurgo).length > 0 && ssurgo[0].dbthirdbar_r}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Typography variant="h6" my={2}>
                        {ssurgo && Object.keys(ssurgo).length > 0 && 10}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Box>
            ) : (
              <>
                <Typography variant="h6" align="center">
                  The data below was pulled from NRCS&apos;s Soil Survey Geographic database (SSURGO) based on your field&apos;s latitude/longitude
                  coordinates. You can adjust them if you have lab results.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Stack spacing="1rem" sx={{ color: '#4f6b14', minWidth: '50%' }}>
                    <Box>
                      Organic Matter (%):
                      <Help>Soil organic matter in the surface (0-10cm) soil</Help>
                      <Myslider id="OM" min={0.1} max={5} step={0.1} />
                    </Box>
                    <Box>
                      Bulk Density (g/cm
                      <sup>3</sup>
                      ):
                      <Help>Soil bulk density in the surface (0-10cm) soil</Help>
                      <Myslider id="BD" min={0.8} max={1.8} step={0.1} />
                    </Box>
                    <Box>
                      Soil Inorganic N (ppm or mg/kg):
                      <Help>Soil inorganic nitrogen in the surface (0-10cm) soil</Help>
                      <Myslider id="InorganicN" min={0} max={25} />
                    </Box>
                  </Stack>
                </Box>
              </>
            )
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <PSALoadingSpinner />
              <Typography variant="h6" my={2}>
                LOADING FROM SSURGO SERVER ...
              </Typography>
            </Box>
          )}

        </Stack>

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
              dispatch(set.activeStep(1));
              navigate('/location');
            }}
          >
            BACK
          </NavButton>
          <NavButton
            onClick={() => {
              dispatch(set.activeStep(3));
              navigate('/covercrop');
            }}
          >
            NEXT
          </NavButton>
        </Box>
      </Grid>
    </Grid>

  );
}; // Soil

export default Soil;
