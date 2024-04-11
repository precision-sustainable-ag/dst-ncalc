/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import Map from '../../../shared/Map/NitrogenMap';
import Biomass from '../../../shared/Biomass';
import BiomassMapComp from '../../../shared/Map/BiomassMap';

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
const BiomassMapWidget = ({ refVal }) => (
  <Card sx={CardStyles} elevation={8} ref={refVal}>
    <CardContent sx={cardContentStyles}>
      <Typography
        sx={{ fontSize: 22 }}
        color="text.secondary"
        gutterBottom
        textAlign="center"
      >
        Biomass Map
      </Typography>
      {/* <BiomassMapComp /> */}
      <Box sx={{ height: '90%', width: '100%', marginBottom: 5 }}>
        <Map variant="biomass" />
      </Box>
    </CardContent>
  </Card>
);

export default BiomassMapWidget;
