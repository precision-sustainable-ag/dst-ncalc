/* eslint-disable no-console */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useNavigate, Route, Routes,
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Box, Button, useMediaQuery,
} from '@mui/material';
import {
  PSATheme, PSAHeader, PSAAuthButton, FadeAlert, PSAProfile, PSASkipContent,
} from 'shared-react-components/src';
import { deepmerge } from '@mui/utils';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
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

screens.profile = () => <PSAProfile styles={{ backgroundColor: 'white' }} />;

screens.init.showInMenu = false;

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
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));

  const path = window.location.toString().split('/').pop().toLowerCase() || 'home';
  const Screen = screens[path] || screens.home;

  const { showAlert, alertSeverity, alertMessage } = useSelector(get.user);

  const navContent = [
    {
      type: 'button',
      variant: 'text',
      text: 'Profile',
      icon: <AccountBoxOutlinedIcon />,
      rightIcon: true,
      onClick: () => navigate('/profile'),
      textSx: { fontSize: '1rem' },
    },
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

  // auto close alert in fixed time
  useEffect(() => {
    if (showAlert) {
      setTimeout(() => {
        dispatch(set.user.showAlert(false));
      }, 3000);
    }
  }, [showAlert]);

  return (
    <ThemeProvider theme={dstTheme}>
      <Auth0ProviderWithNavigate>
        <PSASkipContent
          text="Skip to main content"
          component="button"
          onClick={() => {
            const el = document.getElementById('main-content');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              el.setAttribute('tabindex', '-1');
              el.focus();
            }
          }}
          sx={{ '&.MuiLink-root.Mui-focusVisible': { outlineOffset: '5px', outlineColor: 'black' } }}
        />
        <PSAHeader title="Cover Crop Nitrogen Calculator" onLogoClick={() => navigate('/')} navContent={navContent} />
        <NcalcStepper />
        <Box
          id="main-content"
          sx={{
            minHeight: `calc(99.7vh - ${matchesMd ? '85px' : '255px'})`,
            minWidth: '100%',
            backgroundImage: `url(${'/background_0.jpg'})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <Routes>
            {Object.keys(screens).map((scr) => (
              <Route key={scr} path={scr.toLowerCase()} element={<Screen />} />
            ))}
            <Route path="" element={<Screen />} />
          </Routes>
          <Feedback />
          <SnackbarMessage />
          <Box sx={{ position: 'fixed', bottom: matchesMd ? '45px' : 0, zIndex: 1000 }}>
            <FadeAlert
              showAlert={showAlert}
              severity={alertSeverity}
              message={alertMessage}
              action={<Button onClick={() => dispatch(set.user.showAlert(false))}>CLOSE</Button>}
            />
          </Box>
        </Box>
      </Auth0ProviderWithNavigate>
    </ThemeProvider>
  );
}; // App

export default App;
