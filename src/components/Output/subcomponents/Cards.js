/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Skeleton,
  Stack,
  Typography,
  Tooltip,
  styled,
  Box,
  Divider,
} from '@mui/material';
import { tooltipClasses } from '@mui/material/Tooltip';
import { NcalcMap } from '@psa/dst.ui.ncalc-map';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import React from 'react';
import {
  getGeneralChartOptions,
  getNitrogenChartOptions,
  // getNitrogenChartOptions,
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
  height: '4px',
  backgroundColor: 'rgba(200,200,200,0.4)',
  borderRadius: '5px',
  width: '100%',
};
/// /// /// COMPONENTS /// /// ///
const CustomWidthTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 300,
  },
});

const CustomTypography = styled(Typography)(() => ({
  borderRadius: 0,
  padding: '0 5px 0 2px',
  fontWeight: 300,
  fontSize: 14,
  '&:hover': {
    cursor: 'help',
  },
  background:
    'linear-gradient(90deg, rgba(35, 148, 223, 0.2), rgba(35, 148, 223, 0.0))',
  borderBottom: '1px dotted rgb(35, 148, 223)',
}));

const SummaryItem = ({ name, value, desc }) => (
  <Box
    sx={{
      padding: 1,
    }}
  >
    <Stack direction="row">
      <CustomWidthTooltip arrow title={desc} placement="top">
        <CustomTypography>
          {name}
          :&nbsp;
        </CustomTypography>
      </CustomWidthTooltip>
      <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
        {value}
      </Typography>
    </Stack>
  </Box>
);

const SummaryCard = ({ data, refVal }) => (
  <Card sx={CardStyles} elevation={8} ref={refVal}>
    <CardContent sx={cardContentStyles}>
      <Typography
        sx={{ fontSize: 22 }}
        color="text.secondary"
        gutterBottom
        textAlign="center"
      >
        Summary of Statistics
      </Typography>
    </CardContent>
    <CardActions>
      <Grid container spacing={2}>
        {Object.entries(data).map(([k, v]) => (
          <Grid item xs={12} sm={6} md={4} lg={3} width="100%">
            <SummaryItem name={k} value={v.value} desc={v.desc} />
          </Grid>
        ))}
      </Grid>
    </CardActions>
  </Card>
);

const NitrogenCard = ({ props }) => {
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
        <Stack direction="column" gap={5}>
          <HighchartsReact
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
        <HighchartsReact
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
      </CardActions>
    </Card>
  );
};

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
        <Stack direction="column" gap={5}>
          <HighchartsReact
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
        <HighchartsReact
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
      </CardActions>
    </Card>
  );
};

const MapVisCard = ({ refVal }) => (
  <Card sx={CardStyles} elevation={8} ref={refVal}>
    <CardContent sx={cardContentStyles}>
      <Typography
        sx={{ fontSize: 22 }}
        color="text.secondary"
        gutterBottom
        textAlign="center"
      >
        Map Visualization
      </Typography>
      {/* <Biomass /> */}
      <NcalcMap />
    </CardContent>
  </Card>
);

const OtherCard = ({ refVal }) => (
  <Card sx={CardStyles} elevation={8} ref={refVal}>
    <CardContent>
      <Typography
        sx={{ fontSize: 22 }}
        color="text.secondary"
        gutterBottom
        textAlign="center"
      >
        pages
      </Typography>
      <Typography sx={{ mb: 1.5 }} color="text.secondary">
        title
      </Typography>
      <Typography variant="body2">lorem ipsum</Typography>
    </CardContent>
    <CardActions>
      <Button size="small">Learn More</Button>
    </CardActions>
  </Card>
);

export {
  SummaryCard,
  NitrogenCard,
  ResidueCard,
  MapVisCard,
  OtherCard,
};
