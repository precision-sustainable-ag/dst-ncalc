/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import { Box, Grid } from '@mui/material';
import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
import React from 'react';

import NitrogenCard from './NitrogenWidget';
import ResidueCard from './ResidueWidget';
import MapVisCard from './MapVisWidget';
import { SummaryCard, OtherCard } from './SummaryWidget';
// import { useFetchModel } from '../../../hooks/useFetchApi';
import model from './model.json';
import { modelCalc } from './helpers';
import { get } from '../../../store/redux-autosetters';
// import Highcharts from 'highcharts';
// import HighchartsReact from 'highcharts-react-official';

/// /// /// STYLES /// /// ///
const wrapperStyles = {
  width: '80%',
  padding: 5,
};

/// /// ROOT COMPONENT /// ///
const RightSideBar = ({ summaryData, refs }) => {
  /// /// VARIABLES /// ///
  const doIncorporated = false;
  const N = useSelector(get.N);
  const killDate = useSelector(get.killDate);
  const plantingDate = useSelector(get.plantingDate);
  const carb = useSelector(get.carb);
  const cell = useSelector(get.cell);
  const lign = useSelector(get.lign);
  const biomass = useSelector(get.biomass);
  const unit = useSelector(get.unit);
  const cornN = useSelector(get.cornN);
  const cashCrop = useSelector(get.cashCrop);
  const Yield = useSelector(get.yield);
  const outputN = useSelector(get.outputN);
  const nweeks = useSelector(get.nweeks);
  const targetN = useSelector(get.targetN);
  const mockup = useSelector(get.mockup);
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const OM = useSelector(get.OM);
  const lwc = useSelector(get.lwc);
  const BD = useSelector(get.BD);
  const InorganicN = useSelector(get.InorganicN);

  // /// /// HOOKS /// ///
  // const model = useFetchModel({
  //   lat,
  //   lon,
  //   N,
  //   OM,
  //   BD,
  //   lwc,
  //   unit,
  //   carb,
  //   cell,
  //   lign,
  //   biomass,
  //   killDate,
  //   InorganicN,
  //   plantingDate,
  // });
  // console.log('HOOK model', model);

  const {
    maxSurface,
    surfaceMin,
    incorporatedMin,
    minDate,
    surfaceData,
    incorporatedData,
    NUptake,
    surfaceNPredict,
    incorporatedNPredict,
  } = modelCalc({
    model,
    carb,
    cell,
    lign,
    unit,
    plantingDate,
    killDate,
    cashCrop,
    outputN,
    cornN,
    Yield,
    nweeks,
    biomass,
    doIncorporated: false,
    doCornN: true,
    N,
  });

  console.log('model', model);

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
              targetN,
              surfaceMin,
              incorporatedNPredict,
              incorporatedMin,
              surfaceNPredict,
              mockup,
              outputN,
              doCornN: true,
              unit,
              minDate,
              NUptake,
              surfaceData,
              doIncorporated,
              incorporatedData,
              plantingDate,
              maxSurface,
              model,
            }}
          />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <ResidueCard
            props={{
              refVal: refs[2],
              targetN,
              surfaceMin,
              incorporatedNPredict,
              incorporatedMin,
              surfaceNPredict,
              mockup,
              outputN,
              doCornN: true,
              unit,
              minDate,
              NUptake,
              surfaceData,
              doIncorporated,
              incorporatedData,
              plantingDate,
              maxSurface,
              model,
            }}
          />
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
