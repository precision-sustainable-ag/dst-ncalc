/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
import {
  Card,
  CardActions,
  CardContent,
  Stack,
  Typography,
  Divider,
} from '@mui/material';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import React from 'react';
import { useSelector } from 'react-redux';
import {
  getGeneralChartOptions,
  getResidueChartOptions,
} from './chartsOptions';
import { modelCalc } from './helpers';
import { get } from '../../../store/redux-autosetters';
import { useFetchModel } from '../../../hooks/useFetchApi';

/// /// /// STYLES /// /// ///
const CardStyles = {
  borderRadius: 5,
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
};

const cardContentStyles = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

const dividerStyles = {
  height: '2px',
  backgroundColor: 'rgba(20,20,20,0.4)',
  borderRadius: '5px',
  width: '100%',
};

const HighChartsContainerProps = {
  style: {
    // border: '1px solid red',
    minWidth: '100%',
  },
};
/// /// /// COMPONENTS /// /// ///

/// /// /// RETURN JSX /// /// ///
const ResidueCard = ({ refVal }) => {
  /// /// /// VARIABLES /// /// ///
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
  const mockup = useSelector(get.mockup);
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const OM = useSelector(get.OM);
  const lwc = useSelector(get.lwc);
  const BD = useSelector(get.BD);
  const InorganicN = useSelector(get.InorganicN);
  // const doCornN = useSelector(get.doCornN);

  // /// /// HOOKS /// ///

  const model = useFetchModel({
    lat,
    lon,
    N,
    OM,
    BD,
    lwc,
    unit,
    carb,
    cell,
    lign,
    biomass,
    killDate,
    InorganicN,
    plantingDate,
  });

  const {
    maxSurface,
    minDate,
    surfaceData,
    incorporatedData,
    NUptake,
    incorporatedMin,
    surfaceMin,
  } = modelCalc({
    model,
    carb,
    cell,
    lign,
    unit,
    plantingDate,
    killDate,
    cashCrop,
    outputN: 2,
    cornN,
    Yield,
    nweeks,
    biomass,
    doIncorporated: false,
    doCornN: false,
    N,
  });

  return (
    <Card sx={CardStyles} elevation={8} ref={refVal}>
      <CardContent sx={cardContentStyles}>
        <Stack gap={2}>
          <Typography
            sx={{ fontSize: 22 }}
            color="text.secondary"
            gutterBottom
            textAlign="center"
          >
            Remaining Residue
          </Typography>
        </Stack>
      </CardContent>
      <CardActions>
        <Stack
          direction="column"
          gap={2}
          justifyContent="center"
          width="100%"
        >
          <HighchartsReact
            containerProps={HighChartsContainerProps}
            highcharts={Highcharts}
            options={getGeneralChartOptions({
              mockup,
              outputN: 2,
              doCornN: false,
              unit,
              minDate,
              NUptake,
              surfaceData,
              doIncorporated,
              incorporatedData,
              plantingDate,
              maxSurface,
            })}
          />
          <Divider orientation="horizontal" sx={dividerStyles} />
          <HighchartsReact
            containerProps={HighChartsContainerProps}
            highcharts={Highcharts}
            options={getResidueChartOptions({
              mockup,
              outputN: 2,
              unit,
              model,
              doIncorporated: false,
              incorporatedMin,
              surfaceMin,
            })}
          />
        </Stack>
      </CardActions>
    </Card>
  );
};

export default ResidueCard;
