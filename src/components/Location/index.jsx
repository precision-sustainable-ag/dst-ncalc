import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Stack, Typography, Badge, Paper, Grid } from '@mui/material';
import { PSALoadingSpinner, PSATooltip, PSAAccordion, PSATextField } from 'shared-react-components/src';
import BiomassMap from '../../shared/Map/BiomassMap';
import Help from '../../shared/Help';
import { get, set } from '../../store/Store';
import NavButton from '../../shared/Navigate/NavButton';
import useFetchHLS from '../../hooks/useFetchHLS';
import Datebox from '../../shared/BiomassData/Datebox';
import { AreaErrorModal, TaskFailModal } from '../../shared/BiomassData/Warnings';
import { historyStates } from '../../store/inits';

const nextButtonBadgeContent = () => (
  <PSATooltip title="No polygon is drawn" tooltipContent={(
    <Typography>?</Typography>
  )}
  />
);

// TODO: barebone is a var to decide if this view is showed as a widget, same in other pages
const Location = ({ barebone = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const biomassFetchIsLoading = useSelector(get.biomassFetchIsLoading);
  const biomassTaskResults = useSelector(get.biomassTaskResults);
  const polyDrawTooBig = useSelector(get.polyDrawTooBig);
  const biomassFetchIsFailed = useSelector(get.biomassFetchIsFailed);
  const field = useSelector(get.field);
  const { historyState, userHistoryList } = useSelector(get.user);

  const [fieldName, setFieldName] = useState(field);
  const [isExpanded, setIsExpanded] = useState(false); // State for controlling accordion expansion

  // API for getting biomass map
  useFetchHLS();

  // Check if field name exists in user history
  const isFieldNameExisted = () => {
    if (historyState === historyStates.imported) return false;
    const result = userHistoryList.find((history) => history.label === 'history-'.concat(fieldName));
    return result !== undefined;
  };

  return (
    <Box sx={{ width: '100%', padding: '0rem' }}>
      <Box mb={-2}>
        <PSAAccordion
          expanded={isExpanded} // Controlled by state
          onChange={() => setIsExpanded(!isExpanded)} // Toggle expanded state
          summaryContent={!barebone && (
            <Typography variant="h5" gutterBottom>
              Where is your Field located?
            </Typography>
          )}
          detailsContent={(
            <>
              <Stack mb={1}>
                <Typography variant="h8" gutterBottom>
                  Enter your address or zip code to determine your field&apos;s location. You can then zoom in and click to pinpoint it on the map. If
                  you know your exact coordinates, you can enter them in search bar separated by comma (ex. 37.7, -80.2 ).
                </Typography>
                {isSatelliteMode && (
                  <Typography variant="h8" gutterBottom pt={1}>
                    Specify your field&apos;s boundary on the map using the drawing tool.
                  </Typography>
                )}
              </Stack>
              <Box mb={2}>
              <PSATextField
                label="Name your Field (optional)"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                error={isFieldNameExisted()}
                helperText={isFieldNameExisted() ? 'Field name existed!' : null}
                onBlur={() => {
                  if (!isFieldNameExisted()) dispatch(set.field(fieldName));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isFieldNameExisted()) dispatch(set.field(fieldName));
                }}
              />
                <Help />
              </Box>
              <Stack mt={5} gap={1}>
                {isSatelliteMode && (
                  <Typography variant="h8" gutterBottom>
                    Specify your crop&apos;s planting and termination dates.
                  </Typography>
                )}
                <Datebox />
              </Stack>
            </>
          )}
          testId="location-accordion"
        />
      </Box>
      <Box sx={{ margin: '2rem 0rem' }}>
        <Paper sx={{ padding: '1rem', borderRadius: '1rem' }}>
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
          {polyDrawTooBig && (
            <AreaErrorModal />
          )}
          {biomassFetchIsFailed && (
            <TaskFailModal task="biomass" />
          )}
          <BiomassMap variant="biomass" />
          {!barebone && (
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
          )}
        </Paper>
      </Box>
    </Box>
  );
}; // Location

export default Location;
