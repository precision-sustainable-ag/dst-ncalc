import { Box, Paper } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavButton from './NavButton';

const NavigateBar = ({
  backRoute,
  nextRoute,
  backText = 'BACK',
  nextText = 'NEXT',
}) => {
  const navigate = useNavigate();
  return (
    <Paper
      sx={{
        justifyContent: 'space-around',
        alignItems: 'space-between',
        width: '100%',
        padding: '1rem',
      }}
    >
      <Box
        sx={{
          justifyContent: 'space-around',
          alignItems: 'space-between',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <NavButton onClick={() => navigate(backRoute)}>
          {backText}
        </NavButton>
        <NavButton onClick={() => navigate(nextRoute)}>
          {nextText}
        </NavButton>
      </Box>
    </Paper>
  );
};
export default NavigateBar;
