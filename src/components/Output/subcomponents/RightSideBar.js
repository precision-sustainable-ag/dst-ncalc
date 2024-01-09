/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import { Box, Grid } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import {
  MapVisCard,
  NitrogenCard,
  OtherCard,
  ResidueCard,
  SummaryCard,
} from './Cards';
import { useFetchModel } from '../../../hooks/useFetchApi';
import { modelCalc } from './helpers';
import { get } from '../../../store/redux-autosetters';
// import Highcharts from 'highcharts';
// import HighchartsReact from 'highcharts-react-official';

/// /// /// STYLES /// /// ///
const wrapperStyles = {
  width: '100%',
  padding: 5,
};

/// /// ROOT COMPONENT /// ///
const RightSideBar = ({ summaryData, refs }) => {
  const model = useFetchModel();
  const modelData = useFetchModel();
  console.log('HOOK modelData', modelData);
  console.log('HOOK model', model);
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
    N,
    doIncorporated,
  });

  return (
    <Box sx={wrapperStyles} flex={4} justifyContent="center">
      <Grid container spacing={5}>
        <Grid item sm={12} width="100%">
          <SummaryCard refVal={refs[0]} data={summaryData} />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <NitrogenCard
            refVal={refs[1]}
            props={{
              mockup,
              outputN,
              unit,
              targetN,
              surfaceMin,
              doIncorporated,
              incorporatedNPredict,
              incorporatedMin,
              surfaceNPredict,
              model,
            }}
          />
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
