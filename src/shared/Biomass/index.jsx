/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import { get } from '../../store/Store';
import { AreaErrorModal, TaskFailModal } from './Warnings';
import Datebox from './Datebox';
import useFetchHLS from '../../hooks/useFetchHLS';

const Biomass = () => {
  const mapPolygon = useSelector(get.mapPolygon);
  const biomassTotalValue = useSelector(get.biomassTotalValue);
  const biomassFetchIsFailed = useSelector(get.biomassFetchIsFailed);
  const biomassFetchIsLoading = useSelector(get.biomassFetchIsLoading);
  const polyDrawTooBig = useSelector(get.polyDrawTooBig);
  const unit = useSelector(get.unit);

  useFetchHLS();

  return (
    <Box pb={2}>
      {polyDrawTooBig && (
        <AreaErrorModal />
      )}
      {biomassFetchIsFailed && (
        <TaskFailModal task="biomass" />
      )}
      <Box sx={{ margin: 2 }}>
        <Grid container spacing={2} alignItems="flex-end" justify="center">
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
          <Grid
            item
            xs={12}
            md={2}
            display="flex"
            justifyContent="center"
          >
            <Box display="flex" order="2px solid blue">
              <Stack direction="column" spacing={0}>
                {biomassFetchIsLoading && (<LinearProgress />)}
                <Button
                  variant="outlined"
                  color={polyDrawTooBig ? 'warning' : 'success'}
                  disabled={mapPolygon.length !== 1 || biomassFetchIsLoading}
                  onClick={handleButton}
                >
                  <div style={{ fontWeight: 900 }}>Calculate Biomass</div>
                </Button>
              </Stack>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            md={2}
            display="flex"
            justifyContent="center"
          >
            {biomassTotalValue
              && (
                <Box sx={{ border: 1, maxWidth: 200, padding: '0.3rem 1.2rem' }}>
                  <Stack direction="column" justifyContent="center" alignItems="center">
                    <Typography variant="h8" gutterBottom>
                      {biomassTotalValue}
                    </Typography>
                    <Typography variant="h8" gutterBottom>
                      {unit === 'lb/ac' ? 'lb/ac' : 'kg/ha'}
                    </Typography>
                  </Stack>
                </Box>
              )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  ); // Biomass
};
export default Biomass;
