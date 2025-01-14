import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Stack, Typography, Badge, Grid,
} from '@mui/material';
import { PSALoadingSpinner, PSATooltip } from 'shared-react-components/src';
import BiomassMap from '../../shared/Map/BiomassMap';
import { get, set } from '../../store/Store';
import NavButton from '../../shared/Navigate/NavButton';
import useFetchHLS from '../../hooks/useFetchHLS';
import Datebox from '../../shared/BiomassData/Datebox';
import { AreaErrorModal, TaskFailModal } from '../../shared/BiomassData/Warnings';

const nextButtonBadgeContent = () => (
  <PSATooltip
    title="No polygon is drawn"
    tooltipContent={(
      <Typography>?</Typography>
  )}
  />
);

const Location = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const biomassFetchIsLoading = useSelector(get.biomassFetchIsLoading);
  const biomassTaskResults = useSelector(get.biomassTaskResults);
  const polyDrawTooBig = useSelector(get.polyDrawTooBig);
  const biomassFetchIsFailed = useSelector(get.biomassFetchIsFailed);

  // API for getting biomass map
  useFetchHLS();

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
          <Typography variant="h4" align="center">
            Where is your Field located?
          </Typography>
          <Typography variant="h6" align="center">
            Enter your address or zip code to determine your field&apos;s location. You can then zoom in and click to pinpoint it on the map. If
            you know your exact coordinates, you can enter them in search bar separated by comma (ex. 37.7, -80.2 ).
          </Typography>
          {isSatelliteMode && (
            <Typography variant="h8" align="center" pt={1}>
              Specify your crop&apos;s planting and termination dates, anc your field&apos;s boundary on the map using the drawing tool.
            </Typography>
          )}
          <Datebox />

          {biomassFetchIsLoading && (
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
          )}
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
        <Box
          mt={2}
          sx={{
            justifyContent: 'space-around',
            alignItems: 'space-between',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <NavButton
            onClick={() => {
              dispatch(set.activeStep(0));
              navigate('/home');
            }}
          >
            BACK
          </NavButton>
          <Badge color="primary" invisible={!isSatelliteMode || isSatelliteMode} badgeContent={nextButtonBadgeContent()}>
            <NavButton
                  // disabled={isSatelliteMode}
              onClick={() => {
                if (isSatelliteMode) {
                  // calcBiomass();
                  dispatch(set.activeStep(3));
                  navigate('/covercrop');
                } else {
                  dispatch(set.activeStep(2));
                  navigate('/soil');
                }
                return null;
              }}
            >
              NEXT
            </NavButton>
          </Badge>
        </Box>
      </Grid>
    </Grid>

  );
}; // Location

export default Location;
