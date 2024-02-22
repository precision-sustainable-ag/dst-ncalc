/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
import {
  Card,
  CardActions,
  CardContent,
  Stack,
  Typography,
  Divider,
  Container,
} from '@mui/material';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);
  const carb = useSelector(get.carb);
  const cell = useSelector(get.cell);
  const lign = useSelector(get.lign);
  const biomass = useSelector(get.biomass);
  const unit = useSelector(get.unit);
  const cornN = useSelector(get.cornN);
  const cashCrop = useSelector(get.cashCrop);
  const Yield = useSelector(get.yield);
  const nweeks = useSelector(get.nweeks);
  const mockup = useSelector(get.mockup);
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const OM = useSelector(get.OM);
  const lwc = useSelector(get.lwc);
  const BD = useSelector(get.BD);
  const InorganicN = useSelector(get.InorganicN);
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);

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
    coverCropTerminationDate,
    InorganicN,
    cashCropPlantingDate,
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
    cashCropPlantingDate,
    coverCropTerminationDate,
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

  useEffect(() => {
    if (chartRef1.current && chartRef2.current) {
      if (!surfaceData || surfaceData.length === 0) {
        chartRef1.current.chart.showLoading();
        chartRef2.current.chart.showLoading();
      } else {
        chartRef1.current.chart.hideLoading();
        chartRef2.current.chart.hideLoading();
      }
    }
  }, [surfaceData, incorporatedData]);

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
          {surfaceData.length > 0
            && (
              <Container sx={{ fontSize: 9, paddingBottom: '10px' }}>
                <Typography variant="subtitle2">
                  By
                  <Typography variant="subtitle2" component="span" fontWeight="bold" m={1}>
                    4 weeks
                  </Typography>
                  after cover crop termination, undecomposed residue mass remaining is:
                </Typography>
                <Typography variant="subtitle2">
                  <Typography variant="subtitle2" component="span" fontWeight="bold" m={0}>
                    {Math.round(surfaceData[Math.min(nweeks * 7, surfaceData.length - 1)].y)}
                  </Typography>
                  <Typography variant="subtitle2" component="span" fontWeight="bold" m={1}>
                    {unit}
                  </Typography>
                  for incorporated residues.
                </Typography>
              </Container>
            )}
          <HighchartsReact
            ref={chartRef1}
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
              cashCropPlantingDate,
              maxSurface,
            })}
          />
          <Divider orientation="horizontal" sx={dividerStyles} />
          <HighchartsReact
            ref={chartRef2}
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
