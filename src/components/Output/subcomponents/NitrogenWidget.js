/* eslint-disable no-console */
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
  getNitrogenChartOptions,
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
const NitrogenCard = ({ props }) => {
  const {
    refVal,
    targetN,
    // surfaceMin,
    incorporatedNPredict,
    // incorporatedMin,
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
    // model,
  } = props;

  console.log('props', props);
  console.log('doCornN', doCornN);

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
          gap={5}
          justifyContent="space-around"
          width="100%"
        // alignItems="stretch"
        >
          <HighchartsReact
            containerProps={HighChartsContainerProps}
            highcharts={Highcharts}
            options={getGeneralChartOptions({
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
            })}
          />
          <Divider orientation="horizontal" sx={dividerStyles} />
          <HighchartsReact
            containerProps={HighChartsContainerProps}
            highcharts={Highcharts}
            // className="hidden"
            options={getNitrogenChartOptions({
              mockup,
              outputN,
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
