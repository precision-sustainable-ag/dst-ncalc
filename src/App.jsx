/* eslint-disable no-console */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useLocation, useNavigate, Route, Routes,
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, Box, Button } from '@mui/material';
import {
  PSATheme, PSAHeader, PSAAuthButton, FadeAlert,
} from 'shared-react-components/src';
import { deepmerge } from '@mui/utils';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
// import ResponsiveNavBar from './components/ResponsiveNavBar';
import Feedback from './components/Feedback';
import SnackbarMessage from './shared/SnackbarMessage';
import './App.scss';
import 'react-datepicker/dist/react-datepicker.css';
import { get, set } from './store/Store';
import FieldDropdown from './components/FieldDropdown';
import NcalcStepper from './shared/Stepper';
import Auth0ProviderWithNavigate from './shared/AuthProvider';

const screens = {
  init: () => null,
};

screens.init = require('./components/FieldDropdown').default;
screens.home = require('./components/Home').default;
screens.about = require('./components/About').default;
screens.location = require('./components/Location').default;
screens.soil = require('./components/Soil').default;
screens.covercrop = require('./components/CoverCrop').CoverCropFirst;
screens.covercrop2 = require('./components/CoverCrop').CoverCropSecond;
screens.cashcrop = require('./components/CashCrop').default;
screens.output = require('./components/Output').default;
screens.feedback = require('./components/Feedback').default;
screens.advanced = require('./components/Advanced').default;
screens.satpath = require('./components/SatPath').default;

screens.init.showInMenu = false;
screens.satpath.showInMenu = false;

if (screens.feedback) {
  screens.feedback.showInMenu = false;
}

Object.keys(screens).forEach((key) => {
  screens[key].desc = screens[key].desc || key[0].toUpperCase() + key.slice(1);
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

const dstTheme = createTheme(deepmerge(PSATheme, theme));

const App = () => {
  useSelector(get.screen); // force render
  // eslint-disable-next-line no-unused-vars
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const path = window.location.toString().split('/').pop().toLowerCase() || 'home';
  const Screen = screens[path] || screens.home;

  const { showAlert, alertSeverity, alertMessage } = useSelector(get.user);

  const navContent = [
    {
      type: 'button',
      variant: 'text',
      text: 'Feedback',
      icon: <ChatBubbleOutlineIcon />,
      rightIcon: true,
      style: { fontSize: '1rem' },
      textSx: { fontSize: '1rem' },
      onClick: () => {
        dispatch(set.openFeedbackModal(true));
      },
    },
    {
      type: 'component',
      component: <FieldDropdown />,
    },
    {
      type: 'component',
      component: <PSAAuthButton />,
    },
  ];

  return (
    <ThemeProvider theme={dstTheme}>
      <Auth0ProviderWithNavigate>
        <PSAHeader title="Cover Crop Nitrogen Calculator" onLogoClick={() => navigate('/')} navContent={navContent} />
        <NcalcStepper />
        <Container
          // py={50}
          id="app-container"
          sx={{
            minHeight: 'calc(99.7vh - 255px)',
            minWidth: '100%',
            backgroundImage: `url(${'/background_0.jpg'})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '1rem',
            }}
            id="body-wrapper"
          >
            <Routes>
              {Object.keys(screens).map((scr) => (
                <Route key={scr} path={scr.toLowerCase()} element={<Screen />} />
              ))}
              <Route path="" element={<Screen />} />
            </Routes>
            <Feedback />
            <SnackbarMessage />
            <Box sx={{ position: 'fixed', bottom: 0, zIndex: 1000 }}>
              <FadeAlert
                showAlert={showAlert}
                severity={alertSeverity}
                message={alertMessage}
                action={<Button onClick={() => dispatch(set.user.showAlert(false))}>CLOSE</Button>}
              />
            </Box>
          </Box>
        </Container>
      </Auth0ProviderWithNavigate>
    </ThemeProvider>
  );
}; // App

export default App;
