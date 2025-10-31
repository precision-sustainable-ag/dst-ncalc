import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Stack, Typography, Grid,
  useMediaQuery,
} from '@mui/material';
// import { PSALoadingSpinner } from 'shared-react-components/src';
import BiomassMap from '../../shared/Map/BiomassMap';
import { get, set } from '../../store/Store';
// import useFetchHLS from '../../hooks/useFetchHLS';
import Datebox from '../../shared/BiomassData/Datebox';
import { AreaErrorModal, TaskFailModal } from '../../shared/BiomassData/Warnings';
import NavigateBar from '../../shared/Navigate';

const Location = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const biomassFetchIsLoading = useSelector(get.biomassFetchIsLoading);
  const biomassTaskResults = useSelector(get.biomassTaskResults);
  const polyDrawTooBig = useSelector(get.polyDrawTooBig);
  const biomassFetchIsFailed = useSelector(get.biomassFetchIsFailed);
  const mapPolygon = useSelector(get.mapPolygon);

  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  // API for getting biomass map
  // useFetchHLS();

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
        }}
      >
        <Stack spacing="1rem">
          <Typography variant="h4" align="center">
            Where is your Field located?
          </Typography>
          <Typography variant="h6" align="center">
            Enter your address or zip code to determine your field&apos;s location. You can then zoom in and click to pinpoint it on the map. If
            you know your exact coordinates, you can enter them in search bar separated by comma (ex. 37.7, -80.2 ).
          </Typography>
          {isSatelliteMode && (
            <Typography variant="h8" align="center" pt={1}>
              Specify your crop&apos;s planting and termination dates, and your field&apos;s boundary on the map using the drawing tool.
            </Typography>
          )}
          <Datebox />

          {/* {biomassFetchIsLoading && (
            <Box>
              <Grid
                item
                container
                spacing={1}
                justifyContent="center"
                alignItems="center"
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '100px',
                }}
              >
                <PSALoadingSpinner />
              </Grid>
              <Typography variant="h6" fontWeight="bold" gutterBottom textAlign="center">
                Calculating Biomass ...
              </Typography>
            </Box>
          )} */}
          {biomassTaskResults && !biomassFetchIsLoading && (
            <Box justifyContent="center" alignItems="center">
              <Typography variant="h6" fontWeight="bold" gutterBottom textAlign="center">
                Biomass Map
              </Typography>
            </Box>
          )}
          {polyDrawTooBig && <AreaErrorModal />}
          {biomassFetchIsFailed && <TaskFailModal task="biomass" /> }
          <BiomassMap variant="biomass" />
        </Stack>
        <NavigateBar
          next="next"
          nextOnClick={() => {
            if (isSatelliteMode) {
              // calcBiomass();
              dispatch(set.activeStep(3));
              navigate('/covercrop');
            } else {
              dispatch(set.activeStep(2));
              navigate('/soil');
            }
          }}
          back="back"
          backOnClick={() => {
            dispatch(set.activeStep(0));
            navigate('/home');
          }}
          nextDisabled={isSatelliteMode && mapPolygon.length === 0}
          nextTooltip="Please wait until the biomass map is loaded"
        />
      </Grid>
    </Grid>

  );
}; // Location

export default Location;
