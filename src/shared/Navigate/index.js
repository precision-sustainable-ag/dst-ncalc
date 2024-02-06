import { Box, Button, Paper } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

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
        <Button
          sx={{ borderRadius: '1rem', fontSize: '22px', fontWeight: 900 }}
          onClick={() => navigate(backRoute)}
          variant="contained"
          color="success"
        >
          {backText}
        </Button>
        <Button
          sx={{ borderRadius: '1rem', fontSize: '22px', fontWeight: 900 }}
          onClick={() => navigate(nextRoute)}
          variant="contained"
          color="success"
        >
          {nextText}
        </Button>
      </Box>
    </Paper>
  );
};
export default NavigateBar;
