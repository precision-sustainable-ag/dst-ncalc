/* eslint-disable no-console */
import { HelpOutlineOutlined } from '@mui/icons-material';
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
const SummaryItem = () => (
  <Box
    sx={{
      backgroundColor: 'orange',
      border: '1px solid black',
      borderRadius: 2,
      padding: 1,
    }}
  >
    <Stack direction="row">
      <Typography>Summary Item</Typography>
      <HelpOutlineOutlined />
    </Stack>
  </Box>
);

const SummaryCard = () => (
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
      <SummaryItem />
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

/// /// COMPONENT /// ///
const RightSideBar = () => {
  console.log('RightSideBar');
  return (
    <Box
      sx={wrapperStyles}
      flex={4}
      justifyContent="center"
    >
      <Grid container spacing={5}>
        <Grid item sm={12} lg={6} width="100%">
          <SummaryCard />
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
