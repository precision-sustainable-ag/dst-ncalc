/* eslint-disable no-console */
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';
import React from 'react';

const wrapperStyles = {
  backgroundColor: 'orange',
  width: '100%',
  padding: 5,
};
const CardStyles = {
  minWidth: { xs: 400, sm: 300 },
  width: '100%',
};

const CardItem = () => (
  <Card sx={CardStyles} elevation={8}>
    <CardContent>
      <Typography
        sx={{ fontSize: 22 }}
        color="text.secondary"
        gutterBottom
      >
        Summary
      </Typography>
      <Typography
        sx={{ mb: 1.5 }}
        color="text.secondary"
      >
        adjective
      </Typography>
      <Typography variant="body2">
        well meaning and kindly. a benevolent
        smile
      </Typography>
    </CardContent>
    <CardActions>
      <Button size="small">Learn More</Button>
    </CardActions>
  </Card>
);

const RightSideBar = () => {
  console.log('RightSideBar');
  return (
    <Box
      sx={wrapperStyles}
      flex={4}
      justifyContent="center"
    >
      <Grid container spacing={5}>
        <Grid item sm={12} xl={6}>
          <CardItem />
        </Grid>
        <Grid item sm={12} xl={6}>
          <CardItem />
        </Grid>
        <Grid item sm={12} xl={6}>
          <CardItem />
        </Grid>
        <Grid item sm={12} xl={6}>
          <CardItem />
        </Grid>
        <Grid item sm={12} xl={6}>
          <CardItem />
        </Grid>
        <Grid item sm={12} xl={6}>
          <CardItem />
        </Grid>
      </Grid>
    </Box>
  );
};
export default RightSideBar;
