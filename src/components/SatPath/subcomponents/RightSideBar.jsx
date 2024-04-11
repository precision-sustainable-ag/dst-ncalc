/* eslint-disable no-console */
import React from 'react';
import { Box, Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import NitrogenCard from './NitrogenWidget';
import ResidueCard from './ResidueWidget';
import SoilCard from './SoilWidget';
import BiomassMapWidget from './BiomassMapWidget';
import { SummaryCard } from './SummaryWidget';
import NitrogenMapWidget from './NitrogenMapWidget';
import { get } from '../../../store/redux-autosetters';
import NavigateButtons from '../../../shared/Navigate';
import LocationCard from './LocationWidget';
// import CoverCropCard from './CoverCropFirstWidget';
import CashCropCard from './CashCropWidget';
import CoverCropFirstCard from './CoverCropFirstWidget';
import CoverCropSecondCard from './CoverCropSecondWidget';

/// /// /// STYLES /// /// ///
const wrapperStyles = {
  maxWidth: {
    sm: '75%',
    md: '75%',
    lg: '80%',
    xl: '90%',
  },
  padding: 0,
};

/// /// /// ROOT COMPONENT /// /// ///
const RightSideBar = ({ summaryData, refs }) => {
  /// /// /// VARIABLES /// /// ///
  // if (!model) return <Loading />;
  useSelector(get.screen); // force render
  useSelector(get.biomassTaskResults); // force render
  useSelector(get.nitrogenTaskResults); // force render

  /// /// RETURN JSX /// ///
  return (
    <Box
      sx={wrapperStyles}
      flex={4}
      justifyContent="center"
      id="rightside-wrapper"
    >
      <Grid container spacing={3}>
        <Grid item sm={12} lg={6} width="100%">
          <LocationCard refVal={refs[0]} />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <SoilCard refVal={refs[1]} />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <CoverCropFirstCard refVal={refs[2]} />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <CoverCropSecondCard refVal={refs[3]} />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <CashCropCard refVal={refs[4]} />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <NitrogenCard refVal={refs[5]} />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <ResidueCard refVal={refs[6]} />
        </Grid>
        {/* <Grid item sm={12} lg={6} width="100%">
          <BiomassMapWidget refVal={refs[7]} />
        </Grid> */}
        <Grid item sm={12} lg={6} width="100%">
          <SummaryCard refVal={refs[7]} data={summaryData} />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <NitrogenMapWidget refVal={refs[8]} />
        </Grid>
        <Grid item sm={12} lg={12} width="100%" my={5}>
          <NavigateButtons
            backRoute="/home"
            nextRoute="/advanced"
            backText="HOME"
            nextText="ADVANCED"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RightSideBar;
