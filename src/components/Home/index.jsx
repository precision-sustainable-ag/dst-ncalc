/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Grid, Stack, ToggleButton, ToggleButtonGroup, Typography, styled,
  useMediaQuery,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { get, set } from '../../store/Store';
import About from '../About';
import HistorySelect from '../HistorySelect';
import NavigateBar from '../../shared/Navigate';

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
  const [aboutOpen, setAboutOpen] = useState(false);
  const dispatch = useDispatch();
  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));
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
    dispatch(set.coverCrop([]));
  };

  const navigate = useNavigate();
  // const className = privacy ? 'home background' : 'home';

  return (
    <Grid container justifyContent="center">
      <Grid
        item
        xs={12}
        md={10}
        sx={{
          marginTop: '1rem',
          padding: `2rem ${matchesMd ? '1rem' : '4rem'}`,
          boxShadow: 5,
          borderRadius: 5,
          opacity: 0.9,
          backgroundColor: 'white',
        }}
      >
        <Stack spacing={2} direction="column">
          <Box>
            <Typography variant="h4" align="center">Welcome to the Cover Crop Nitrogen Calculator (CC-NCALC)</Typography>
          </Box>
          <Box>
            <Typography variant="h6" align="center">
              This calculator aids farmers with decision support regarding cover crop residue persistence,
              as well as the amount and timing of nitrogen availability.
            </Typography>
          </Box>
        </Stack>
        <HistorySelect />
        <Box sx={{ height: '2rem' }} />
        <Stack spacing={2} direction="column">
          <Stack justifyContent="space-around" alignItems="center" sx={{ flexDirection: { sm: 'column', md: 'row' } }}>
            <Typography variant="h6"> Select biomass calculation method </Typography>
            <ToggleButtonGroup color="primary" value={biomassCalcMode} exclusive onChange={handleChange} aria-label="biomassCalcMode">
              <BiomassMethodButton value="sampled">User Sampled</BiomassMethodButton>
              {/* <Box sx={{ width: 10, borderRight: '2px solid black' }} /> */}
              <BiomassMethodButton value="satellite">Satellite</BiomassMethodButton>
              <BiomassMethodButton value="pm3d">PM3D</BiomassMethodButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
        <Box sx={{ height: '1rem' }} />
        <NavigateBar
          next="Get Started"
          nextOnClick={() => {
            if (biomassCalcMode !== 'pm3d') {
              navigate('/location');
              dispatch(set.activeStep(1));
            } else {
              navigate('/upload');
            }
          }}
          back="About"
          backOnClick={() => setAboutOpen(true)}
        />
        <About open={aboutOpen} setOpen={setAboutOpen} />
      </Grid>
    </Grid>

  );
}; // Home

export default Home;
