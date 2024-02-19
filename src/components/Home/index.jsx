/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, Stack, ToggleButton, ToggleButtonGroup, Typography, styled,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { get, set } from '../../store/Store';
import NavButton from '../../shared/Navigate/NavButton';

const BiomassMethodButton = styled(ToggleButton)(() => ({
  '&.Mui-selected': {
    borderRadius: '0rem',
    boxShadow: 'none',
    backgroundColor: '#bde0fe',
    color: 'black',
    '&:hover': {
      backgroundColor: 'lightblue',
      color: 'black',
    },
  },
  '&:hover': {
    backgroundColor: '#bde0fe',
    color: 'black',
  },
  border: '3px solid black',
  borderRadius: '0rem',
  fontSize: '16px',
  fontWeight: 900,
  padding: '0.5rem',
  backgroundColor: '#ffffff',
  color: 'black',
}));

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
    if (newValue === null) return;
    dispatch(set.biomassCalcMode(newValue));
  };

  useEffect(() => {
    dispatch(set.coverCrop([]));
  }, [biomassCalcMode]);

  const navigate = useNavigate();
  // const className = privacy ? 'home background' : 'home';

  return (
    <Card
      maxwidth="lg"
      sx={{
        margin: '0% 5% 0% 5%',
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
            <BiomassMethodButton
              value="sampled"
            >
              User Sampled
            </BiomassMethodButton>
            {/* <Box sx={{ width: 10, borderRight: '2px solid black' }} /> */}
            <BiomassMethodButton
              value="satellite"
            >
              Satellite
            </BiomassMethodButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>
      <Box sx={{ height: 100 }} />
      <Stack spacing={2} direction="row" justifyContent="space-around">
        <NavButton
          onClick={() => dispatch(set.openAboutModal(true))}
          fontSize="1rem"
        >
          About
        </NavButton>
        <NavButton
          onClick={() => navigate('/location')}
          fontSize="1rem"
        >
          Get Started
        </NavButton>
      </Stack>
    </Card>
  );
}; // Home

export default Home;
