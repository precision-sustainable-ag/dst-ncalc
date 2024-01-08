/* eslint-disable no-console */
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Skeleton,
  Stack,
  Typography,
  styled,
} from '@mui/material';
import React from 'react';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
// import Highcharts from 'highcharts';
// import HighchartsReact from 'highcharts-react-official';

/// /// STYLES /// ///
const wrapperStyles = {
  width: '100%',
  padding: 5,
};

const CardStyles = {
  borderRadius: 5,
  width: '100%',
};

/// /// COMPONENTS /// ///
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
    <CardContent>
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

const NitrogenCard = ({ refVal }) => (
  <Card sx={CardStyles} elevation={8} ref={refVal}>
    <CardContent justifyContent="center">
      <Typography
        sx={{ fontSize: 22 }}
        color="text.secondary"
        gutterBottom
        textAlign="center"
      >
        Released Nitrogen
      </Typography>

      <Skeleton variant="rectangular" width={400} height={400} />
    </CardContent>
    <CardActions>
      {/* <Box justifyContent="center">
        <Skeleton variant="rectangular" width={210} height={60} />
      </Box> */}
      {/* <Box>
        <HighchartsReact
          highcharts={Highcharts}
          constructorType="stockChart"
          option={nitrogenCardOptions}
        />
      </Box> */}
    </CardActions>
  </Card>
);

const ResidueCard = ({ refVal }) => (
  <Card sx={CardStyles} elevation={8} ref={refVal}>
    <CardContent justifyContent="center">
      <Typography
        sx={{ fontSize: 22 }}
        color="text.secondary"
        gutterBottom
        textAlign="center"
      >
        Released Nitrogen
      </Typography>

      <Skeleton variant="rectangular" width={400} height={400} />
    </CardContent>
    <CardActions>
      {/* <Box justifyContent="center">
        <Skeleton variant="rectangular" width={210} height={60} />
      </Box> */}
      {/* <Box>
        <HighchartsReact
          highcharts={Highcharts}
          constructorType="stockChart"
          option={nitrogenCardOptions}
        />
      </Box> */}
    </CardActions>
  </Card>
);

const MapVisCard = ({ refVal }) => (
  <Card sx={CardStyles} elevation={8} ref={refVal}>
    <CardContent justifyContent="center">
      <Typography
        sx={{ fontSize: 22 }}
        color="text.secondary"
        gutterBottom
        textAlign="center"
      >
        Map Visualization
      </Typography>

      <Skeleton variant="rectangular" width={400} height={400} />
    </CardContent>
    <CardActions>
      {/* <Box justifyContent="center">
        <Skeleton variant="rectangular" width={210} height={60} />
      </Box> */}
      {/* <Box>
        <HighchartsReact
          highcharts={Highcharts}
          constructorType="stockChart"
          option={nitrogenCardOptions}
        />
      </Box> */}
    </CardActions>
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
      <Typography variant="body2">
        lorem ipsum
      </Typography>
    </CardContent>
    <CardActions>
      <Button size="small">Learn More</Button>
    </CardActions>
  </Card>
);

/// /// ROOT COMPONENT /// ///
const RightSideBar = ({ summaryData, refs }) => {
  console.log('summaryData', summaryData);
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
