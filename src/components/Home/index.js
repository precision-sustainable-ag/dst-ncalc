import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';
import {
  Box, Button, Card, Stack, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { get, set } from '../../store/Store';

const Home = () => {
  const dispatch = useDispatch();
  // const privacy = useSelector(get.privacy);
  const biomassCalcMode = useSelector(get.biomassCalcMode);

  useEffect(() => {
    if (window.location.toString().includes('PSA')) {
      dispatch(set.PSA(true));
    }
  }, [dispatch]);

  const handleChange = (event, newValue) => {
    dispatch(set.biomassCalcMode(newValue));
  };

  const navigate = useNavigate();
  // const className = privacy ? 'home background' : 'home';

  return (
    <Card
      maxwidth="lg"
      sx={{
        margin: '5% 10% 0% 10%',
        padding: '5%',
        boxShadow: 5,
        borderRadius: 5,
        opacity: 0.9,
      }}
    >
      <Stack spacing={2} direction="column">
        <Box>
          <Typography variant="h4">Welcome to the Cover Crop Nitrogen Calculator (CC-NCALC)</Typography>
        </Box>
        <Box>
          <Typography variant="h6">
            This calculator aids farmers with decision support regarding
            cover crop residue persistence, as well as the amount and timing of nitrogen availability.
          </Typography>
        </Box>
      </Stack>
      <Box sx={{ height: 60 }} />
      <Stack spacing={2} direction="column">
        <Stack justifyContent="space-around" alignItems="center" sx={{ flexDirection: { sm: 'column', md: 'row' } }}>
          <Typography variant="h6"> Select biomass calculation method </Typography>
          <ToggleButtonGroup
            color="primary"
            value={biomassCalcMode}
            exclusive
            onChange={handleChange}
            aria-label="biomassCalcMode"
          >
            <ToggleButton
              sx={{
                border: '2px solid black',
                borderRadius: '0.2rem',
                fontSize: { xs: '14px', sm: '16px', md: '18px' },
                padding: '0.3rem',
              }}
              value="sampled"
            >
              User Sampled
            </ToggleButton>
            <Box sx={{ width: 10, borderRight: '2px solid black' }} />
            <ToggleButton
              sx={{
                border: '2px solid black',
                borderRadius: '0.2rem',
                fontSize: { xs: '14px', sm: '16px', md: '18px' },
                padding: '0.3rem',
              }}
              value="satellite"
            >
              Satellite
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>
      <Box sx={{ height: 100 }} />
      <Stack spacing={2} direction="row" justifyContent="space-around">
        {/* <Button sx={{ fontSize: '24px', fontWeight: 900 }} variant="contained" color="success">
          About
        </Button> */}

        <Button
          sx={{ fontSize: '24px', fontWeight: 900 }}
          onClick={() => navigate('/location')}
          variant="contained"
          color="success"
        >
          Get Started
        </Button>
      </Stack>
    </Card>
  );
}; // Home

export default Home;
