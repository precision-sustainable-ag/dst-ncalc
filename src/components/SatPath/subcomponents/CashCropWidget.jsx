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
import CashCrop from '../../CashCrop';

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
const CashCropCard = ({ refVal }) => {
  return (
    <Card sx={CardStyles} elevation={8} ref={refVal}>
      <CardContent sx={cardContentStyles}>
        <Typography
          sx={{ fontSize: 22 }}
          color="text.secondary"
          gutterBottom
          textAlign="center"
        >
          Cash Crop
        </Typography>
      </CardContent>
      <CardActions>
        <Grid container spacing={2}>
          <CashCrop barebone/>
        </Grid>
      </CardActions>
    </Card>
  );
};

export default CashCropCard;
