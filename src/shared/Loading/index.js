import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

export default function index() {
  return (
    <Box
      sx={{
        margin: '1rem',
        padding: '1rem',
        backgroundColor: '#eee',
        borderRadius: '1rem',
        border: '2px black solid',
      }}
    >
      <Paper
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem',
        }}
      >
        <Typography variant="h4">Loading Output</Typography>
        <Typography variant="h5">Please wait</Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
          }}
        >
          <CircularProgress color="secondary" />
          &nbsp;&nbsp;
          <CircularProgress color="success" />
          &nbsp;&nbsp;
          <CircularProgress color="inherit" />
        </Box>
      </Paper>
    </Box>
  );
}
