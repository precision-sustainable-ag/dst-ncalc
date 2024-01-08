/* eslint-disable no-console */
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';

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
const SummaryItem = ({ name, value }) => (
  <Box
    sx={{
      // backgroundColor: 'orange',
      // border: '1px solid black',
      // borderRadius: 2,
      padding: 1,
    }}
  >
    <Stack direction="row">
      <Typography
        sx={{
          borderBottom: '1px dotted rgb(35, 148, 223)',
          borderRadius: 0,
          padding: '0 5px 0 2px',
          background:
            'linear-gradient(90deg, rgba(35, 148, 223, 0.2), rgba(35, 148, 223, 0.0))',
          fontWeight: 900,
          fontSize: 11,
        }}
      >
        {name}
        :&nbsp;
      </Typography>
      <Typography sx={{ fontWeight: 600, fontSize: 11 }}>
        {value}
      </Typography>
    </Stack>
  </Box>
);

const SummaryCard = ({ data }) => (
  <Card sx={CardStyles} elevation={8}>
    <CardContent>
      <Typography
        sx={{ fontSize: 22 }}
        color="text.secondary"
        gutterBottom
      >
        Summary
      </Typography>
      <Typography sx={{ mb: 1.5 }} color="text.secondary">
        adjective
      </Typography>
      <Typography variant="body2">
        well meaning and kindly. a benevolent smile
      </Typography>
    </CardContent>
    <CardActions>
      <Grid container spacing={2}>
        {Object.entries(data).map(([name, value]) => (
          <Grid item xs={12} sm={6} md={4} lg={3} width="100%">
            <SummaryItem name={name} value={value} />
          </Grid>
        ))}
      </Grid>
    </CardActions>
  </Card>
);

const OtherCard = () => (
  <Card sx={CardStyles} elevation={8}>
    <CardContent>
      <Typography
        sx={{ fontSize: 22 }}
        color="text.secondary"
        gutterBottom
      >
        Summary
      </Typography>
      <Typography sx={{ mb: 1.5 }} color="text.secondary">
        adjective
      </Typography>
      <Typography variant="body2">
        well meaning and kindly. a benevolent smile
      </Typography>
    </CardContent>
    <CardActions>
      <Button size="small">Learn More</Button>
    </CardActions>
  </Card>
);

/// /// ROOT COMPONENT /// ///
const RightSideBar = ({ summaryData }) => {
  console.log('summaryData', summaryData);
  return (
    <Box sx={wrapperStyles} flex={4} justifyContent="center">
      <Grid container spacing={5}>
        <Grid item sm={12} width="100%">
          <SummaryCard data={summaryData} />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <OtherCard />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <OtherCard />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <OtherCard />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <OtherCard />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <OtherCard />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <OtherCard />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <OtherCard />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <OtherCard />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <OtherCard />
        </Grid>
      </Grid>
    </Box>
  );
};
export default RightSideBar;
