/* eslint-disable no-nested-ternary */
import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { get } from '../../store/Store';
import Myslider from '../../shared/Slider';
import Help from '../../shared/Help';
import { useFetchSSURGO } from '../../hooks/useFetchApi';

/// /// /// ROOT COMPONENT /// /// ///
const Soil = () => {
  const ssurgo = useSelector(get.SSURGO);
  const navigate = useNavigate();
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  /// /// /// HOOKS /// /// ///
  useFetchSSURGO({ lat, lon });

  /// /// /// RETURN JSX /// ///
  return (
    <Box
      sx={{
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '1rem',
        flexDirection: 'column',
        width: {
          xs: '100%',
          sm: '90%',
          md: '80%',
          lg: '70%',
          xl: '60%',
        },
      }}
    >
      <Box p={3} pb={0}>
        <Typography variant="h4">Tell us about your Soil</Typography>
        {ssurgo
          ? (
            isSatelliteMode ? (
              <Box>
                <Typography variant="h6" my={2}>
                  This model will use the NRCS&apos;s Soil Survey
                  Geographic database (SSURGO) soil data from your field to estimate cover crop decompostition
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
              <Box>
                <Typography variant="h6" my={2}>
                  The data below was pulled from NRCS&apos;s Soil Survey
                  Geographic database (SSURGO) based on your field&apos;s latitude/longitude coordinates.
                </Typography>
                <Typography variant="h6" my={2}>
                  You can adjust them if you have lab results.
                </Typography>
              </Box>
            )
          )
          : (
            <Typography variant="h6" my={6}>
              LOADING FROM SSURGO SERVER ...
            </Typography>
          )}

        {!isSatelliteMode && ssurgo && (
          <Box sx={{ color: '#4f6b14' }}>
            <Box my={5}>
              Organic Matter (%):
              <Help>
                Soil organic matter in the surface (0-10cm) soil
              </Help>
              <Myslider
                id="OM"
                min={0.1}
                max={5}
                step={0.1}
              />
            </Box>
            <Box my={5}>
              Bulk Density (g/cm
              <sup>3</sup>
              ):
              <Help>
                Soil bulk density in the surface (0-10cm) soil
              </Help>
              <Myslider
                id="BD"
                min={0.8}
                max={1.8}
                step={0.1}
              />
            </Box>
            <Box my={5}>
              Soil Inorganic N (ppm or mg/kg):
              <Help>
                Soil inorganic nitrogen in the surface (0-10cm) soil
              </Help>
              <Myslider
                id="InorganicN"
                min={0}
                max={25}
              />
            </Box>
          </Box>
        )}
      </Box>
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
        <Button
          sx={{ borderRadius: '1rem', fontSize: '22px', fontWeight: 900 }}
          onClick={() => navigate('/location')}
          variant="contained"
          color="success"
        >
          BACK
        </Button>
        <Button
          sx={{ borderRadius: '1rem', fontSize: '22px', fontWeight: 900 }}
          onClick={() => navigate('/covercrop')}
          variant="contained"
          color="success"
        >
          NEXT
        </Button>
      </Box>
    </Box>
  );
}; // Soil

export default Soil;
