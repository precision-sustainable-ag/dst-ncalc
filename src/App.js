import React, {useEffect} from 'react';

import './App.css';

import moment from 'moment';

import {makeStyles} from '@material-ui/core';

import 'react-datepicker/dist/react-datepicker.css';

// Screens
import Home       from './Home';
import About      from './About';
import Location   from './Location';
import Soil       from './Soil';
import {CoverCrop1, CoverCrop2, CoverCrop3} from './CoverCrop';
import {Output1, Output2} from './Output';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

const App = () => {
  /*
    const mean = (data, parm, dec = 2) => {
      data = data
              .filter(d => d[parm])
              .map(d => d[parm]);

      return (data.reduce((a, b) => +a + +b) / data.length).toFixed(dec);
    } // mean
  */

  const weightedAverage = (data, parm, dec = 2) => {
    let totpct = 0;

    data = data
            .filter(d => d[parm])
            .map(d => {
              totpct += +d.comppct_r;
              return d[parm] * d.comppct_r;
            });

    return (data.reduce((a, b) => +a + +b) / totpct).toFixed(dec);
  } // weightedAverage

  const screens = {
    Home,
    About,
    Location,
    Soil,
    CoverCrop1,
    CoverCrop2,
    CoverCrop3,
    Output1,
    Output2
  };

  useEffect(() => {
    if (!parms.lat || !parms.lng || !parms.coverCropKillDate || !parms.plantingDate) {
      return;
    }

    sets.weather([]);

    const src = `https://weather.aesl.ces.uga.edu/weather/hourly?lat=${parms.lat}&lon=${parms.lng}&start=${moment(parms.coverCropKillDate).format('yyyy-MM-DD')}&end=${moment(parms.coverCropKillDate).add(120, 'days').format('yyyy-MM-DD')}&attributes=air_temperature,relative_humidity,precipitation&predicted=true&zoptions=GMT`;
    console.log(src);
    clearTimeout(weatherTimer);
    weatherTimer = setTimeout(() => {
      fetch(src)
        .then(response => response.json())
        .then(data => {
          if (!(data instanceof Array)) {
            alert(`No data found.\nPlease choose a location within the conterminous United States.`);
          } else {
            sets.weather(data);
            console.log('Weather:');
            console.log(data);
            console.log('_'.repeat(60));
          }
        });
    }, 1000)
  }, [
    parms.lat,
    parms.lng,
    parms.plantingDate,
    parms.coverCropKillDate,
  ]);

  useEffect(() => {
    if (!parms.lat || !parms.lng) {
      return;
    }

    sets.BD('');
    sets.OM('');

    const src = `https://api.precisionsustainableag.org/ssurgo?lat=${parms.lat}&lon=${parms.lng}&component=major`;
    console.log(src);
    clearTimeout(ssurgoTimer);
    sets.gotSSURGO(false);
    ssurgoTimer = setTimeout(() => {
      fetch(src)
        .then(response => response.json())
        .then(data => {
          if (data instanceof Array) {
            sets.gotSSURGO(true);
            console.log('SSURGO:');
            console.log(data);
            console.log('_'.repeat(60));
            
            data = data.filter(d => d.desgnmaster !== 'O');

            const minhzdept = Math.min.apply(Math, data.map(d => d.hzdept_r));
            data = data.filter(d => +d.hzdept_r === +minhzdept);

            console.log('_'.repeat(60));
            console.log(JSON.stringify(data.map(d => [d.dbthirdbar_r, d.om_r, d.comppct_r, d.hzdept_r]), null, 2));
            console.log(weightedAverage(data, 'dbthirdbar_r'));
            sets.BD(weightedAverage(data, 'dbthirdbar_r'));
            sets.OM(weightedAverage(data, 'om_r'));
          }
        });
    }, 10)
  }, [
    parms.lat,
    parms.lng,
  ]);

  const Screens = ({parms}) => {
    // can't do useState in a loop unless it's in a component, even if that component is unused
    const State = (parm, value) => {
      [parms[parm], sets[parm]] = React.useState(value);
    }

//    localStorage.setItem(parms.fieldID || 'data', JSON.stringify(parms));

    for (const [parm, value] of Object.entries(parms)) {
      State(parm, value);
    }

    const update = (e) => {
      try {
        const id = e.target.id;
        if (id === 'googlemap') {
          return;
        }
        const val = e.target.value;
        console.log(JSON.stringify(val));

        if (/species/.test(id)) {
          alert('ok')
          sets[id]([val]);
        } else {
          sets[id](val);
        }
        console.log(id, val);

        // doesn't work with slider, and is a step behind input
        if (/carb|cellulose/.test(id)) {
          // sets.lignin(100 - (+parms.carb + +parms.cellulose))
        }

      } catch(ee) {
        console.log(e.target.id, ee.message);
      }
    } // update

    const changeScreen = (e) => {
      const button = e.target;

      if (button.tagName === 'BUTTON') {
        setScreen(button.dataset.scr);
      }
    } // changeScreen

    return (
      <div onChange={update} id="Main">
        <nav onClick={changeScreen}>
          <img src="logo.png" alt="" />
          <button className={/Home|About/.test(screen)  ? 'selected' : ''} data-scr="Home"       >Home</button>
          <button className={/Location/.test(screen)    ? 'selected' : ''} data-scr="Location"   >Location</button>
          <button className={/Soil/.test(screen)        ? 'selected' : ''} data-scr="Soil"       >Soil</button>
          <button className={/CoverCrop/.test(screen)   ? 'selected' : ''} data-scr="CoverCrop1" >Cover Crop</button>
          <button className={/Output/.test(screen)      ? 'selected' : ''} data-scr="Output1"    >Output</button>
        </nav>

        {screens[screen]({
          ps: ps,
          sets: sets,
          parms: parms,
          setScreen: setScreen
        })}
      </div>
    )
  } // Screens

  const classes = useStyles();
  let [screen, setScreen2] = React.useState('Home');

  const setScreen = (scr) => {
    const test = (parm, scr, desc = `Please enter ${parm}`) => {
      if (!parms[parm]) {
        alert(desc);
        setScreen(scr);
        return true;
      }
    } // test
    
    if (scr === 'Output1') {
      test('lat', 'Location', 'Please enter Latitude and Longitude') ||
      test('lng', 'Location', 'Please enter Latitude and Longitude') ||

      test('coverCropKillDate', 'CoverCrop1', 'Please enter Cover Crop Termination Date') ||
      test('biomass', 'CoverCrop1', 'Please enter Biomass') ||
      test('lwc', 'CoverCrop1', 'Please enter Water Content') ||

      test('N', 'CoverCrop2', 'Please enter Nitrogen') ||
      test('carb', 'CoverCrop2', 'Please enter Carbohydrates') ||
      test('cellulose', 'CoverCrop2', 'Please enter Cellulose') ||
      test('lignin', 'CoverCrop2', 'Please enter Lignin') ||

      test('plantingDate', 'CoverCrop3', 'Please enter Cash Crop Planting Date') ||

      test('OM', 'Soil', 'Please enter Organic Matter') ||
      test('BD', 'Soil', 'Please enter Bulk Density') ||
      test('InorganicN', 'Soil', 'Please enter Soil Inorganic N') ||

      setScreen2('Output1');
    } else {
      setScreen2(scr);
    }
  } // setScreen
  
  return (
    <div className={classes.root}>
      <Screens parms={parms} />
    </div>
  );
} // App

const test = /test/.test(window.location.search);

let weatherTimer;
let ssurgoTimer;

const sets = {};

let parms = {
  name                : test ? 'Rick Hitchcock' : '',
  field               : test ? 'My field' : '',
  sample              : test ? 'My sample' : '',
  targetN             : test ? '100' : '',
  crop                : test ? 'Brown Top Millet' : '',
  coverCropKillDate   : test ? new Date('05/08/2021') : '',
  plantingDate        : test ? new Date('05/20/2021') : '',
  lat                 : test ? 32.5714 : 40.7849,
  lng                 : test ? -82.0760 : -74.8073,
  coverCropOther      : '',
  N                   : test ? 1.52 : '',
  InorganicN          : test ? 10   : 10,
  carb                : test ? 44.34 : '',
  cellulose           : test ? 50.77 : '',
  lignin              : test ? 4.88 : '',
  lwc                 : 4,
  highOM              : 'No',
  nutrient            : 'Left on the surface',
  biomass             : test ? (5198.32 * 2.2).toFixed(0) : '',
  mapZoom             : 13,
  mapType             : 'hybrid',
  weather             : {},
  OM                  : test ? 5   : '',
  BD                  : test ? 1.5 : '',
  yield               : test ? 100 : '',
  residue             : 'surface',
  NContent            : test ? 1000 : '',
  residueC            : test ? 100 : '',
  species             : test ? ['Oats, Black'] : [],
  outputN             : 1,
  gotSSURGO           : false
}

console.clear();

console.log(JSON.parse(localStorage.getItem('data')));

if (!test) {
//  parms = {...parms, ...JSON.parse(localStorage.getItem('data'))}
//  parms.coverCropKillDate = new Date(parms.coverCropKillDate);
//  parms.plantingDate = new Date(parms.plantingDate);
}

const ps = (s) => ({
  id: s,
  value: parms[s]
});

document.title = 'Decomp';

const holdError = console.error;
console.error = (msg, ...subst) => {
  if (!/StrictMode/.test(msg)) {
    holdError(msg, ...subst)
  }
}

export default App;