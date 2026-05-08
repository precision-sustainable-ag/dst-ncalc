/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { useSelector } from 'react-redux';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import { PSAButton } from 'shared-react-components/src';
import { get } from '../../store/Store';
import { AreaErrorModal, TaskFailModal } from './Warnings';
import Datebox from './Datebox';
// import useFetchHLS from '../../hooks/useFetchHLS';

const BiomassData = () => {
  const mapPolygon = useSelector(get.mapPolygon);
  const biomassTotalValue = useSelector(get.biomassTotalValue);
  const biomassFetchIsFailed = useSelector(get.biomassFetchIsFailed);
  const biomassFetchIsLoading = useSelector(get.biomassFetchIsLoading);
  const biomassFetchFailMessage = useSelector(get.biomassFetchFailMessage);
  const polyDrawTooBig = useSelector(get.polyDrawTooBig);
  const unit = useSelector(get.unit);
  const isPM3DMode = useSelector(get.biomassCalcMode) === 'pm3d';

  // useFetchHLS();

  return (
    <Box>
      {polyDrawTooBig && <AreaErrorModal />}
      {biomassFetchIsFailed && <TaskFailModal task="biomass" message={biomassFetchFailMessage} />}
      <Box sx={{ margin: 2 }}>
        <Grid container spacing={2} alignItems="flex-end" justify="center">
          {/* {!isPM3DMode && (
            <>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Calculate my field&apos;s Biomass
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h8" gutterBottom>
                  You can change your planting date and termination dates below and recalculate the biomass value.
                </Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                <Datebox />
              </Grid>
              <Grid item xs={12} md={4} display="flex" justifyContent="center">
                <Box display="flex" order="2px solid blue">
                  <Stack direction="column" spacing={0}>
                    {biomassFetchIsLoading && <LinearProgress />}
                    <PSAButton
                      title="Calculate Biomass"
                      color={polyDrawTooBig ? 'warning' : 'success'}
                      disabled={mapPolygon.length !== 1 || biomassFetchIsLoading}
                      // eslint-disable-next-line no-undef
                      // onClick={handleButton}
                    />
                  </Stack>
                </Box>
              </Grid>
            </>
          )} */}
          {biomassTotalValue && (
            <Grid item xs={12} display="flex" justifyContent="center">
              <Box sx={{ border: 1, maxWidth: 200, padding: '0.3rem 1.2rem', textAlign: 'center' }}>
                <Stack direction="row" justifyContent="center" alignItems="center">
                  <Typography variant="h8" gutterBottom>
                    Biomass Value
                  </Typography>
                  <Typography variant="h8" gutterBottom sx={{ mx: 1 }}>
                    :
                  </Typography>
                  <Typography variant="h8" gutterBottom>
                    {biomassTotalValue}
                  </Typography>
                  <Typography variant="h8" gutterBottom>
                    {unit === 'lb/ac' ? 'lb/ac' : 'kg/ha'}
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  ); // Biomass
};
export default BiomassData;
