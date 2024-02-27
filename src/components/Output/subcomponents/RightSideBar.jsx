/* eslint-disable no-console */
import React from 'react';
import { Box, Grid } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import NitrogenCard from './NitrogenWidget';
import ResidueCard from './ResidueWidget';
import BiomassMapWidget from './BiomassMapWidget';
import { SummaryCard } from './SummaryWidget';
import { get } from '../../../store/redux-autosetters';
import NavigateButtons from '../../../shared/Navigate';
import NitrogenMapWidget from './NitrogenMapWidget';

/// /// /// STYLES /// /// ///
const wrapperStyles = {
  maxWidth: {
    sm: '75%', md: '75%', lg: '80%', xl: '90%',
  },
  padding: 0,
};

/// /// /// ROOT COMPONENT /// /// ///
const RightSideBar = ({ summaryData, refs }) => {
  /// /// /// VARIABLES /// /// ///
  // if (!model) return <Loading />;
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  useSelector(get.screen); // force render
  useSelector(get.biomassTaskResults); // force render
  useSelector(get.nitrogenTaskResults); // force render

  /// /// RETURN JSX /// ///
  return (
    <Box sx={wrapperStyles} flex={4} justifyContent="center" id="rightside-wrapper">
      <Grid container spacing={5}>
        <Grid item sm={12} width="100%">
          <SummaryCard refVal={refs[0]} data={summaryData} />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <NitrogenCard refVal={refs[1]} />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <ResidueCard refVal={refs[2]} />
        </Grid>
        {isSatelliteMode && (
          <Grid item sm={12} lg={12} width="100%">
            <BiomassMapWidget refVal={refs[3]} />
          </Grid>
        )}
        {isSatelliteMode && (
          <Grid item sm={12} lg={12} width="100%">
            <NitrogenMapWidget refVal={refs[4]} />
          </Grid>
        )}
        <Grid item sm={12} lg={12} width="100%">
          <NavigateButtons
            backRoute="/cashcrop"
            nextRoute="/advanced"
            backText="BACK"
            nextText="ADVANCED"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RightSideBar;
