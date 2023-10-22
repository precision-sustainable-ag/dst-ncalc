import React from 'react';
import {
  Route, Routes,
} from 'react-router-dom';
import {
  Box,
} from '@mui/material';

import Feedback from '../Feedback';
import About from '../About';

export default function index({ screens }) {
  const path = window.location.toString().split('/').pop().toLowerCase() || 'home';
  const Screen = screens[path] || screens.home;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
    </Box>
  );
}
