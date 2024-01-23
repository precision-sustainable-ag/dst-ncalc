/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React from 'react';
import { Box, Grid } from '@mui/material';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';

import NitrogenCard from './NitrogenWidget';
import ResidueCard from './ResidueWidget';
import MapVisCard from './MapVisWidget';
import { SummaryCard, OtherCard } from './SummaryWidget';
// import { useFetchModel } from '../../../hooks/useFetchApi';
// import model from './model.json';
// import { modelCalc } from './helpers';
// import { get } from '../../../store/redux-autosetters';
// import { useFetchCornN, useFetchModel } from '../../../hooks/useFetchApi';
// import Loading from './Loading';
// import Highcharts from 'highcharts';
// import HighchartsReact from 'highcharts-react-official';

/// /// /// STYLES /// /// ///
const wrapperStyles = {
  width: '80%',
  padding: 5,
};

/// /// /// ROOT COMPONENT /// /// ///
const RightSideBar = ({ summaryData, refs }) => {
  /// /// /// VARIABLES /// /// ///
  // if (!model) return <Loading />;

  /// /// RETURN JSX /// ///
  return (
    <Box sx={wrapperStyles} flex={4} justifyContent="center">
      <Grid container spacing={5}>
        <Grid item sm={12} width="100%">
          <SummaryCard refVal={refs[0]} data={summaryData} />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <NitrogenCard
            props={{
              refVal: refs[1],
            }}
          />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <ResidueCard
            props={{
              refVal: refs[2],
            }}
          />
        </Grid>
        <Grid item sm={12} lg={12} width="100%">
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
