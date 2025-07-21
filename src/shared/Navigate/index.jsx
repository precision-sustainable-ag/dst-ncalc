import React from 'react';
import { Box } from '@mui/material';
import NavButton from './NavButton';

const NavigateBar = ({
  next, back, nextOnClick, backOnClick, nextDisabled = false, nextTooltip = '',
}) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-around',
      backgroundColor: 'white',
      borderRadius: 5,
      padding: '1rem',
      opacity: 0.9,
      width: '100%',
    }}
  >
    <NavButton onClick={backOnClick}>{back}</NavButton>
    <NavButton onClick={nextOnClick} disabled={nextDisabled} tooltip={nextTooltip}>{next}</NavButton>
  </Box>
);
export default NavigateBar;
