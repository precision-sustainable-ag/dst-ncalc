/* eslint-disable no-console */
import React, { useEffect } from 'react';
import {
  // useDispatch,
  useSelector,
} from 'react-redux';
import { useLocation } from 'react-router-dom';

import ResponsiveNavBar from './components/ResponsiveNavBar';
import Body from './components/Body';

import './App.scss';
import 'react-datepicker/dist/react-datepicker.css';

import { get } from './store/Store';
import clip from './background_horizontal.mp4';

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
  const location = useLocation();
  // eslint-disable-next-line no-unused-vars
  // const [navModalOpen, setNavModalOpen] = useState(false);
  // const [navBarActive, setNavBarActive] = useState('');
  // const [value, setValue] = useState(0);

  useSelector(get.screen); // force render

  useEffect(() => {
    const elem = document.querySelector('#video');
    if (elem) {
      elem.playbackRate = 0.7;
    }
  }, []);

  console.log('location', location);

  return (
    <div id="Main">
      {location ? (location.pathname === '/' || location.pathname === '/home')
        && (
          <div id="background-video">
            <video id="video" autoPlay muted loop>
              <source src={clip} type="video/mp4" />
            </video>
          </div>
        ) : null}
      {/* <div className="background-poster" /> */}
      <ResponsiveNavBar screens={screens} />
      <Body screens={screens} />
    </div>
  );
}; // App

export default App;
