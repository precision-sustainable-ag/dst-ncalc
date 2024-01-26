/* eslint-disable no-console */
import React, { useEffect } from 'react';
import {
  useDispatch,
  // useDispatch,
  useSelector,
} from 'react-redux';
import { useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container } from '@mui/material';
import ResponsiveNavBar from './components/ResponsiveNavBar';
import Body from './components/Body';
import './App.scss';
import 'react-datepicker/dist/react-datepicker.css';
import { get, set } from './store/Store';

const screens = {
  init: () => null,
};

screens.init = require('./components/Init').default;
screens.home = require('./components/Home').default;
screens.about = require('./components/About').default;
screens.location = require('./shared/Location').default;
screens.soil = require('./components/Soil').default;
screens.covercrop = require('./components/CoverCrop').CoverCrop1;
screens.covercrop2 = require('./components/CoverCrop').CoverCrop2;
screens.cashcrop = require('./components/CashCrop').default;
screens.output = require('./components/Output').default;
screens.feedback = require('./components/Feedback').default;
screens.advanced = require('./components/Advanced').default;

screens.init.showInMenu = false;

if (screens.feedback) {
  screens.feedback.showInMenu = false;
}

Object.keys(screens).forEach((key) => {
  screens[key].desc = screens[key].desc || (key[0].toUpperCase() + key.slice(1));
});

const holdWarn = console.warn;
console.warn = (msg, ...subst) => {
  if (!/Deprecation|Autocomplete/.test(msg)) {
    holdWarn(msg, ...subst);
  }
};

// const Init = screens.init;

const theme = createTheme({
  typography: {
    feedback: {
      fontFamily: 'IBM Plex Sans',
      textTransform: 'none',
      fontSize: '1rem',
    },
    about: {
      fontFamily: 'IBM Plex Sans',
      textTransform: 'none',
      fontSize: '1rem',
    },
  },
});

const App = () => {
  useSelector(get.screen); // force render
  // eslint-disable-next-line no-unused-vars
  const location = useLocation();

  return (
    <ThemeProvider theme={theme}>
      <Container
        py={50}
        sx={{
          minHeight: '100vh',
          minWidth: '100vw',
          backgroundImage: `url(${'/background_0.jpg'})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <ResponsiveNavBar screens={screens} />
        <Body screens={screens} />
      </Container>
    </ThemeProvider>
  );
}; // App

export default App;
