/* eslint-disable no-console */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useNavigate, Route, Routes, useLocation,
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  AppBar, Box, Button, useMediaQuery,
} from '@mui/material';
import {
  PSATheme, PSAHeader, PSAAuthButton, FadeAlert, PSAProfile, PSASkipContent,
} from 'shared-react-components/src';
import { useAuth0 } from '@auth0/auth0-react';
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import Feedback from './components/Feedback';
import SnackbarMessage from './shared/SnackbarMessage';
import './App.scss';
import 'react-datepicker/dist/react-datepicker.css';
import { get, set } from './store/Store';
import FieldDropdown from './components/FieldDropdown';
import NcalcStepper from './shared/Stepper';
import useFetchHLS from './hooks/useFetchHLS';
import { useFetchPlantFactors } from './hooks/useFetchApi';
import ProtectedPage from './shared/ProtectedPage/ProtectedPage';
import { initAuth } from './utils/apiClient';
import ActionModal from './shared/Modal';

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
screens.upload = require('./components/Upload').default;
screens.field = require('./components/AddField').default;
screens.editfield = require('./components/AddField').default;
screens.viewfield = require('./components/AddField').default;
screens.fileupload = require('./components/FileUpload').default;
screens.fertilizer = require('./components/NitrogenFertilizer').default;

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

const localTheme = {
  ...PSATheme,
  typography: {
    ...PSATheme.typography,
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
    inputLabel: {
      fontSize: '1.2rem',
      fontWeight: 400,
      color: '#598445',
    },
  },
};

const dstTheme = createTheme(localTheme);

const App = () => {
  useSelector(get.screen); // force render
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { getAccessTokenSilently, loginWithPopup } = useAuth0();

  useFetchHLS();
  useFetchPlantFactors();

  const matchesMd = useMediaQuery(dstTheme.breakpoints.down('md'));

  const path = window.location.toString().split('/').pop().toLowerCase() || 'home';
  const Screen = screens[path] || screens.home;

  const { showAlert, alertSeverity, alertMessage } = useSelector(get.user);
  const isPM3DMode = useSelector(get.biomassCalcMode) === 'pm3d';
  const actionModal = useSelector(get.actionModal);

  const noStepperPaths = ['/profile', '/field', '/editfield', '/viewfield', '/fileupload'];
  const showStepper = !noStepperPaths.includes(location.pathname.toLowerCase());

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
      text: 'Feedback',
      dialog: <Feedback />,
    },
    ...(isPM3DMode
      ? [
        {
          type: 'button',
          variant: 'text',
          text: 'Upload Files',
          icon: <CloudUploadOutlinedIcon />,
          rightIcon: true,
          onClick: () => {
            dispatch(set.activeStep(0));
            navigate('/fileupload');
          },
        },
      ]
      : []),
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
        dispatch(set.user.alertMessage(null));
      }, 5000);
    }
  }, [dispatch, showAlert]);

  useEffect(() => {
    initAuth(getAccessTokenSilently, loginWithPopup);
  }, [getAccessTokenSilently, loginWithPopup]);

  return (
    <ThemeProvider theme={dstTheme}>
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

      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" component="header" sx={{ backgroundColor: 'white' }}>
          <PSAHeader title="Cover Crop Nitrogen Calculator" onLogoClick={() => navigate('/')} navContent={navContent} />
        </AppBar>

        {showStepper && (
        <AppBar
          position={matchesMd ? 'static' : 'sticky'}
          component="nav"
          sx={{ zIndex: 1000, backgroundColor: 'white' }}
        >
          <NcalcStepper />
        </AppBar>
        )}
        <Box
          id="main-content"
          sx={{
            flex: 1,
            minWidth: '100%',
            backgroundImage: `url(${'/background_0.jpg'})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <Routes>
            {Object.keys(screens).map((scr) => {
              const ScreenComponent = screens[scr];

              const protectedPaths = ['upload', 'field', 'editfield', 'viewfield', 'fileupload'];
              if (isPM3DMode) {
                protectedPaths.push('covercrop', 'fertilizer', 'output');
              }

              const element = protectedPaths.includes(scr.toLowerCase()) ? (
                <ProtectedPage>
                  <ScreenComponent />
                </ProtectedPage>
              ) : (
                <ScreenComponent />
              );
              return <Route key={scr} path={scr.toLowerCase()} element={element} />;
            })}
            <Route path="" element={<Screen />} />
          </Routes>
          <ActionModal {...actionModal} onClose={() => { dispatch(set.actionModal({ ...actionModal, open: false })); }} />
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
      </Box>
    </ThemeProvider>
  );
}; // App

window.addEventListener(
  'error',
  (err) => {
    if (/(localhost|dev)/i.test(window.location)) return;

    const requestPayload = {
      repository: 'dst-feedback',
      title: 'CRASH',
      name: 'error',
      email: 'error@error.com',
      comments: `${err?.message}: ${err?.filename}`,
      labels: ['crash', 'dst-ncalc'],
    };
    console.log(requestPayload);

    /* eslint-disable no-alert */
    fetch('https://feedback.covercrop-data.org/v1/issues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    })
      .then((response) => response.json())
      .then((body) => {
        console.log(body.data);
        if (body?.data?.status === 'success') {
          alert(`
          An error occurred.
          We have been notified and will investigate the problem.
        `);
        } else {
          alert('An error occurred');
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(error);
        alert('Failed to send Feedback to Github.');
      });
  },
  { once: true },
);
/* eslint-enable no-alert */

export default App;
