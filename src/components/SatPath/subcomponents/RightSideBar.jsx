/* eslint-disable no-console */
import React from 'react';
import { Box, Grid, Stack } from '@mui/material';
import { useSelector } from 'react-redux';
import NitrogenCard from './NitrogenWidget';
import ResidueCard from './ResidueWidget';
import SoilCard from './SoilWidget';
// import BiomassMapWidget from './BiomassMapWidget';
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
        <Grid item sm={12} width="100%">
          <SummaryCard refVal={refs[0]} data={summaryData} />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <Stack direction="column" spacing={3}>
            <LocationCard refVal={refs[1]} />
            <SoilCard refVal={refs[2]} />
            <CoverCropFirstCard refVal={refs[3]} />
            <CoverCropSecondCard refVal={refs[4]} />
          </Stack>
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <Stack direction="column" spacing={3}>
            <CashCropCard refVal={refs[5]} />
            <NitrogenCard refVal={refs[6]} />
            <ResidueCard refVal={refs[7]} />
            <NitrogenMapWidget refVal={refs[8]} />
          </Stack>
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
