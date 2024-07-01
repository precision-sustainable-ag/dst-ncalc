import React from 'react';
import {
  Route, Routes,
} from 'react-router-dom';
import {
  Box,
} from '@mui/material';

import SnackbarMessage from '../../shared/SnackbarMessage';
import Feedback from '../Feedback';
import About from '../About';

const wrapperStyles = {
  // position: 'absolute',
  // top: '100px',
  // left: 0,
  display: 'flex',
  justifyContent: 'center',
};

export default function index({ screens }) {
  const path = window.location.toString().split('/').pop().toLowerCase() || 'home';
  const Screen = screens[path] || screens.home;

  return (
    <Box sx={wrapperStyles} id="body-wrapper">
      <Routes>
        {
          Object.keys(screens).map((scr) => (
            <Route
              key={scr}
              path={scr.toLowerCase()}
              element={<Screen />}
            />
          ))
        }
        <Route
          path=""
          element={<Screen />}
        />
      </Routes>
      <Feedback />
      <About />
      <SnackbarMessage />
    </Box>
  );
}
