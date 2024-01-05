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

  // TO BE REMOVED
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(set.edited(true));
    dispatch(set.lat(32.865389));
    dispatch(set.lon(-82.258361));
    dispatch(set.location('Example'));
    dispatch(set.field('Example: Grass'));
    dispatch(set.OM(0.75));
    dispatch(set.BD(1.62));
    dispatch(set.InorganicN(10));
    dispatch(set.coverCrop(['Rye']));
    dispatch(set.killDate('2019-03-21'));
    dispatch(set.plantingDate('2019-04-01'));
    dispatch(set.biomass(5000));
    dispatch(set.lwc(1.486));
    dispatch(set.N(0.6));
    dispatch(set.carb(33.45));
    dispatch(set.cell(57.81));
    dispatch(set.lign(8.74));
    dispatch(set.cashCrop('Corn'));
    dispatch(set.yield(150));
    dispatch(set.targetN(150));
  }, []);
  // TO BE REMOVED

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
