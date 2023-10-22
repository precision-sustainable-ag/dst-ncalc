/* eslint-disable no-console */
import React from 'react';
import {
  // useDispatch,
  useSelector,
} from 'react-redux';

import ResponsiveNavBar from './components/ResponsiveNavBar';
import Body from './components/Body';

import './App.scss';
import 'react-datepicker/dist/react-datepicker.css';

import { get } from './store/Store';
import Feedback from './components/Feedback';
import { Box, Modal, Typography } from '@mui/material';

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

// const Init = screens.init;

const App = () => {
  // const dispatch = useDispatch();
  // const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  // const [navModalOpen, setNavModalOpen] = useState(false);
  // const [navBarActive, setNavBarActive] = useState('');
  // const [value, setValue] = useState(0);

  useSelector(get.screen); // force render

  // const handleNavBarChange = (event, newValue) => {
  //   if (newValue) {
  //     setNavBarActive(newValue);
  //   }
  // };

  return (
    <div id="Main">
      <ResponsiveNavBar screens={screens} />
      <Body screens={screens} />
    </div>
  );
}; // App

export default App;
