// testing VS Code

import React, {useEffect} from 'react';

import './App.css';

import moment from 'moment';

import {makeStyles} from '@material-ui/core';

import 'react-datepicker/dist/react-datepicker.css';

// import './data';

// Screens
import Home       from './Home';
import About      from './About';
import Location   from './Location';
import Soil       from './Soil';
import {CoverCrop1, CoverCrop2} from './CoverCrop';
import CashCrop   from './CashCrop';
import Output     from './Output';
import Advanced   from './Advanced';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

const Help = ({parms}) => {
  const style = {
    left: parms.helpX,
    top: parms.helpY
  }

  return (
    parms.help &&
    <div
      className="help"
      style={style}
      dangerouslySetInnerHTML={{ __html: parms.help }}
    />
  )
}

const Screens = ({parms}) => {
  let [screen, setScreen2] = React.useState('Home');

  const screens = {
    Home,
    About,
    Location,
    Soil,
    CoverCrop1,
    CoverCrop2,
    CashCrop,
    Output,
    Advanced,
  };

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

  const setScreen = (scr) => {
    const test = (parm, scr, desc = `Please enter ${parm}`) => {
      if (!parms[parm]) {
        alert(desc);
        setScreen(scr);
        return true;
      }
    } // test
    
    if (/Output|Advanced/.test(scr)) {
      if (demo && !parms.BD) {
        parms.OM = 1.5;
        sets.OM(1.5);
        parms.BD = 1.6;
        sets.BD(1.6);
      }

      test('lat', 'Location', 'Please enter Latitude and Longitude') ||
      test('lng', 'Location', 'Please enter Latitude and Longitude') ||

      test('killDate', 'CoverCrop1', 'Please enter Cover Crop Termination Date') ||
      test('biomass', 'CoverCrop1', 'Please enter Biomass') ||
      test('lwc', 'CoverCrop1', 'Please enter Water Content') ||

      test('N', 'CoverCrop2', 'Please enter Nitrogen') ||
      test('carb', 'CoverCrop2', 'Please enter Carbohydrates') ||
      test('cell', 'CoverCrop2', 'Please enter Cellulose') ||
      test('lign', 'CoverCrop2', 'Please enter Lignin') ||

      test('plantingDate', 'CashCrop', 'Please enter Cash Crop Planting Date') ||

      test('BD', 'Soil', 'Please enter Bulk Density') ||
      test('InorganicN', 'Soil', 'Please enter Soil Inorganic N') ||

      setScreen2(scr);
    } else {
      setScreen2(scr);
    }
  } // setScreen

  useEffect(() => {
    if (!parms.lat || !parms.lng || !parms.killDate || !parms.plantingDate) {
      return;
    }

    sets.weather([]);

    const src = `https://weather.aesl.ces.uga.edu/weather/hourly?lat=${parms.lat}&lon=${parms.lng}&start=${moment(parms.killDate).format('yyyy-MM-DD')}&end=${moment(parms.plantingDate).add(110, 'days').format('yyyy-MM-DD')}&attributes=air_temperature,relative_humidity,precipitation&options=predicted,zGMT`;
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
          }
        });
    }, 1000)
  }, [
    parms.lat,
    parms.lng,
    parms.plantingDate,
    parms.killDate,
  ]);

  useEffect(() => {
    if (!parms.lat || !parms.lng) {
      return;
    }

    if (!parms.firstSSURGO) {
      sets.BD('');
    }
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
            
            data = data.filter(d => d.desgnmaster !== 'O');

            const minhzdept = Math.min.apply(Math, data.map(d => d.hzdept_r));
            data = data.filter(d => +d.hzdept_r === +minhzdept);

            console.log(JSON.stringify(data.map(d => [d.dbthirdbar_r, d.om_r, d.comppct_r, d.hzdept_r]), null, 2));
            console.log(weightedAverage(data, 'dbthirdbar_r'));

            if (!parms.firstSSURGO || !parms.BD) {
              sets.BD(weightedAverage(data, 'dbthirdbar_r'));
            }
            sets.firstSSURGO(false);
            
            sets.OM(weightedAverage(data, 'om_r'));
          }
        });
    }, 1000)
  }, [
    parms.lat,
    parms.lng
  ]);

  const loadField = (field) => {
    const inputs = JSON.parse(localStorage[field]);
    Object.keys(inputs).forEach(key => {
      try {
        if (/Date/.test(key)) {
          sets[key](new Date(inputs[key]));
        } else {
          sets[key](inputs[key]);
        }
      } catch(e) {
        console.log(key, e.message);
      }
    });
  } // loadField

  const update = (e) => {
    try {
      const id = e.target.id;
      if (/googlemap|mui/.test(id)) {
        return;
      }
      const val = e.target.value;
      console.log(JSON.stringify(val));

      sets[id](val);
      console.log(id, val);

      // doesn't work with slider, and is a step behind input
      if (/carb|cell/.test(id)) {
        // sets.lign(100 - (+parms.carb + +parms.cell))
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

  const changeField=(e) => {
    loadField(e.target.value);
  } // changeField

  const changePSA=(e) => {
    const PSA = examples[e.target.value];
    
    Object.keys(PSA).forEach(key => {
      try {
        sets[key](PSA[key]);
      } catch(ee) {

      }
    });
    // window.location = `?PSA=true&demo=${e.target.value}`;
  } // changePSA

  return (
    <div
      tabIndex="0"

      onChange={update}
      
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          sets.help('');
        }
      }}

      onClick={(e) => {
        if (/^help/.test(e.target.innerHTML)) {
          sets.help(e.target.innerHTML.slice(4));
          sets.helpX(Math.min(e.pageX + 20, window.innerWidth - 400));
          sets.helpY(e.pageY - 20);
        } else {
          sets.help('');
        }
      }}

      id="Main"
    >
      <nav onClick={changeScreen}>
        <img src="logo.png" alt="" />
        <button className={/Home|About/.test(screen)  ? 'selected' : ''} data-scr="Home"       >Home</button>
        <button className={/Location/.test(screen)    ? 'selected' : ''} data-scr="Location"   >Location</button>
        <button className={/Soil/.test(screen)        ? 'selected' : ''} data-scr="Soil"       >Soil</button>
        <button className={/CoverCrop/.test(screen)   ? 'selected' : ''} data-scr="CoverCrop1" >Cover Crop</button>
        <button className={/CashCrop/.test(screen)    ? 'selected' : ''} data-scr="CashCrop"   >Cash Crop</button>
        <button className={/Output/.test(screen)      ? 'selected' : ''} data-scr="Output"     >Output</button>
        {
          PSA ? 
            <select id="Fields"
              onChange={changePSA}
              value={parms.field}
            >
              <optgroup label="PSA">
                {
                  Object.keys(PSA).sort().map(site => <option key={site}>{site}</option>)
                }
              </optgroup>
              <optgroup label="Resham">
                {
                  Object.keys(Resham).sort().map(site => <option key={site}>{site}</option>)
                }
              </optgroup>
            </select>
          :
          Object.keys(localStorage).length ?
            <select id="Fields"
              onChange={changeField}
            >
              <option></option>
              {
                Object.keys(localStorage).sort().map((field, idx) => (
                  <option key={idx} checked={field === parms.field}>{field}</option>
                ))
              }
            </select>
            : ''
        }
      </nav>
      
      <Help parms={parms} />
      
      {screens[screen]({
        ps: ps,
        sets: sets,
        parms: parms,
        setScreen: setScreen
      })}
    </div>
  )
} // Screens

const App = () => {
  const classes = useStyles();

  // can't do useState in a loop unless it's in a component, even if that component is unused
  const State = (parm, value) => {
    [parms[parm], sets[parm]] = React.useState(value);
  }
  
  for (const [parm, value] of Object.entries(parms)) {
    State(parm, value);
  }
console.log('App')
  return (
    <div className={classes.root}>
      <Screens parms={parms} />
    </div>
  );
} // App

const params = new URLSearchParams(window.location.search);
let demo = params.get('site');
const isPSA = params.get('PSA');

if (isPSA && !demo) {
  demo = 'AMD';
}

let weatherTimer;
let ssurgoTimer;

let parms = {
  field               : demo ? 'My field' : '',
  targetN             : demo ? '150' : '',
  coverCrop           : demo ? ['Oats, Black'] : [],
  killDate            : demo ? new Date('05/08/2021') : '',
  cashCrop            : demo ? 'Corn' : '',
  plantingDate        : demo ? new Date('05/20/2021') : '',
  lat                 : demo ? 32.5714 : 40.7849,
  lng                 : demo ? -82.0760 : -74.8073,
  N                   : demo ? 1.52 : '',
  InorganicN          : demo ? 10   : 10,
  carb                : demo ? 44.34 : '',
  cell                : demo ? 50.77 : '',
  lign                : demo ? 4.88 : '',
  lwc                 : 4,
  highOM              : 'No',
  nutrient            : 'Left on the surface',
  biomass             : demo ? 5235 : '',
  mapZoom             : 13,
  mapType             : 'hybrid',
  weather             : {},
  OM                  : demo ? 5   : '',
  BD                  : demo ? 1.5 : '',
  yield               : demo ? 150 : 150,
  residue             : 'surface',
  NContent            : demo ? 1000 : '',
  residueC            : demo ? 100 : '',
  outputN             : 1,
  gotSSURGO           : false,
  help                : '',
  helpX               : 0,
  helpY               : 0,
  unit                : 'lb/ac',
  location            : demo ? '' : '',
  nweeks              : 4,
  firstSSURGO         : true
}

let PSA = {
  AMD: {
    field             : 'AMD',
    lat               : 32.865389,
    lng               : -82.258361,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['Oats'],
    cashCrop          : 'Cotton',
    killDate          : new Date('04/27/2020'),
    plantingDate      : new Date(moment('10/23/2020').add(-111, 'days')),
    lwc               : 4.15,
    biomass           : 1357,
    unit              : 'kg/ha',
    N                 : 1.62,
    carb              : 48.01,
    cell              : 47.6,
    lign              : 4.39,
  },
  APA: {
    field             : 'APA',
    lat               : 33.628299,
    lng               : -83.482468,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['rye grass-crimson clover'],
    cashCrop          : 'corn',
    killDate          : new Date('03/19/2020'),
    plantingDate      : new Date(moment('08/17/2020').add(-111, 'days')),
    lwc               : 8.66,
    biomass           : 1813,
    unit              : 'kg/ha',
    N                 : 3.68,
    carb              : 54.59,
    cell              : 39.15,
    lign              : 6.26,
  },
  FDZ: {
    field             : 'FDZ',
    lat               : 32.273694,
    lng               : -81.867222,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['cereal rye-cosaque Oats'],
    cashCrop          : 'Cotton',
    killDate          : new Date('04/01/2020'),
    plantingDate      : new Date(moment('10/21/2020').add(-111, 'days')),
    lwc               : 3.38,
    biomass           : 3952,
    unit              : 'kg/ha',
    N                 : 1.11496888,
    carb              : 42.13,
    cell              : 51.97,
    lign              : 5.9,
  },
  HYO: {
    field             : 'HYO',
    lat               : 32.273775,
    lng               : -81.86781,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['cereal rye-cosaque Oats'],
    cashCrop          : 'Cotton',
    killDate          : new Date('03/25/2020'),
    plantingDate      : new Date(moment('08/26/2020').add(-111, 'days')),
    lwc               : 4.85,
    biomass           : 2667,
    unit              : 'kg/ha',
    N                 : 1.589082336,
    carb              : 44.82,
    cell              : 50.59,
    lign              : 4.59,
  },
  JQU: {
    field             : 'JQU',
    lat               : 33.093111,
    lng               : -82.148528,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['cereal rye'],
    cashCrop          : 'corn',
    killDate          : new Date('04/21/2020'),
    plantingDate      : new Date(moment('11/16/2020').add(-111, 'days')),
    lwc               : 3.13,
    biomass           : 1724,
    unit              : 'kg/ha',
    N                 : 1.706871648,
    carb              : 31.88,
    cell              : 60.53,
    lign              : 7.59,
  },
  MJZ: {
    field             : 'MJZ',
    lat               : 33.72636,
    lng               : -83.306224,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['cereal rye'],
    cashCrop          : 'corn',
    killDate          : new Date('03/30/2020'),
    plantingDate      : new Date(moment('09/08/2020').add(-111, 'days')),
    lwc               : 4.15,
    biomass           : 2710,
    unit              : 'kg/ha',
    N                 : 1.85,
    carb              : 31.33,
    cell              : 61.56,
    lign              : 7.11,
  },
  PLD: {
    field             : 'PLD',
    lat               : 32.59526,
    lng               : -81.68919,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['7 way mix '],
    cashCrop          : 'Cotton',
    killDate          : new Date('05/01/2020'),
    plantingDate      : new Date(moment('09/20/2020').add(-111, 'days')),
    lwc               : 3.06,
    biomass           : 2271,
    unit              : 'kg/ha',
    N                 : 2.113388672,
    carb              : 39.69,
    cell              : 53.14,
    lign              : 7.17,
  },
  YBW: {
    field             : 'YBW',
    lat               : 33.57597,
    lng               : -83.52497,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['rye grass-crimson clover'],
    cashCrop          : 'corn',
    killDate          : new Date('03/19/2020'),
    plantingDate      : new Date(moment('08/17/2020').add(-111, 'days')),
    lwc               : 9.84,
    biomass           : 3131,
    unit              : 'kg/ha',
    N                 : 3,
    carb              : 51.76,
    cell              : 42.4,
    lign              : 5.83,
  },
  YLF: {
    field             : 'YLF',
    lat               : 32.5904,
    lng               : -81.69262,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['7 way mix '],
    cashCrop          : 'Cotton',
    killDate          : new Date('05/01/2020'),
    plantingDate      : new Date(moment('10/21/2020').add(-111, 'days')),
    lwc               : 1.89,
    biomass           : 1294,
    unit              : 'kg/ha',
    N                 : 1.16,
    carb              : 33.02,
    cell              : 58.73,
    lign              : 8.25,
  },
  YVX: {
    field             : 'YVX',
    lat               : 32.99384,
    lng               : -81.80843,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['cereal rye'],
    cashCrop          : 'Cotton',
    killDate          : new Date('03/27/2020'),
    plantingDate      : new Date(moment('07/20/2020').add(-111, 'days')),
    lwc               : 7.36,
    biomass           : 540,
    unit              : 'kg/ha',
    N                 : 1.94,
    carb              : 38.96,
    cell              : 56.16,
    lign              : 4.88,
  },
  "JPC-April-Rye": {
    field             : 'JPC-April-Rye',
    lat               : 33.868826,
    lng               : -83.450653,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['rye'],
    cashCrop          : '',
    killDate          : new Date('04/01/2020'),
    plantingDate      : new Date(moment('05/11/2020').add(-111, 'days')),
    lwc               : 3.597,
    biomass           : 2562,
    unit              : 'kg/ha',
    N                 : 1.44333333333333,
    carb              : 30.2,
    cell              : 61.7,
    lign              : 8.11,
  },
  "JPC-April-Clover": {
    field             : 'JPC-April-Clover',
    lat               : 33.868826,
    lng               : -83.450653,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['clover'],
    cashCrop          : '',
    killDate          : new Date('04/01/2020'),
    plantingDate      : new Date(moment('05/11/2020').add(-111, 'days')),
    lwc               : 7.411,
    biomass           : 4444,
    unit              : 'kg/ha',
    N                 : 3.16666666666667,
    carb              : 60.74,
    cell              : 35.47,
    lign              : 3.79,
  },
  "JPC-May-Rye": {
    field             : 'JPC-May-Rye',
    lat               : 33.868826,
    lng               : -83.450653,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['rye'],
    cashCrop          : '',
    killDate          : new Date('05/01/2020'),
    plantingDate      : new Date(moment('06/10/2020').add(-111, 'days')),
    lwc               : 1.834,
    biomass           : 3426,
    unit              : 'kg/ha',
    N                 : 1.37666666666667,
    carb              : 31.49,
    cell              : 60.37,
    lign              : 8.14,
  },
  "JPC-May-Clover": {
    field             : 'JPC-May-Clover',
    lat               : 33.868826,
    lng               : -83.450653,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['clover'],
    cashCrop          : '',
    killDate          : new Date('05/01/2020'),
    plantingDate      : new Date(moment('06/10/2020').add(-111, 'days')),
    lwc               : 4.273,
    biomass           : 4465,
    unit              : 'kg/ha',
    N                 : 2.40666666666667,
    carb              : 47.81,
    cell              : 45.52,
    lign              : 6.67,
  },
  "JPC-AR-2021": {
    field             : 'JPC-AR-2021',
    lat               : 33.868826,
    lng               : -83.450653,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['Rye'],
    cashCrop          : '',
    killDate          : new Date('04/01/2021'),
    plantingDate      : new Date(moment('05/11/2021').add(-111, 'days')),
    lwc               : 5.34022150105072,
    biomass           : 4287,
    unit              : 'kg/ha',
    N                 : 2.21333333333333,
    carb              : 39.7,
    cell              : 56.85,
    lign              : 3.45,
  },
  "JPC-AC-2021": {
    field             : 'JPC-AC-2021',
    lat               : 33.868826,
    lng               : -83.450653,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['Clover'],
    cashCrop          : '',
    killDate          : new Date('04/01/2021'),
    plantingDate      : new Date(moment('05/11/2021').add(-111, 'days')),
    lwc               : 8.64573301605076,
    biomass           : 4282,
    unit              : 'kg/ha',
    N                 : 3.42666666666667,
    carb              : 56.44,
    cell              : 38,
    lign              : 5.56,
  },
  "JPC-MR-2021": {
    field             : 'JPC-MR-2021',
    lat               : 33.868826,
    lng               : -83.450653,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['Rye'],
    cashCrop          : '',
    killDate          : new Date('04/30/2021'),
    plantingDate      : new Date(moment('06/09/2021').add(-111, 'days')),
    lwc               : 1.61578599363586,
    biomass           : 6808,
    unit              : 'kg/ha',
    N                 : 1.94666666666667,
    carb              : 39.43,
    cell              : 53.98,
    lign              : 6.59,
  },
  "JPC-MC-2021": {
    field             : 'JPC-MC-2021',
    lat               : 33.868826,
    lng               : -83.450653,
    location          : '',
    BD                : 1.7,
    coverCrop         : ['Clover'],
    cashCrop          : '',
    killDate          : new Date('04/30/2021'),
    plantingDate      : new Date(moment('06/09/2021').add(-111, 'days')),
    lwc               : 2.77090763135152,
    biomass           : 5559,
    unit              : 'kg/ha',
    N                 : 2.10666666666667,
    carb              : 48.6,
    cell              : 43.77,
    lign              : 7.63,
  },
}

const Resham = {
  "HFS": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "1",
      "year": "2017",
      "affiliation": "GA",
      "field": "HFS",
      "lat": "32.5714",
      "lng": "-82.076",
      "killDate": 1488258000000,
      "plantingDate": 1493265600000,
      "end_date": "8/16/2017",
      "days": "169",
      "biomass": "5198.32",
      "N": "1.52",
      "InitialFOMN_kg/ha": "79.01",
      "lwc": "4.13",
      "carb": "46.34",
      "cell": "50.77",
      "lign": "2.88",
      "Model_test": "Calibration"
  },
  "BGR": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "2",
      "year": "2017",
      "affiliation": "MD",
      "field": "BGR",
      "lat": "39.6262",
      "lng": "-76.5575",
      "killDate": 1493265600000,
      "plantingDate": 1498795200000,
      "end_date": "10/19/2017",
      "days": "175",
      "biomass": "6250.93",
      "N": "1.32",
      "InitialFOMN_kg/ha": "82.92",
      "lwc": "4.07",
      "carb": "33.98",
      "cell": "62.73",
      "lign": "3.3",
      "Model_test": "Calibration"
  },
  "CJL": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "3",
      "year": "2017",
      "affiliation": "MD",
      "field": "CJL",
      "lat": "38.9684",
      "lng": "-75.847",
      "killDate": 1491796800000,
      "plantingDate": 1496289600000,
      "end_date": "9/20/2017",
      "days": "163",
      "biomass": "2189",
      "N": "1.35",
      "InitialFOMN_kg/ha": "29.62",
      "lwc": "2.69",
      "carb": "59.38",
      "cell": "39.31",
      "lign": "1.31",
      "Model_test": "Calibration"
  },
  "CRD": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "4",
      "year": "2017",
      "affiliation": "MD",
      "field": "CRD",
      "lat": "38.8772",
      "lng": "-75.8006",
      "killDate": 1491192000000,
      "plantingDate": 1495512000000,
      "end_date": "9/11/2017",
      "days": "161",
      "biomass": "2579.36",
      "N": "3.09",
      "InitialFOMN_kg/ha": "80.2",
      "lwc": "4.89",
      "carb": "59.61",
      "cell": "37.81",
      "lign": "2.58",
      "Model_test": "Calibration"
  },
  "CSK": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "5",
      "year": "2017",
      "affiliation": "MD",
      "field": "CSK",
      "lat": "38.7211",
      "lng": "-75.8076",
      "killDate": 1490068800000,
      "plantingDate": 1495512000000,
      "end_date": "9/11/2017",
      "days": "174",
      "biomass": "2692.25",
      "N": "2.62",
      "InitialFOMN_kg/ha": "70.53",
      "lwc": "3.39",
      "carb": "60.78",
      "cell": "34.71",
      "lign": "4.5",
      "Model_test": "Validation"
  },
  "QHS": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "6",
      "year": "2017",
      "affiliation": "MD",
      "field": "QHS",
      "lat": "39.1963",
      "lng": "-75.8491",
      "killDate": 1493697600000,
      "plantingDate": 1496289600000,
      "end_date": "9/20/2017",
      "days": "141",
      "biomass": "4609.78",
      "N": "1.26",
      "InitialFOMN_kg/ha": "57.99",
      "lwc": "3.33",
      "carb": "42.11",
      "cell": "55.87",
      "lign": "2.02",
      "Model_test": "Validation"
  },
  "SGK": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "7",
      "year": "2017",
      "affiliation": "MD",
      "field": "SGK",
      "lat": "38.1907",
      "lng": "-75.6844",
      "killDate": 1491364800000,
      "plantingDate": 1492833600000,
      "end_date": "8/11/2017",
      "days": "128",
      "biomass": "1653.47",
      "N": "2.23",
      "InitialFOMN_kg/ha": "37.03",
      "lwc": "4.04",
      "carb": "52.26",
      "cell": "45.81",
      "lign": "1.93",
      "Model_test": "Calibration"
  },
  "TCA": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "8",
      "year": "2017",
      "affiliation": "MD",
      "field": "TCA",
      "lat": "38.8663",
      "lng": "-76.1548",
      "killDate": 1491796800000,
      "plantingDate": 1495771200000,
      "end_date": "9/14/2017",
      "days": "157",
      "biomass": "941.73",
      "N": "2.64",
      "InitialFOMN_kg/ha": "24.81",
      "lwc": "4.13",
      "carb": "56.77",
      "cell": "42.09",
      "lign": "1.14",
      "Model_test": "Validation"
  },
  "TCB": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "9",
      "year": "2017",
      "affiliation": "MD",
      "field": "TCB",
      "lat": "38.8438",
      "lng": "-76.1777",
      "killDate": 1491796800000,
      "plantingDate": 1495771200000,
      "end_date": "9/14/2017",
      "days": "157",
      "biomass": "503.37",
      "N": "2.9",
      "InitialFOMN_kg/ha": "14.54",
      "lwc": "4.16",
      "carb": "60.7",
      "cell": "37.44",
      "lign": "1.87",
      "Model_test": "Calibration"
  },
  "TCC": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "10",
      "year": "2017",
      "affiliation": "MD",
      "field": "TCC",
      "lat": "38.8438",
      "lng": "-76.1777",
      "killDate": 1491796800000,
      "plantingDate": 1495771200000,
      "end_date": "9/14/2017",
      "days": "157",
      "biomass": "394.84",
      "N": "3.06",
      "InitialFOMN_kg/ha": "12.12",
      "lwc": "4.26",
      "carb": "61.78",
      "cell": "36.35",
      "lign": "1.87",
      "Model_test": "Calibration"
  },
  "TKA": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "11",
      "year": "2017",
      "affiliation": "MD",
      "field": "TKA",
      "lat": "39.024",
      "lng": "-76.0838",
      "killDate": 1489982400000,
      "plantingDate": 1496289600000,
      "end_date": "9/20/2017",
      "days": "184",
      "biomass": "499.61",
      "N": "3.39",
      "InitialFOMN_kg/ha": "16.95",
      "lwc": "3.09",
      "carb": "64.19",
      "cell": "33.45",
      "lign": "2.36",
      "Model_test": "Validation"
  },
  "TKC": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "12",
      "year": "2017",
      "affiliation": "MD",
      "field": "TKC",
      "lat": "38.7919",
      "lng": "-76.0944",
      "killDate": 1489982400000,
      "plantingDate": 1495166400000,
      "end_date": "9/7/2017",
      "days": "171",
      "biomass": "1939.16",
      "N": "1.41",
      "InitialFOMN_kg/ha": "27.05",
      "lwc": "2.32",
      "carb": "63.22",
      "cell": "34.26",
      "lign": "2.52",
      "Model_test": "Calibration"
  },
  "TKD": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "13",
      "year": "2017",
      "affiliation": "MD",
      "field": "TKD",
      "lat": "38.6777",
      "lng": "-76.0242",
      "killDate": 1489982400000,
      "plantingDate": 1495166400000,
      "end_date": "9/7/2017",
      "days": "171",
      "biomass": "1244.66",
      "N": "1.75",
      "InitialFOMN_kg/ha": "21.72",
      "lwc": "2.77",
      "carb": "63.55",
      "cell": "34.82",
      "lign": "1.63",
      "Model_test": "Calibration"
  },
  "BJD": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "14",
      "year": "2017",
      "affiliation": "NC",
      "field": "BJD",
      "lat": "35.806",
      "lng": "-81.1483",
      "killDate": 1494475200000,
      "plantingDate": 1493611200000,
      "end_date": "8/20/2017",
      "days": "101",
      "biomass": "5391.59",
      "N": "1.53",
      "InitialFOMN_kg/ha": "82.42",
      "lwc": "0.6",
      "carb": "27.29",
      "cell": "66.87",
      "lign": "5.85",
      "Model_test": "Calibration"
  },
  "CRH": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "15",
      "year": "2017",
      "affiliation": "NC",
      "field": "CRH",
      "lat": "35.8062",
      "lng": "-81.1488",
      "killDate": 1494561600000,
      "plantingDate": 1493611200000,
      "end_date": "8/20/2017",
      "days": "100",
      "biomass": "6378.95",
      "N": "1.25",
      "InitialFOMN_kg/ha": "77.44",
      "lwc": "2.22",
      "carb": "32.89",
      "cell": "61.35",
      "lign": "5.76",
      "Model_test": "Calibration"
  },
  "DCA": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "16",
      "year": "2017",
      "affiliation": "NC",
      "field": "DCA",
      "lat": "34.464",
      "lng": "-79.4111",
      "killDate": 1491364800000,
      "plantingDate": 1492747200000,
      "end_date": "8/10/2017",
      "days": "127",
      "biomass": "3070.58",
      "N": "1.54",
      "InitialFOMN_kg/ha": "47.53",
      "lwc": "2.69",
      "carb": "46.86",
      "cell": "51.06",
      "lign": "2.08",
      "Model_test": "Validation"
  },
  "DCB": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "17",
      "year": "2017",
      "affiliation": "NC",
      "field": "DCB",
      "lat": "34.4611",
      "lng": "-79.4078",
      "killDate": 1491364800000,
      "plantingDate": 1492747200000,
      "end_date": "8/10/2017",
      "days": "127",
      "biomass": "4282.07",
      "N": "1.63",
      "InitialFOMN_kg/ha": "69.8",
      "lwc": "3.12",
      "carb": "48.62",
      "cell": "48.87",
      "lign": "2.52",
      "Model_test": "Calibration"
  },
  "DMK": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "18",
      "year": "2017",
      "affiliation": "NC",
      "field": "DMK",
      "lat": "34.7883",
      "lng": "-78.0402",
      "killDate": 1490846400000,
      "plantingDate": 1493265600000,
      "end_date": "8/16/2017",
      "days": "139",
      "biomass": "4189.74",
      "N": "1.64",
      "InitialFOMN_kg/ha": "68.62",
      "lwc": "3.21",
      "carb": "48.37",
      "cell": "50.05",
      "lign": "1.58",
      "Model_test": "Validation"
  },
  "DMP": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "19",
      "year": "2017",
      "affiliation": "NC",
      "field": "DMP",
      "lat": "34.744",
      "lng": "-78.0207",
      "killDate": 1488862800000,
      "plantingDate": 1493265600000,
      "end_date": "8/16/2017",
      "days": "162",
      "biomass": "1110.89",
      "N": "1.85",
      "InitialFOMN_kg/ha": "20.53",
      "lwc": "1.59",
      "carb": "56.52",
      "cell": "40.99",
      "lign": "2.49",
      "Model_test": "Validation"
  },
  "HHA": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "20",
      "year": "2017",
      "affiliation": "NC",
      "field": "HHA",
      "lat": "34.953",
      "lng": "-79.2785",
      "killDate": 1489636800000,
      "plantingDate": 1491883200000,
      "end_date": "7/31/2017",
      "days": "137",
      "biomass": "1605.73",
      "N": "1.31",
      "InitialFOMN_kg/ha": "21",
      "lwc": "2.43",
      "carb": "45.41",
      "cell": "52.98",
      "lign": "1.6",
      "Model_test": "Calibration"
  },
  "HHB": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "21",
      "year": "2017",
      "affiliation": "NC",
      "field": "HHB",
      "lat": "34.9337",
      "lng": "-79.2779",
      "killDate": 1489636800000,
      "plantingDate": 1491883200000,
      "end_date": "7/31/2017",
      "days": "137",
      "biomass": "2105.4",
      "N": "1.59",
      "InitialFOMN_kg/ha": "34.76",
      "lwc": "2.27",
      "carb": "45.34",
      "cell": "52.81",
      "lign": "1.85",
      "Model_test": "Calibration"
  },
  "LBR": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "22",
      "year": "2017",
      "affiliation": "NC",
      "field": "LBR",
      "lat": "35.5877",
      "lng": "-79.0767",
      "killDate": 1494475200000,
      "plantingDate": 1492574400000,
      "end_date": "8/8/2017",
      "days": "89",
      "biomass": "923.91",
      "N": "3.29",
      "InitialFOMN_kg/ha": "30.42",
      "lwc": "3.84",
      "carb": "54.73",
      "cell": "42.18",
      "lign": "3.09",
      "Model_test": "Validation"
  },
  "OMH": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "23",
      "year": "2017",
      "affiliation": "NC",
      "field": "OMH",
      "lat": "34.95",
      "lng": "-77.5594",
      "killDate": 1492660800000,
      "plantingDate": 1494648000000,
      "end_date": "9/1/2017",
      "days": "134",
      "biomass": "4771.57",
      "N": "1.49",
      "InitialFOMN_kg/ha": "70.24",
      "lwc": "2.88",
      "carb": "46.22",
      "cell": "50.01",
      "lign": "3.77",
      "Model_test": "Calibration"
  },
  "RAL": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "24",
      "year": "2017",
      "affiliation": "NC",
      "field": "RAL",
      "lat": "34.7855",
      "lng": "-79.2601",
      "killDate": 1489035600000,
      "plantingDate": 1493179200000,
      "end_date": "8/15/2017",
      "days": "159",
      "biomass": "5474.09",
      "N": "1.22",
      "InitialFOMN_kg/ha": "66.97",
      "lwc": "3.39",
      "carb": "41.29",
      "cell": "56.38",
      "lign": "2.33",
      "Model_test": "Validation"
  },
  "RHS": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "25",
      "year": "2017",
      "affiliation": "NC",
      "field": "RHS",
      "lat": "35.8053",
      "lng": "-81.1508",
      "killDate": 1494820800000,
      "plantingDate": 1497585600000,
      "end_date": "10/5/2017",
      "days": "143",
      "biomass": "6766.18",
      "N": "1.12",
      "InitialFOMN_kg/ha": "75.78",
      "lwc": "1.89",
      "carb": "36.24",
      "cell": "60.03",
      "lign": "3.73",
      "Model_test": "Validation"
  },
  "RPS": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "26",
      "year": "2017",
      "affiliation": "NC",
      "field": "RPS",
      "lat": "34.58",
      "lng": "-79.3168",
      "killDate": 1489035600000,
      "plantingDate": 1493179200000,
      "end_date": "8/15/2017",
      "days": "159",
      "biomass": "4702.16",
      "N": "1.23",
      "InitialFOMN_kg/ha": "56.93",
      "lwc": "1.88",
      "carb": "56.23",
      "cell": "41.55",
      "lign": "2.22",
      "Model_test": "Calibration"
  },
  "SCF": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "27",
      "year": "2017",
      "affiliation": "NC",
      "field": "SCF",
      "lat": "35.3402",
      "lng": "-80.3227",
      "killDate": 1492574400000,
      "plantingDate": 1495512000000,
      "end_date": "9/11/2017",
      "days": "145",
      "biomass": "4233.07",
      "N": "1.39",
      "InitialFOMN_kg/ha": "58.88",
      "lwc": "5.91",
      "carb": "30.14",
      "cell": "66.22",
      "lign": "3.63",
      "Model_test": "Calibration"
  },
  "SJC": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "28",
      "year": "2017",
      "affiliation": "NC",
      "field": "SJC",
      "lat": "34.9013",
      "lng": "-79.4038",
      "killDate": 1492488000000,
      "plantingDate": 1493265600000,
      "end_date": "8/16/2017",
      "days": "120",
      "biomass": "657.78",
      "N": "2.16",
      "InitialFOMN_kg/ha": "14.18",
      "lwc": "2.97",
      "carb": "39.52",
      "cell": "53.85",
      "lign": "6.63",
      "Model_test": "Calibration"
  },
  "ULA": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "29",
      "year": "2017",
      "affiliation": "NC",
      "field": "ULA",
      "lat": "34.8603",
      "lng": "-80.5128",
      "killDate": 1488862800000,
      "plantingDate": 1493438400000,
      "end_date": "8/18/2017",
      "days": "164",
      "biomass": "1909.99",
      "N": "1.53",
      "InitialFOMN_kg/ha": "29.3",
      "lwc": "4.01",
      "carb": "42.47",
      "cell": "54",
      "lign": "3.54",
      "Model_test": "Validation"
  },
  "ULB": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "30",
      "year": "2017",
      "affiliation": "NC",
      "field": "ULB",
      "lat": "34.8619",
      "lng": "-80.5115",
      "killDate": 1488862800000,
      "plantingDate": 1493438400000,
      "end_date": "8/18/2017",
      "days": "164",
      "biomass": "2826.57",
      "N": "1.64",
      "InitialFOMN_kg/ha": "46.43",
      "lwc": "4.37",
      "carb": "43.17",
      "cell": "52.94",
      "lign": "3.89",
      "Model_test": "Calibration"
  },
  "CLB": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "31",
      "year": "2017",
      "affiliation": "PA",
      "field": "CLB",
      "lat": "39.8275",
      "lng": "-77.661",
      "killDate": 1494820800000,
      "plantingDate": 1498795200000,
      "end_date": "10/19/2017",
      "days": "157",
      "biomass": "10595.26",
      "N": "1.5",
      "InitialFOMN_kg/ha": "159.2",
      "lwc": "3.39",
      "carb": "38.74",
      "cell": "58.48",
      "lign": "2.77",
      "Model_test": "Calibration"
  },
  "SRZ": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "32",
      "year": "2017",
      "affiliation": "PA",
      "field": "SRZ",
      "lat": "40.5145",
      "lng": "-75.9792",
      "killDate": 1494302400000,
      "plantingDate": 1498104000000,
      "end_date": "10/11/2017",
      "days": "155",
      "biomass": "4008.7",
      "N": "2.06",
      "InitialFOMN_kg/ha": "83.14",
      "lwc": "3.69",
      "carb": "39.22",
      "cell": "57.39",
      "lign": "3.4",
      "Model_test": "Validation"
  },
  "SSA": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "33",
      "year": "2017",
      "affiliation": "PA",
      "field": "SSA",
      "lat": "40.6326",
      "lng": "-76.6553",
      "killDate": 1495512000000,
      "plantingDate": 1498104000000,
      "end_date": "10/11/2017",
      "days": "141",
      "biomass": "3196.47",
      "N": "2.1",
      "InitialFOMN_kg/ha": "65.56",
      "lwc": "4.83",
      "carb": "47.08",
      "cell": "50.89",
      "lign": "2.04",
      "Model_test": "Calibration"
  },
  "SSB": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "34",
      "year": "2017",
      "affiliation": "PA",
      "field": "SSB",
      "lat": "40.5869",
      "lng": "-76.7896",
      "killDate": 1495512000000,
      "plantingDate": 1498104000000,
      "end_date": "10/11/2017",
      "days": "141",
      "biomass": "2981.45",
      "N": "3.13",
      "InitialFOMN_kg/ha": "93.32",
      "lwc": "5.58",
      "carb": "53.48",
      "cell": "44.84",
      "lign": "1.68",
      "Model_test": "Validation"
  },
  "HFE": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "35",
      "year": "2018",
      "affiliation": "GA",
      "field": "HFE",
      "lat": "32.5714",
      "lng": "-82.076",
      "killDate": 1522641600000,
      "plantingDate": 1525147200000,
      "end_date": "8/20/2018",
      "days": "140",
      "biomass": "6411.51",
      "N": "1.89",
      "InitialFOMN_kg/ha": "121.37",
      "lwc": "4.74",
      "carb": "40.33",
      "cell": "54.5",
      "lign": "5.17",
      "Model_test": "Validation"
  },
  "IHE": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "36",
      "year": "2018",
      "affiliation": "GA",
      "field": "IHE",
      "lat": "33.7168",
      "lng": "-83.3001",
      "killDate": 1521777600000,
      "plantingDate": 1527220800000,
      "end_date": "9/13/2018",
      "days": "174",
      "biomass": "5141.74",
      "N": "2.44",
      "InitialFOMN_kg/ha": "126.08",
      "lwc": "4.85",
      "carb": "61.67",
      "cell": "34.23",
      "lign": "4.1",
      "Model_test": "Validation"
  },
  "LNE": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "37",
      "year": "2018",
      "affiliation": "GA",
      "field": "LNE",
      "lat": "33.5712",
      "lng": "-83.4941",
      "killDate": 1521000000000,
      "plantingDate": 1526616000000,
      "end_date": "9/6/2018",
      "days": "176",
      "biomass": "4754.63",
      "N": "3.42",
      "InitialFOMN_kg/ha": "164.45",
      "lwc": "6.78",
      "carb": "62.26",
      "cell": "33.05",
      "lign": "4.69",
      "Model_test": "Calibration"
  },
  "AWP": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "38",
      "year": "2018",
      "affiliation": "MD",
      "field": "AWP",
      "lat": "39.0248",
      "lng": "-76.8989",
      "killDate": 1527566400000,
      "plantingDate": 1527134400000,
      "end_date": "9/12/2018",
      "days": "106",
      "biomass": "3251.02",
      "N": "1.18",
      "InitialFOMN_kg/ha": "38.4",
      "lwc": "2.82",
      "carb": "32.48",
      "cell": "59.22",
      "lign": "8.29",
      "Model_test": "Validation"
  },
  "BGS": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "39",
      "year": "2018",
      "affiliation": "MD",
      "field": "BGS",
      "lat": "39.7372",
      "lng": "-76.3698",
      "killDate": 1523505600000,
      "plantingDate": 1528430400000,
      "end_date": "9/27/2018",
      "days": "168",
      "biomass": "3196.49",
      "N": "2.84",
      "InitialFOMN_kg/ha": "90.5",
      "lwc": "4.62",
      "carb": "54.23",
      "cell": "41.53",
      "lign": "4.24",
      "Model_test": "Calibration"
  },
  "CCP": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "40",
      "year": "2018",
      "affiliation": "MD",
      "field": "CCP",
      "lat": "39.0131",
      "lng": "-76.9408",
      "killDate": 1527566400000,
      "plantingDate": 1527134400000,
      "end_date": "9/12/2018",
      "days": "106",
      "biomass": "2561.41",
      "N": "1.87",
      "InitialFOMN_kg/ha": "46.68",
      "lwc": "3.39",
      "carb": "28.02",
      "cell": "65.64",
      "lign": "6.35",
      "Model_test": "Validation"
  },
  "CCS": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "41",
      "year": "2018",
      "affiliation": "MD",
      "field": "CCS",
      "lat": "39.0117",
      "lng": "-76.9391",
      "killDate": 1527566400000,
      "plantingDate": 1527134400000,
      "end_date": "9/12/2018",
      "days": "106",
      "biomass": "2127.94",
      "N": "3.16",
      "InitialFOMN_kg/ha": "67.3",
      "lwc": "5.26",
      "carb": "35.95",
      "cell": "55.78",
      "lign": "8.26",
      "Model_test": "Calibration"
  },
  "CJA": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "42",
      "year": "2018",
      "affiliation": "MD",
      "field": "CJA",
      "lat": "38.9702",
      "lng": "-75.8479",
      "killDate": 1524024000000,
      "plantingDate": 1527739200000,
      "end_date": "9/19/2018",
      "days": "154",
      "biomass": "3911.45",
      "N": "2.18",
      "InitialFOMN_kg/ha": "90.74",
      "lwc": "4.53",
      "carb": "37.27",
      "cell": "56.98",
      "lign": "5.75",
      "Model_test": "Calibration"
  },
  "CSA": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "43",
      "year": "2018",
      "affiliation": "MD",
      "field": "CSA",
      "lat": "38.7583",
      "lng": "-75.7719",
      "killDate": 1523419200000,
      "plantingDate": 1526616000000,
      "end_date": "9/6/2018",
      "days": "148",
      "biomass": "2314.45",
      "N": "2.71",
      "InitialFOMN_kg/ha": "62.88",
      "lwc": "2.98",
      "carb": "49.69",
      "cell": "45.42",
      "lign": "4.88",
      "Model_test": "Validation"
  },
  "KTA": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "44",
      "year": "2018",
      "affiliation": "MD",
      "field": "KTA",
      "lat": "39.1254",
      "lng": "-76.2404",
      "killDate": 1522987200000,
      "plantingDate": 1526616000000,
      "end_date": "9/6/2018",
      "days": "153",
      "biomass": "1190.99",
      "N": "2.51",
      "InitialFOMN_kg/ha": "29.93",
      "lwc": "3.81",
      "carb": "24.19",
      "cell": "67.8",
      "lign": "8.01",
      "Model_test": "Calibration"
  },
  "KTC": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "45",
      "year": "2018",
      "affiliation": "MD",
      "field": "KTC",
      "lat": "39.2735",
      "lng": "-76.0802",
      "killDate": 1522900800000,
      "plantingDate": 1527739200000,
      "end_date": "9/19/2018",
      "days": "167",
      "biomass": "419.16",
      "N": "4.39",
      "InitialFOMN_kg/ha": "18.28",
      "lwc": "4.74",
      "carb": "53.95",
      "cell": "41.16",
      "lign": "4.89",
      "Model_test": "Validation"
  },
  "KTD": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "46",
      "year": "2018",
      "affiliation": "MD",
      "field": "KTD",
      "lat": "39.4063",
      "lng": "-75.8533",
      "killDate": 1522900800000,
      "plantingDate": 1527739200000,
      "end_date": "9/19/2018",
      "days": "167",
      "biomass": "1162.32",
      "N": "2.64",
      "InitialFOMN_kg/ha": "30.7",
      "lwc": "4.03",
      "carb": "27.25",
      "cell": "65.47",
      "lign": "7.28",
      "Model_test": "Calibration"
  },
  "KTE": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "47",
      "year": "2018",
      "affiliation": "MD",
      "field": "KTE",
      "lat": "39.3381",
      "lng": "-75.8133",
      "killDate": 1522900800000,
      "plantingDate": 1527739200000,
      "end_date": "9/19/2018",
      "days": "167",
      "biomass": "770.9",
      "N": "2.86",
      "InitialFOMN_kg/ha": "22.03",
      "lwc": "3.51",
      "carb": "53.16",
      "cell": "42.23",
      "lign": "4.6",
      "Model_test": "Validation"
  },
  "NSF": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "48",
      "year": "2018",
      "affiliation": "MD",
      "field": "NSF",
      "lat": "39.016",
      "lng": "-76.9427",
      "killDate": 1524542400000,
      "plantingDate": 1527134400000,
      "end_date": "9/12/2018",
      "days": "141",
      "biomass": "5065.03",
      "N": "1.72",
      "InitialFOMN_kg/ha": "87.45",
      "lwc": "4.64",
      "carb": "33.86",
      "cell": "59.08",
      "lign": "7.07",
      "Model_test": "Calibration"
  },
  "NSL": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "49",
      "year": "2018",
      "affiliation": "MD",
      "field": "NSL",
      "lat": "39.0161",
      "lng": "-76.943",
      "killDate": 1526270400000,
      "plantingDate": 1527134400000,
      "end_date": "9/12/2018",
      "days": "121",
      "biomass": "4359.3",
      "N": "1.11",
      "InitialFOMN_kg/ha": "48.16",
      "lwc": "3.14",
      "carb": "38.66",
      "cell": "55.09",
      "lign": "6.25",
      "Model_test": "Validation"
  },
  "QAS": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "50",
      "year": "2018",
      "affiliation": "MD",
      "field": "QAS",
      "lat": "39.2196",
      "lng": "-75.8316",
      "killDate": 1523419200000,
      "plantingDate": 1526616000000,
      "end_date": "9/6/2018",
      "days": "148",
      "biomass": "204.84",
      "N": "2.96",
      "InitialFOMN_kg/ha": "6.03",
      "lwc": "3.06",
      "carb": "57.28",
      "cell": "38.22",
      "lign": "4.5",
      "Model_test": "Calibration"
  },
  "SSC": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "51",
      "year": "2018",
      "affiliation": "MD",
      "field": "SSC",
      "lat": "39.2553",
      "lng": "-76.1726",
      "killDate": 1526356800000,
      "plantingDate": 1526616000000,
      "end_date": "9/6/2018",
      "days": "114",
      "biomass": "4200.86",
      "N": "1.41",
      "InitialFOMN_kg/ha": "59.48",
      "lwc": "2.96",
      "carb": "24.19",
      "cell": "67.8",
      "lign": "8.01",
      "Model_test": "Calibration"
  },
  "SSD": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "52",
      "year": "2018",
      "affiliation": "MD",
      "field": "SSD",
      "lat": "39.4063",
      "lng": "-75.8533",
      "killDate": 1526356800000,
      "plantingDate": 1526616000000,
      "end_date": "9/6/2018",
      "days": "114",
      "biomass": "7056.39",
      "N": "2.33",
      "InitialFOMN_kg/ha": "164.24",
      "lwc": "3.65",
      "carb": "27.25",
      "cell": "65.47",
      "lign": "7.28",
      "Model_test": "Validation"
  },
  "TCD": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "53",
      "year": "2018",
      "affiliation": "MD",
      "field": "TCD",
      "lat": "38.7953",
      "lng": "-76.1795",
      "killDate": 1523937600000,
      "plantingDate": 1526270400000,
      "end_date": "9/2/2018",
      "days": "138",
      "biomass": "283.62",
      "N": "3.5",
      "InitialFOMN_kg/ha": "10.03",
      "lwc": "4.2",
      "carb": "56.09",
      "cell": "38.31",
      "lign": "5.6",
      "Model_test": "Calibration"
  },
  "TCE": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "54",
      "year": "2018",
      "affiliation": "MD",
      "field": "TCE",
      "lat": "38.7943",
      "lng": "-76.1817",
      "killDate": 1523937600000,
      "plantingDate": 1526270400000,
      "end_date": "9/2/2018",
      "days": "138",
      "biomass": "284",
      "N": "3.65",
      "InitialFOMN_kg/ha": "10.38",
      "lwc": "4.95",
      "carb": "56.84",
      "cell": "37.95",
      "lign": "5.21",
      "Model_test": "Validation"
  },
  "TCF": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "55",
      "year": "2018",
      "affiliation": "MD",
      "field": "TCF",
      "lat": "38.8223",
      "lng": "-76.1371",
      "killDate": 1523937600000,
      "plantingDate": 1526270400000,
      "end_date": "9/2/2018",
      "days": "138",
      "biomass": "802.24",
      "N": "2.28",
      "InitialFOMN_kg/ha": "18.3",
      "lwc": "3.82",
      "carb": "55.09",
      "cell": "39.4",
      "lign": "5.51",
      "Model_test": "Calibration"
  },
  "WYE": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "56",
      "year": "2018",
      "affiliation": "MD",
      "field": "WYE",
      "lat": "38.9145",
      "lng": "-76.1431",
      "killDate": 1523937600000,
      "plantingDate": 1528862400000,
      "end_date": "10/2/2018",
      "days": "168",
      "biomass": "601.3",
      "N": "3.36",
      "InitialFOMN_kg/ha": "20.28",
      "lwc": "5.2",
      "carb": "48.13",
      "cell": "46.57",
      "lign": "5.3",
      "Model_test": "Validation"
  },
  "ALR": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "57",
      "year": "2018",
      "affiliation": "NC",
      "field": "ALR",
      "lat": "34.8243",
      "lng": "-79.2795",
      "killDate": 1521432000000,
      "plantingDate": 1525492800000,
      "end_date": "8/24/2018",
      "days": "158",
      "biomass": "2268.38",
      "N": "1.71",
      "InitialFOMN_kg/ha": "39.11",
      "lwc": "1.18",
      "carb": "30.91",
      "cell": "62.98",
      "lign": "6.11",
      "Model_test": "Validation"
  },
  "BRL": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "58",
      "year": "2018",
      "affiliation": "NC",
      "field": "BRL",
      "lat": "35.5872",
      "lng": "-79.0761",
      "killDate": 1523419200000,
      "plantingDate": 1525406400000,
      "end_date": "8/23/2018",
      "days": "134",
      "biomass": "3816.59",
      "N": "3.02",
      "InitialFOMN_kg/ha": "115.61",
      "lwc": "5.25",
      "carb": "48.71",
      "cell": "45.72",
      "lign": "5.57",
      "Model_test": "Validation"
  },
  "BWA": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "59",
      "year": "2018",
      "affiliation": "NC",
      "field": "BWA",
      "lat": "35.7473",
      "lng": "-78.4778",
      "killDate": 1523419200000,
      "plantingDate": 1526011200000,
      "end_date": "8/30/2018",
      "days": "141",
      "biomass": "2149.74",
      "N": "1.59",
      "InitialFOMN_kg/ha": "33.63",
      "lwc": "3.63",
      "carb": "49.63",
      "cell": "46.74",
      "lign": "3.63",
      "Model_test": "Validation"
  },
  "CDA": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "60",
      "year": "2018",
      "affiliation": "NC",
      "field": "CDA",
      "lat": "34.4628",
      "lng": "-79.4116",
      "killDate": 1522728000000,
      "plantingDate": 1524024000000,
      "end_date": "8/7/2018",
      "days": "126",
      "biomass": "790.68",
      "N": "3.81",
      "InitialFOMN_kg/ha": "30.09",
      "lwc": "2.51",
      "carb": "50.34",
      "cell": "43.98",
      "lign": "5.68",
      "Model_test": "Calibration"
  },
  "CDB": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "61",
      "year": "2018",
      "affiliation": "NC",
      "field": "CDB",
      "lat": "34.4605",
      "lng": "-79.4131",
      "killDate": 1522728000000,
      "plantingDate": 1524024000000,
      "end_date": "8/7/2018",
      "days": "126",
      "biomass": "661.77",
      "N": "3.87",
      "InitialFOMN_kg/ha": "25.67",
      "lwc": "2.3",
      "carb": "48.38",
      "cell": "46.59",
      "lign": "5.03",
      "Model_test": "Validation"
  },
  "HLD": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "62",
      "year": "2018",
      "affiliation": "NC",
      "field": "HLD",
      "lat": "34.9912",
      "lng": "-77.8957",
      "killDate": 1522641600000,
      "plantingDate": 1524715200000,
      "end_date": "8/15/2018",
      "days": "135",
      "biomass": "4549.46",
      "N": "2.13",
      "InitialFOMN_kg/ha": "97.24",
      "lwc": "2.49",
      "carb": "46.02",
      "cell": "48.13",
      "lign": "5.85",
      "Model_test": "Calibration"
  },
  "HLQ": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "63",
      "year": "2018",
      "affiliation": "NC",
      "field": "HLQ",
      "lat": "34.9921",
      "lng": "-77.8952",
      "killDate": 1522641600000,
      "plantingDate": 1524801600000,
      "end_date": "8/16/2018",
      "days": "136",
      "biomass": "6927.42",
      "N": "1.99",
      "InitialFOMN_kg/ha": "131.43",
      "lwc": "1.95",
      "carb": "45.31",
      "cell": "48.4",
      "lign": "6.29",
      "Model_test": "Validation"
  },
  "JYB": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "64",
      "year": "2018",
      "affiliation": "NC",
      "field": "JYB",
      "lat": "35.1019",
      "lng": "-78.3528",
      "killDate": 1521691200000,
      "plantingDate": 1524715200000,
      "end_date": "8/15/2018",
      "days": "146",
      "biomass": "2319.34",
      "N": "4.4",
      "InitialFOMN_kg/ha": "101.75",
      "lwc": "5.8",
      "carb": "61.8",
      "cell": "33.95",
      "lign": "4.25",
      "Model_test": "Validation"
  },
  "JYS": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "65",
      "year": "2018",
      "affiliation": "NC",
      "field": "JYS",
      "lat": "35.101",
      "lng": "-78.3526",
      "killDate": 1521691200000,
      "plantingDate": 1524715200000,
      "end_date": "8/15/2018",
      "days": "146",
      "biomass": "2373.48",
      "N": "3.84",
      "InitialFOMN_kg/ha": "91.59",
      "lwc": "5.51",
      "carb": "64.97",
      "cell": "31.14",
      "lign": "3.89",
      "Model_test": "Calibration"
  },
  "KCF": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "66",
      "year": "2018",
      "affiliation": "NC",
      "field": "KCF",
      "lat": "35.266",
      "lng": "-77.6482",
      "killDate": 1521172800000,
      "plantingDate": 1524542400000,
      "end_date": "8/13/2018",
      "days": "150",
      "biomass": "2995.96",
      "N": "1.79",
      "InitialFOMN_kg/ha": "53.9",
      "lwc": "3.93",
      "carb": "30.92",
      "cell": "63.45",
      "lign": "5.63",
      "Model_test": "Validation"
  },
  "KCW": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "67",
      "year": "2018",
      "affiliation": "NC",
      "field": "KCW",
      "lat": "35.2691",
      "lng": "-77.6477",
      "killDate": 1521172800000,
      "plantingDate": 1524542400000,
      "end_date": "8/13/2018",
      "days": "150",
      "biomass": "1086.74",
      "N": "1.69",
      "InitialFOMN_kg/ha": "18.17",
      "lwc": "4.03",
      "carb": "35.61",
      "cell": "58.02",
      "lign": "6.37",
      "Model_test": "Calibration"
  },
  "KMR": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "68",
      "year": "2018",
      "affiliation": "NC",
      "field": "KMR",
      "lat": "34.5187",
      "lng": "-79.2614",
      "killDate": 1522728000000,
      "plantingDate": 1524628800000,
      "end_date": "8/14/2018",
      "days": "133",
      "biomass": "2709.01",
      "N": "2.13",
      "InitialFOMN_kg/ha": "57.55",
      "lwc": "4.05",
      "carb": "47.95",
      "cell": "48.79",
      "lign": "3.26",
      "Model_test": "Calibration"
  },
  "MKD": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "69",
      "year": "2018",
      "affiliation": "NC",
      "field": "MKD",
      "lat": "34.7496",
      "lng": "-78.1522",
      "killDate": 1521691200000,
      "plantingDate": 1525233600000,
      "end_date": "8/21/2018",
      "days": "152",
      "biomass": "4062.15",
      "N": "2.16",
      "InitialFOMN_kg/ha": "87.13",
      "lwc": "3.95",
      "carb": "51.89",
      "cell": "44.7",
      "lign": "3.4",
      "Model_test": "Validation"
  },
  "SRA": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "70",
      "year": "2018",
      "affiliation": "NC",
      "field": "SRA",
      "lat": "34.5313",
      "lng": "-79.2499",
      "killDate": 1521432000000,
      "plantingDate": 1524628800000,
      "end_date": "8/14/2018",
      "days": "148",
      "biomass": "1249.12",
      "N": "1.28",
      "InitialFOMN_kg/ha": "15.95",
      "lwc": "0.35",
      "carb": "27.79",
      "cell": "66.06",
      "lign": "6.14",
      "Model_test": "Validation"
  },
  "SRB": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "71",
      "year": "2018",
      "affiliation": "NC",
      "field": "SRB",
      "lat": "34.5312",
      "lng": "-79.2479",
      "killDate": 1521432000000,
      "plantingDate": 1524628800000,
      "end_date": "8/14/2018",
      "days": "148",
      "biomass": "1893.15",
      "N": "1.92",
      "InitialFOMN_kg/ha": "36.62",
      "lwc": "0.38",
      "carb": "34.15",
      "cell": "58.45",
      "lign": "7.39",
      "Model_test": "Validation"
  },
  "CLA": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "72",
      "year": "2018",
      "affiliation": "PA",
      "field": "CLA",
      "lat": "39.8727",
      "lng": "-77.674",
      "killDate": 1525320000000,
      "plantingDate": 1528430400000,
      "end_date": "9/27/2018",
      "days": "147",
      "biomass": "2267.4",
      "N": "3.39",
      "InitialFOMN_kg/ha": "76.99",
      "lwc": "4.58",
      "carb": "41.36",
      "cell": "53.95",
      "lign": "4.68",
      "Model_test": "Calibration"
  },
  "NAS": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "73",
      "year": "2018",
      "affiliation": "PA",
      "field": "NAS",
      "lat": "40.6595",
      "lng": "-76.8018",
      "killDate": 1525320000000,
      "plantingDate": 1528430400000,
      "end_date": "9/27/2018",
      "days": "147",
      "biomass": "170.84",
      "N": "6.42",
      "InitialFOMN_kg/ha": "10.97",
      "lwc": "6.03",
      "carb": "54.15",
      "cell": "40.63",
      "lign": "5.22",
      "Model_test": "Validation"
  },
  "SRY": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "74",
      "year": "2018",
      "affiliation": "PA",
      "field": "SRY",
      "lat": "40.5153",
      "lng": "-75.9882",
      "killDate": 1525406400000,
      "plantingDate": 1528430400000,
      "end_date": "9/27/2018",
      "days": "146",
      "biomass": "888.31",
      "N": "2.24",
      "InitialFOMN_kg/ha": "20.06",
      "lwc": "7.28",
      "carb": "46.16",
      "cell": "47.93",
      "lign": "5.91",
      "Model_test": "Calibration"
  },
  "DRU": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "75",
      "year": "2019",
      "affiliation": "DE",
      "field": "DRU",
      "lat": "38.5898",
      "lng": "-75.468",
      "killDate": 1554868800000,
      "plantingDate": 1558411200000,
      "end_date": "9/9/2019",
      "days": "152",
      "biomass": "2221.1",
      "N": "1.42",
      "InitialFOMN_kg/ha": "31.81",
      "lwc": "2.96",
      "carb": "49.49",
      "cell": "45.9",
      "lign": "4.61",
      "Model_test": "Calibration"
  },
  "MJU": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "76",
      "year": "2019",
      "affiliation": "DE",
      "field": "MJU",
      "lat": "38.6324",
      "lng": "-75.4548",
      "killDate": 1557460800000,
      "plantingDate": 1558411200000,
      "end_date": "9/9/2019",
      "days": "122",
      "biomass": "2109.36",
      "N": "1.49",
      "InitialFOMN_kg/ha": "31.5",
      "lwc": "4.55",
      "carb": "30.45",
      "cell": "62.44",
      "lign": "7.11",
      "Model_test": "Validation"
  },
  "SGT": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "77",
      "year": "2019",
      "affiliation": "DE",
      "field": "SGT",
      "lat": "38.5213",
      "lng": "-75.4439",
      "killDate": 1556769600000,
      "plantingDate": 1558411200000,
      "end_date": "9/9/2019",
      "days": "130",
      "biomass": "5844.88",
      "N": "2.77",
      "InitialFOMN_kg/ha": "162.34",
      "lwc": "4.41",
      "carb": "37",
      "cell": "54.81",
      "lign": "8.2",
      "Model_test": "Validation"
  },
  "ETO": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "78",
      "year": "2019",
      "affiliation": "MD",
      "field": "ETO",
      "lat": "39.013",
      "lng": "-76.9413",
      "killDate": 1557979200000,
      "plantingDate": 1559620800000,
      "end_date": "9/23/2019",
      "days": "130",
      "biomass": "3268.46",
      "N": "3.58",
      "InitialFOMN_kg/ha": "117.57",
      "lwc": "4.08",
      "carb": "51.95",
      "cell": "41.6",
      "lign": "6.45",
      "Model_test": "Validation"
  },
  "FFB": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "79",
      "year": "2019",
      "affiliation": "MD",
      "field": "FFB",
      "lat": "39.013",
      "lng": "-76.9413",
      "killDate": 1557979200000,
      "plantingDate": 1559620800000,
      "end_date": "9/23/2019",
      "days": "130",
      "biomass": "8697.92",
      "N": "2.77",
      "InitialFOMN_kg/ha": "240.21",
      "lwc": "3.92",
      "carb": "47.26",
      "cell": "45.63",
      "lign": "7.12",
      "Model_test": "Validation"
  },
  "NDK": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "80",
      "year": "2019",
      "affiliation": "MD",
      "field": "NDK",
      "lat": "39.025",
      "lng": "-76.9018",
      "killDate": 1558670400000,
      "plantingDate": 1559016000000,
      "end_date": "9/16/2019",
      "days": "115",
      "biomass": "2659.64",
      "N": "1.7",
      "InitialFOMN_kg/ha": "45.39",
      "lwc": "4.07",
      "carb": "38.63",
      "cell": "55.67",
      "lign": "5.69",
      "Model_test": "Validation"
  },
  "RGE": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "81",
      "year": "2019",
      "affiliation": "MD",
      "field": "RGE",
      "lat": "39.203",
      "lng": "-75.8537",
      "killDate": 1557201600000,
      "plantingDate": 1558411200000,
      "end_date": "9/9/2019",
      "days": "125",
      "biomass": "1753.31",
      "N": "2.96",
      "InitialFOMN_kg/ha": "51.83",
      "lwc": "4.89",
      "carb": "44.17",
      "cell": "50.69",
      "lign": "5.14",
      "Model_test": "Validation"
  },
  "UUJ": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "82",
      "year": "2019",
      "affiliation": "MD",
      "field": "UUJ",
      "lat": "39.2553",
      "lng": "-76.1726",
      "killDate": 1556856000000,
      "plantingDate": 1557201600000,
      "end_date": "8/26/2019",
      "days": "115",
      "biomass": "4239.06",
      "N": "2.17",
      "InitialFOMN_kg/ha": "91.62",
      "lwc": "4.28",
      "carb": "35.58",
      "cell": "56.9",
      "lign": "7.52",
      "Model_test": "Calibration"
  },
  "VVR": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "83",
      "year": "2019",
      "affiliation": "MD",
      "field": "VVR",
      "lat": "39.2672",
      "lng": "-76.0842",
      "killDate": 1556856000000,
      "plantingDate": 1557201600000,
      "end_date": "8/26/2019",
      "days": "115",
      "biomass": "4438.76",
      "N": "2.03",
      "InitialFOMN_kg/ha": "90.53",
      "lwc": "5.15",
      "carb": "33.27",
      "cell": "60.23",
      "lign": "6.5",
      "Model_test": "Validation"
  },
  "VWZ": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "84",
      "year": "2019",
      "affiliation": "MD",
      "field": "VWZ",
      "lat": "39.2602",
      "lng": "-76.0756",
      "killDate": 1556856000000,
      "plantingDate": 1557201600000,
      "end_date": "8/26/2019",
      "days": "115",
      "biomass": "1885.29",
      "N": "1.55",
      "InitialFOMN_kg/ha": "28.7",
      "lwc": "3.62",
      "carb": "33.58",
      "cell": "59.91",
      "lign": "6.51",
      "Model_test": "Calibration"
  },
  "WEU": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "85",
      "year": "2019",
      "affiliation": "MD",
      "field": "WEU",
      "lat": "39.1963",
      "lng": "-75.8491",
      "killDate": 1557201600000,
      "plantingDate": 1558411200000,
      "end_date": "9/9/2019",
      "days": "125",
      "biomass": "2276.1",
      "N": "1.59",
      "InitialFOMN_kg/ha": "36.32",
      "lwc": "3.66",
      "carb": "41.73",
      "cell": "52.27",
      "lign": "6",
      "Model_test": "Calibration"
  },
  "DAB": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "86",
      "year": "2019",
      "affiliation": "NC",
      "field": "DAB",
      "lat": "34.9908",
      "lng": "-77.8942",
      "killDate": 1555473600000,
      "plantingDate": 1556164800000,
      "end_date": "8/14/2019",
      "days": "119",
      "biomass": "2991.52",
      "N": "1.48",
      "InitialFOMN_kg/ha": "43.84",
      "lwc": "3",
      "carb": "31.42",
      "cell": "61.45",
      "lign": "7.14",
      "Model_test": "Calibration"
  },
  "DAC": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "87",
      "year": "2019",
      "affiliation": "NC",
      "field": "DAC",
      "lat": "34.9908",
      "lng": "-77.8942",
      "killDate": 1555473600000,
      "plantingDate": 1556164800000,
      "end_date": "8/14/2019",
      "days": "119",
      "biomass": "2652.00",
      "N": "1.48",
      "InitialFOMN_kg/ha": "38.57",
      "lwc": "3.3",
      "carb": "34.18",
      "cell": "58.52",
      "lign": "7.3",
      "Model_test": "Validation"
  },
  "LAB": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "88",
      "year": "2019",
      "affiliation": "NC",
      "field": "LAB",
      "lat": "35.2723",
      "lng": "-77.6137",
      "killDate": 1553572800000,
      "plantingDate": 1555560000000,
      "end_date": "8/7/2019",
      "days": "134",
      "biomass": "3050.65",
      "N": "1.14",
      "InitialFOMN_kg/ha": "34.78",
      "lwc": "3.6",
      "carb": "39.76",
      "cell": "55.05",
      "lign": "5.2",
      "Model_test": "Calibration"
  },
  "LSS": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "89",
      "year": "2019",
      "affiliation": "NC",
      "field": "LSS",
      "lat": "35.3594",
      "lng": "-81.6515",
      "killDate": 1556769600000,
      "plantingDate": 1557460800000,
      "end_date": "8/29/2019",
      "days": "119",
      "biomass": "6672.84",
      "N": "1.16",
      "InitialFOMN_kg/ha": "76.56",
      "lwc": "2.85",
      "carb": "33.56",
      "cell": "59.71",
      "lign": "6.74",
      "Model_test": "Calibration"
  },
  "RAD": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "90",
      "year": "2019",
      "affiliation": "NC",
      "field": "RAD",
      "lat": "34.5344",
      "lng": "-79.2787",
      "killDate": 1554264000000,
      "plantingDate": 1556164800000,
      "end_date": "8/14/2019",
      "days": "133",
      "biomass": "1530.14",
      "N": "1.76",
      "InitialFOMN_kg/ha": "27.06",
      "lwc": "3",
      "carb": "58.12",
      "cell": "35.65",
      "lign": "6.23",
      "Model_test": "Validation"
  },
  "SAA": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "91",
      "year": "2019",
      "affiliation": "NC",
      "field": "SAA",
      "lat": "34.5359",
      "lng": "-79.275",
      "killDate": 1554264000000,
      "plantingDate": 1556164800000,
      "end_date": "8/14/2019",
      "days": "133",
      "biomass": "1492.62",
      "N": "1.81",
      "InitialFOMN_kg/ha": "27.33",
      "lwc": "2.85",
      "carb": "60.4",
      "cell": "33.87",
      "lign": "5.74",
      "Model_test": "Calibration"
  },
  "STA": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "92",
      "year": "2019",
      "affiliation": "NC",
      "field": "STA",
      "lat": "35.3267",
      "lng": "-80.3568",
      "killDate": 1556078400000,
      "plantingDate": 1557460800000,
      "end_date": "8/29/2019",
      "days": "127",
      "biomass": "3932.92",
      "N": "1.11",
      "InitialFOMN_kg/ha": "43.81",
      "lwc": "3.44",
      "carb": "46.81",
      "cell": "47.54",
      "lign": "5.65",
      "Model_test": "Validation"
  },
  "BBS": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "93",
      "year": "2019",
      "affiliation": "PA",
      "field": "BBS",
      "lat": "39.7376",
      "lng": "-76.371",
      "killDate": 1556164800000,
      "plantingDate": 1559102400000,
      "end_date": "9/17/2019",
      "days": "145",
      "biomass": "2028.68",
      "N": "1.85",
      "InitialFOMN_kg/ha": "37.48",
      "lwc": "5.76",
      "carb": "53.31",
      "cell": "39.31",
      "lign": "7.38",
      "Model_test": "Validation"
  },
  "DDR": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "94",
      "year": "2019",
      "affiliation": "PA",
      "field": "DDR",
      "lat": "39.8944",
      "lng": "-77.6228",
      "killDate": 1557892800000,
      "plantingDate": 1559102400000,
      "end_date": "9/17/2019",
      "days": "125",
      "biomass": "6897.25",
      "N": "1.61",
      "InitialFOMN_kg/ha": "110.45",
      "lwc": "3.47",
      "carb": "41.45",
      "cell": "52.92",
      "lign": "5.63",
      "Model_test": "Calibration"
  },
  "LHY": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "95",
      "year": "2019",
      "affiliation": "PA",
      "field": "LHY",
      "lat": "40.6426",
      "lng": "-76.8637",
      "killDate": 1557892800000,
      "plantingDate": 1559102400000,
      "end_date": "9/17/2019",
      "days": "125",
      "biomass": "869.79",
      "N": "5.68",
      "InitialFOMN_kg/ha": "49.4",
      "lwc": "2.83",
      "carb": "44.02",
      "cell": "50.4",
      "lign": "5.58",
      "Model_test": "Validation"
  },
  "MIT": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "96",
      "year": "2019",
      "affiliation": "PA",
      "field": "MIT",
      "lat": "40.6464",
      "lng": "-76.7846",
      "killDate": 1557892800000,
      "plantingDate": 1559102400000,
      "end_date": "9/17/2019",
      "days": "125",
      "biomass": "977.49",
      "N": "5.34",
      "InitialFOMN_kg/ha": "52.16",
      "lwc": "3.2",
      "carb": "42.53",
      "cell": "52.54",
      "lign": "4.93",
      "Model_test": "Validation"
  },
  "TTY": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "97",
      "year": "2019",
      "affiliation": "PA",
      "field": "TTY",
      "lat": "40.6601",
      "lng": "-76.7988",
      "killDate": 1557892800000,
      "plantingDate": 1559102400000,
      "end_date": "9/17/2019",
      "days": "125",
      "biomass": "802.36",
      "N": "5.69",
      "InitialFOMN_kg/ha": "45.59",
      "lwc": "2.93",
      "carb": "45.56",
      "cell": "49.38",
      "lign": "5.07",
      "Model_test": "Calibration"
  },
  "CCSP_C5": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "98",
      "year": "2017",
      "affiliation": "MD",
      "field": "CCSP_C5",
      "lat": "39.0131",
      "lng": "-76.9408",
      "killDate": 1493870400000,
      "plantingDate": 1496894400000,
      "end_date": "9/27/2017",
      "days": "146",
      "biomass": "3311.89",
      "N": "3.25",
      "InitialFOMN_kg/ha": "106.3",
      "lwc": "5.46",
      "carb": "52.09",
      "cell": "43.01",
      "lign": "4.89",
      "Model_test": "Calibration"
  },
  "CCSP_C6": {
      "BD": 1.5,
      "unit": "kg/ha",
      "ID": "99",
      "year": "2017",
      "affiliation": "MD",
      "field": "CCSP_C6",
      "lat": "39.0117",
      "lng": "-76.9391",
      "killDate": 1493870400000,
      "plantingDate": 1496894400000,
      "end_date": "9/27/2017",
      "days": "146",
      "biomass": "4732.47",
      "N": "2.73",
      "InitialFOMN_kg/ha": "128.99",
      "lwc": "6.01",
      "carb": "50.29",
      "cell": "43.73",
      "lign": "5.98",
      "Model_test": "Validation"
  }
}

const examples = {...PSA, ...Resham};

if (examples[demo]) {
  parms = {...parms, ...examples[demo]}
}

const ps = (s) => ({
  id: s,
  value: parms[s]
});

const sets = {};

console.clear();

// localStorage.clear();

document.title = 'Decomp';

const holdError = console.error;
console.error = (msg, ...subst) => {
  if (!/StrictMode/.test(msg)) {
    holdError(msg, ...subst)
  }
}

console.log(window.dataSpace)
export default App;