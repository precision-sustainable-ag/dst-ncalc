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
import {
  getGeneralChartOptions,
  getResidueChartOptions,
} from './chartsOptions';

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
const ResidueCard = ({ props }) => {
  const {
    refVal,
    targetN,
    surfaceMin,
    incorporatedNPredict,
    incorporatedMin,
    surfaceNPredict,
    mockup,
    outputN,
    doCornN,
    unit,
    minDate,
    NUptake,
    surfaceData,
    doIncorporated,
    incorporatedData,
    plantingDate,
    maxSurface,
    model,
  } = props;

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
          gap={5}
          justifyContent="center"
          width="100%"
        >
          <HighchartsReact
            containerProps={HighChartsContainerProps}
            highcharts={Highcharts}
            options={getGeneralChartOptions({
              mockup,
              outputN: 2,
              doCornN: 0,
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
              outputN,
              unit,
              model,
              doIncorporated,
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
