/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import React, { useEffect, useRef } from 'react';
import {
  Card,
  CardActions,
  CardContent,
  Stack,
  Typography,
  Divider,
  Container,
  Box,
} from '@mui/material';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useDispatch, useSelector } from 'react-redux';
import {
  getGeneralChartOptions,
  getNitrogenChartOptions,
} from './chartsOptions';
import { modelCalc } from './helpers';
import { get, set } from '../../../store/redux-autosetters';
import { useFetchCornN, useFetchModel } from '../../../hooks/useFetchApi';
import useFetchNitrogen from '../../../hooks/useFetchNitrogen';

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
    // border: '2px solid red',
    minWidth: '100%',
  },
};

/// /// /// RETURN JSX /// /// ///
const NitrogenCard = ({ refVal }) => {
  /// /// /// VARIABLES /// /// ///
  const dispatch = useDispatch();
  const doIncorporated = false;
  const N = useSelector(get.N);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);
  const carb = useSelector(get.carb);
  const cell = useSelector(get.cell);
  const lign = useSelector(get.lign);
  const biomass = useSelector(get.biomass);
  const unit = useSelector(get.unit);
  let cornN = useSelector(get.cornN);
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
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);

  // /// /// HOOKS /// ///
  cornN = useFetchCornN();
  useFetchNitrogen();

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
    surfaceNPredict,
    incorporatedNPredict,
    dates,
  } = modelCalc({
    model,
    carb,
    cell,
    lign,
    unit,
    cashCropPlantingDate,
    coverCropTerminationDate,
    cashCrop,
    outputN: 1,
    cornN,
    Yield,
    nweeks,
    biomass,
    doIncorporated: false,
    doCornN: cashCrop ? cashCrop.toLowerCase() === 'corn' : false,
    N,
  });

  useEffect(() => {
    dispatch(set.dates(dates));
  }, [dates]);

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
            textAlign="center"
            gutterBottom
          >
            Released Nitrogen
          </Typography>
        </Stack>
      </CardContent>
      <CardActions>
        <Stack
          direction="column"
          gap={2}
          justifyContent="space-around"
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
                  after cover crop termination, cumulative N released is:
                </Typography>
                <Typography variant="subtitle2">
                  <Typography variant="subtitle2" component="span" fontWeight="bold" m={0}>
                    {Math.round(surfaceData[Math.min(nweeks * 7, surfaceData.length - 1)].y)}
                  </Typography>
                  <Typography variant="subtitle2" component="span" fontWeight="bold" m={1}>
                    {unit}
                  </Typography>
                  for surface residues.
                </Typography>
              </Container>
            )}
          <Box sx={{ width: '100%' }}>
            <HighchartsReact
              ref={chartRef1}
              containerProps={HighChartsContainerProps}
              highcharts={Highcharts}
              showLoading
              options={getGeneralChartOptions({
                mockup,
                outputN,
                doCornN: cashCrop ? cashCrop.toLowerCase() === 'corn' : false,
                unit,
                minDate,
                NUptake,
                surfaceData,
                doIncorporated,
                incorporatedData,
                cashCropPlantingDate,
                maxSurface,
                N,
                biomass,
              })}
            />
          </Box>
          <Divider orientation="horizontal" sx={dividerStyles} />
          <HighchartsReact
            ref={chartRef2}
            containerProps={HighChartsContainerProps}
            highcharts={Highcharts}
            options={getNitrogenChartOptions({
              mockup,
              outputN: 1,
              unit,
              targetN,
              doIncorporated,
              incorporatedNPredict,
              surfaceNPredict,
            })}
          />
        </Stack>
      </CardActions>
    </Card>
  );
};
export default NitrogenCard;
