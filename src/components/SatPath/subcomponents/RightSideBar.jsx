/* eslint-disable no-console */
import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { useMediaQuery } from '@mui/material';
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
  const isLargeScreen = useMediaQuery((theme) => theme.breakpoints.up('lg'));

  // useEffect
  /// /// RETURN JSX /// ///
  return (
    <Box
      sx={wrapperStyles}
      flex={4}
      justifyContent="center"
      id="rightside-wrapper"
    >
      {isLargeScreen ? (
        <Grid container spacing={3}>
          <Grid item sm={12} width="100%">
            <SummaryCard refVal={refs.sideNavDataSummary.ref} data={summaryData} />
          </Grid>
          <Grid item sm={12} lg={6} width="100%">
            <Stack direction="column" spacing={3}>
              <LocationCard refVal={refs.sideNavLocation.ref} />
              <CashCropCard refVal={refs.sideNavCashCrop.ref} />
              <NitrogenCard refVal={refs.sideNavNitrogenReleased.ref} />
              <NitrogenMapWidget refVal={refs.sideNavNitrogenMap.ref} />
            </Stack>
          </Grid>
          <Grid item sm={12} lg={6} width="100%" mt={0.2}>
            <Stack direction="column" spacing={3}>
              <SoilCard refVal={refs.sideNavSoilData.ref} />
              <CoverCropFirstCard refVal={refs.sideNavCoverCrop1.ref} />
              <CoverCropSecondCard refVal={refs.sideNavCoverCrop2.ref} />
              <ResidueCard refVal={refs.sideNavResidueRemaining.ref} />
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
      ) : (
        <Grid container spacing={3}>
          <Grid item sm={12} width="100%">
            <SummaryCard refVal={refs.sideNavDataSummary.ref} data={summaryData} />
          </Grid>
          <Grid item sm={12} width="100%">
            <LocationCard refVal={refs.sideNavLocation.ref} />
          </Grid>
          <Grid item sm={12} width="100%">
            <SoilCard refVal={refs.sideNavSoilData.ref} />
          </Grid>
          <Grid item sm={12} width="100%">
            <CoverCropFirstCard refVal={refs.sideNavCoverCrop1.ref} />
          </Grid>
          <Grid item sm={12} width="100%">
            <CoverCropSecondCard refVal={refs.sideNavCoverCrop2.ref} />
          </Grid>
          <Grid item sm={12} width="100%">
            <CashCropCard refVal={refs.sideNavCashCrop.ref} />
          </Grid>
          <Grid item sm={12} width="100%">
            <NitrogenCard refVal={refs.sideNavNitrogenReleased.ref} />
          </Grid>
          <Grid item sm={12} width="100%">
            <ResidueCard refVal={refs.sideNavResidueRemaining.ref} />
          </Grid>
          <Grid item sm={12} width="100%">
            <NitrogenMapWidget refVal={refs.sideNavNitrogenMap.ref} />
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
      )}
    </Box>
  );
};

export default RightSideBar;
