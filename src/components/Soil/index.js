import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

import { get } from '../../store/Store';
import Myslider from '../../shared/Slider';
import Help from '../../shared/Help';


const Soil = () => {
  const gotSSURGO = useSelector(get.gotSSURGO);
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '1rem',
        flexDirection: 'column',
      }}
    >
      <Box p={3} mb={3}>
        <Typography variant="h4">Tell us about your Soil</Typography>
        {gotSSURGO
          ? (
            <Box>
              <Typography variant="h6" my={2}>
                The data below was pulled from NRCS&apos;s Soil Survey
                Geographic database (SSURGO) based on your field&apos;s latitude/longitude coordinates.
              </Typography>
              <Typography variant="h6" my={2}>
                You can adjust them if you have lab results.
              </Typography>
            </Box>
          )
          : ''}

        <Box sx={{ color: '#4f6b14' }}>
          <Box my={5}>
            Organic Matter (%):
            <Help>
              Soil organic matter in the surface (0-10cm) soil
            </Help>
            <Myslider
              id="OM"
              min={0.1}
              max={5}
              step={0.1}
            />
          </Box>
          <Box my={5}>
            Bulk Density (g/cm
            <sup>3</sup>
            ):
            <Help>
              Soil bulk density in the surface (0-10cm) soil
            </Help>
            <Myslider
              id="BD"
              min={0.8}
              max={1.8}
              step={0.1}
            />
          </Box>
          <Box my={5}>
            Soil Inorganic N (ppm or mg/kg):
            <Help>
              Soil inorganic nitrogen in the surface (0-10cm) soil
            </Help>
            <Myslider
              id="InorganicN"
              min={0}
              max={25}
            />
          </Box>
        </Box>
      </Box>
      <Box sx={{
        justifyContent: 'space-around',
        alignItems: 'space-between',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
      }}
      >
        <Button
          sx={{ borderRadius: '1rem', fontSize: '22px', fontWeight: 900 }}
          onClick={() => navigate('/location')}
          variant="contained"
          color="success"
        >
          BACK
        </Button>
        <Button
          sx={{ borderRadius: '1rem', fontSize: '22px', fontWeight: 900 }}
          onClick={() => navigate('/covercrop')}
          variant="contained"
          color="success"
        >
          NEXT
        </Button>
      </Box>
    </Box>
  );
}; // Soil

export default Soil;
