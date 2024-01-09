/* eslint-disable no-console */
import { Box, Grid } from '@mui/material';
import React from 'react';
import {
  MapVisCard,
  NitrogenCard,
  OtherCard,
  ResidueCard,
  SummaryCard,
} from './Cards';
import { useFetchModel } from '../../../hooks/useFetchApi';
// import Highcharts from 'highcharts';
// import HighchartsReact from 'highcharts-react-official';

/// /// /// STYLES /// /// ///
const wrapperStyles = {
  width: '100%',
  padding: 5,
};

/// /// ROOT COMPONENT /// ///
const RightSideBar = ({ summaryData, refs }) => {
  const modelData = useFetchModel();
  console.log('HOOK modelData', modelData);

  return (
    <Box sx={wrapperStyles} flex={4} justifyContent="center">
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
        <Grid item sm={12} lg={6} width="100%">
          <MapVisCard refVal={refs[3]} />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <OtherCard />
        </Grid>
      </Grid>
    </Box>
  );
};
export default RightSideBar;
