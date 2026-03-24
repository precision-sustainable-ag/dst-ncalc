/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
import { React, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
} from '@mui/material';
import { PSALoadingSpinner, PSARadioButton } from 'shared-react-components/src';
import { useDispatch, useSelector } from 'react-redux';
import Map from '../../../shared/Map/NitrogenMap';
import { get } from '../../../store/redux-autosetters';
import NavButton from '../../../shared/Navigate/NavButton';
import { downloadPrescriptionShapefile } from '../../../hooks/useFetchApi';

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
  const dispatch = useDispatch();
  const isPM3DMode = useSelector(get.biomassCalcMode) === 'pm3d';
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const nitrogenFetchIsLoading = useSelector(get.nitrogenFetchIsLoading);
  const nitrogenTaskResults = useSelector(get.nitrogenTaskResults);
  const [layer, setLayer] = useState('prescription');

  const handleDownloadClick = () => {
    downloadPrescriptionShapefile(nitrogenTaskResults?.reqN, dispatch);
  };

  return (
    <Card sx={CardStyles} elevation={8} ref={refVal}>
      <CardContent sx={cardContentStyles}>
        <Typography sx={{ fontSize: 22 }} color="text.secondary" gutterBottom textAlign="center">
          Field Map
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
        <Box sx={{ height: '90%', width: '100%', marginBottom: 2 }}>
          <Map variant="nitrogen" layer={layer} />
        </Box>

        <Box sx={{
          width: '100%',
          p: 2,
          bgcolor: '#f9f9f9',
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
        >
          <PSARadioButton
            options={[
              { label: 'Prescription', value: 'prescription' },
              { label: 'Nitrogen Credit', value: 'credit' },
              { label: 'Biomass', value: 'biomass' },
            ]}
            selectedValue={layer}
            onChange={(value) => setLayer(value)}
            row
          />
          {(isPM3DMode || isSatelliteMode) && (
          <NavButton
            onClick={handleDownloadClick}
            disabled={!nitrogenTaskResults?.reqN || nitrogenFetchIsLoading}
            sx={{ mt: 2 }}
          >
            Download Prescription
          </NavButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NitrogenMapWidget;
