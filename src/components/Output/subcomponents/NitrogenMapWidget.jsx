/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
import { React, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid
} from '@mui/material';
import Map from '../../../shared/Map/NitrogenMap';
import { PSALoadingSpinner, PSARadioButton } from 'shared-react-components/src';
import { useSelector } from 'react-redux';
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
const NitrogenMapWidget = ({ refVal }) => {
  const nitrogenFetchIsLoading = useSelector(get.nitrogenFetchIsLoading);
  const [layer, setLayer] = useState('reqN');
  
  return (
    <Card sx={CardStyles} elevation={8} ref={refVal}>
      <CardContent sx={cardContentStyles}>
        <Typography sx={{ fontSize: 22 }} color="text.secondary" gutterBottom textAlign="center">
          Nitrogen Map
        </Typography>
        {nitrogenFetchIsLoading && (
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
            Calculating Nitrogen ...
          </Typography>
        </Box>
        )}
        <Box sx={{ height: '90%', width: '100%', marginBottom: 5 }}>
          <Map variant="nitrogen" nitrogenLayer={layer} />
        </Box>

        <PSARadioButton
          options={[
            { label: 'Required Nitrogen Map', value: 'reqN' },
            { label: 'Current Nitrogen Map', value: 'minN' },
          ]}
          selectedValue={layer}
          onChange={(value) => setLayer(value)}
          row
          sx={{ marginLeft: '1em' }}
          aria-label="position"
          name="position"
        />
      </CardContent>
    </Card>
  );}

export default NitrogenMapWidget;
