/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { NcalcMap } from '@psa/dst.ui.ncalc-map';
import Biomass from '../../../shared/Biomass';

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

export default MapVisCard;
