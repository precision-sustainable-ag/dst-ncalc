/* eslint-disable no-console */
import React, { useState } from 'react';
import {
  // useDispatch,
  useSelector,
} from 'react-redux';
import {
  Route, Routes, useNavigate,
} from 'react-router-dom';

import './App.scss';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  styled,
  Button,
} from '@mui/material';

import { get } from './store/Store';

const NavBarButton = styled(ToggleButton)({
  color: '#fff',
  fontSize: '24px',
  margin: '0 1.5rem',
  backgroundColor: 'transparent',
  padding: '0 1rem',
  fontWeight: 'bold',
  borderRadius: '10px',
  '&.Mui-selected, &.Mui-selected:hover': {
    fontSize: '24px',
    color: '#fff',
    fontWeight: 'bolder',
    borderBottom: '2px solid #fff',
  },
});

// import Help from './shared/Help';

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
  // Deprecation: moment
  // Autocomplete: useless warning, which has an overcomplicated isOptionEqualTo solution
  //               https://github.com/mui/material-ui/issues/29727

  if (!/Deprecation|Autocomplete/.test(msg)) {
    holdWarn(msg, ...subst);
  }
};

const Init = screens.init;

const App = () => {
  // const dispatch = useDispatch();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [navModalOpen, setNavModalOpen] = useState(false);
  const [navBarActive, setNavBarActive] = useState('');
  // const [value, setValue] = useState(0);

  useSelector(get.screen); // force render

  const path = window.location.toString().split('/').pop().toLowerCase() || 'home';
  const Screen = screens[path] || screens.home;

  const handleNavBarChange = (event, newValue) => {
    if (newValue) {
      setNavBarActive(newValue);
    }
  };

  console.log('screens', screens);
  return (
    <div id="Main">
      <Stack spacing={2} direction="column">
        <Stack spacing={2} direction="row" justifyContent="space-around" alignItems="center" style={{ height: '100px' }}>
          <img src="PSALogo.png" alt="logo" style={{ borderRadius: '10px', minHeight: '90%' }} />
          <Box sx={{ minWidth: '50%' }}>
            <ToggleButtonGroup
              disableElevation
              variant="text"
              value={navBarActive}
              onChange={handleNavBarChange}
              exclusive
              aria-label="Disabled elevation buttons"
            >
              {
                Object.keys(screens)
                  .filter((scr) => screens[scr].showInMenu !== false)
                  .map((scr) => (
                    <NavBarButton disableRipple value={scr} key={scr}>{scr}</NavBarButton>
                  ))
              }
            </ToggleButtonGroup>
          </Box>
          <Stack sx={{ minHeight: '50%', alignItems: 'center' }}>
            {screens.feedback && (
              <Button
                color="secondary"
                variant="contained"
                sx={{ margin: '1rem' }}
                onClick={() => {
                  setNavModalOpen(false);
                  navigate('feedback');
                }}
              >
                FEEDBACK
              </Button>
            )}
            <Init desktop setNavModalOpen={setNavModalOpen} />
          </Stack>
        </Stack>
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
        </Box>
      </Stack>
    </div>
  );
}; // App

export default App;
