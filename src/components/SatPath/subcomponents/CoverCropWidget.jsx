/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
import React from 'react';
import {
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';
import CoverCropFirst from '../../CoverCrop/CoverCropFirst';
import CoverCropSecond from '../../CoverCrop/CoverCropSecond';

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

/// /// /// COMPONENTS /// /// ///
/// /// /// RETURN JSX /// /// ///
const CoverCropCard = ({ refVal }) => {
  return (
    <Card sx={CardStyles} elevation={8} ref={refVal}>
      <CardContent sx={cardContentStyles}>
        <Typography
          sx={{ fontSize: 22 }}
          color="text.secondary"
          gutterBottom
          textAlign="center"
        >
          Cover Crop
        </Typography>
      </CardContent>
      <CardActions>
        <Grid container spacing={2}>
          <CoverCropFirst barebone />
          <CoverCropSecond barebone />
        </Grid>
      </CardActions>
    </Card>
  );
};

export default CoverCropCard;
