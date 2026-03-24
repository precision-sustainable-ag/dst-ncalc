/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
import React from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { PSALoadingSpinner } from 'shared-react-components/src';
import { useSelector } from 'react-redux';
import Map from '../../../shared/Map/NitrogenMap';
import BiomassData from '../../../shared/BiomassData';
import { get } from '../../../store/redux-autosetters';

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
const BiomassMapWidget = ({ refVal }) => {
  const biomassFetchIsLoading = useSelector(get.biomassFetchIsLoading);

  return (
    <Card sx={CardStyles} elevation={8} ref={refVal}>
      <CardContent sx={cardContentStyles}>
        <Typography sx={{ fontSize: 22 }} color="text.secondary" gutterBottom textAlign="center">
          Biomass Map
        </Typography>
        <BiomassData />
        {biomassFetchIsLoading && (
          <Box>
            <Grid
              item
              container
              spacing={1}
              justifyContent="center"
              alignItems="center"
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100px',
              }}
            >
              <PSALoadingSpinner />
            </Grid>
            <Typography variant="h6" fontWeight="bold" gutterBottom textAlign="center">
              Calculating Biomass ...
            </Typography>
          </Box>
        )}
        <Box sx={{ height: '90%', width: '100%', marginBottom: 5 }}>
          <Map variant="biomass" />
        </Box>
      </CardContent>
    </Card>
  );
};

export default BiomassMapWidget;
