/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Grid, Stack, ToggleButton, ToggleButtonGroup, Typography, styled,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PSATextField } from 'shared-react-components/src';
import { get, set } from '../../store/Store';
import Help from '../../shared/Help';
import NavButton from '../../shared/Navigate/NavButton';
import About from '../About';
import { historyStates } from '../../store/inits';
import HistoryDropdown from '../HistoryDropdown';

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
  // const privacy = useSelector(get.privacy);
  const biomassCalcMode = useSelector(get.biomassCalcMode);

  const { historyState, userHistoryList } = useSelector(get.user);
  const field = useSelector(get.field);
  const [fieldName, setFieldName] = useState(field);

  // Check if field name exists in user history
  const isFieldNameExisted = () => {
    if (historyState === historyStates.imported) return false;
    const result = userHistoryList.find((history) => history.label === 'history-'.concat(fieldName));
    return result !== undefined;
  };

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
        lg={10}
        sx={{
          marginTop: '1rem',
          padding: '2rem 4rem',
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
        <Box
          sx={{
            marginTop: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              backgroundColor: '#fff',
              padding: 4,
              borderRadius: 2,
              boxShadow: 5,
              textAlign: 'center',
            }}
          >
            <Typography mb={2}>
              Would you like to save your selection history? Simply give it a name, and your selections will be stored after you&apos;ve made all your
              selections.
            </Typography>
            <PSATextField
              label="Name your Field (optional)"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              error={isFieldNameExisted()}
              helperText={isFieldNameExisted() ? 'Field name existed!' : null}
              onBlur={() => {
                if (!isFieldNameExisted()) dispatch(set.field(fieldName));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isFieldNameExisted()) dispatch(set.field(fieldName));
              }}
            />
            <Help />
            <Typography mb={2}>Retrieve your previous selections here:</Typography>
            <HistoryDropdown />
          </Box>
        </Box>
        <Box sx={{ height: '2rem' }} />
        <Stack spacing={2} direction="column">
          <Stack justifyContent="space-around" alignItems="center" sx={{ flexDirection: { sm: 'column', md: 'row' } }}>
            <Typography variant="h6"> Select biomass calculation method </Typography>
            <ToggleButtonGroup color="primary" value={biomassCalcMode} exclusive onChange={handleChange} aria-label="biomassCalcMode">
              <BiomassMethodButton value="sampled">User Sampled</BiomassMethodButton>
              {/* <Box sx={{ width: 10, borderRight: '2px solid black' }} /> */}
              <BiomassMethodButton value="satellite">Satellite</BiomassMethodButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
        <Box sx={{ height: '2rem' }} />
        <Stack spacing={2} direction="row" justifyContent="space-around">
          <NavButton onClick={() => setAboutOpen(true)} fontSize="1rem">
            About
          </NavButton>
          <NavButton
            onClick={() => {
              navigate('/location');
              dispatch(set.activeStep(1));
            }}
            fontSize="1rem"
          >
            Get Started
          </NavButton>
        </Stack>
        <About open={aboutOpen} setOpen={setAboutOpen} />
      </Grid>
    </Grid>

  );
}; // Home

export default Home;
