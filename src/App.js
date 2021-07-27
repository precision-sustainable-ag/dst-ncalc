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
    Output
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
    
    if (scr === 'Output') {
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

      test('OM', 'Soil', 'Please enter Organic Matter') ||
      test('BD', 'Soil', 'Please enter Bulk Density') ||
      test('InorganicN', 'Soil', 'Please enter Soil Inorganic N') ||

      setScreen2('Output');
    } else {
      setScreen2(scr);
    }
  } // setScreen

  useEffect(() => {
    if (!parms.lat || !parms.lng || !parms.killDate || !parms.plantingDate) {
      return;
    }

    sets.weather([]);

    const src = `https://api.precisionsustainableag.org/weather/hourly?lat=${parms.lat}&lon=${parms.lng}&start=${moment(parms.killDate).format('yyyy-MM-DD')}&end=${moment(parms.plantingDate).add(110, 'days').format('yyyy-MM-DD')}&attributes=air_temperature,relative_humidity,precipitation&predicted=true&zoptions=GMT`;
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
            
            data = data.filter(d => d.desgnmaster !== 'O');

            const minhzdept = Math.min.apply(Math, data.map(d => d.hzdept_r));
            data = data.filter(d => +d.hzdept_r === +minhzdept);

            console.log(JSON.stringify(data.map(d => [d.dbthirdbar_r, d.om_r, d.comppct_r, d.hzdept_r]), null, 2));
            console.log(weightedAverage(data, 'dbthirdbar_r'));
            sets.BD(weightedAverage(data, 'dbthirdbar_r'));
            sets.OM(weightedAverage(data, 'om_r'));
          }
        });
    }, 1000)
  }, [
    parms.lat,
    parms.lng,
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
const demo = params.get('demo');

let weatherTimer;
let ssurgoTimer;

let parms = {
  field               : demo ? 'My field' : '',
  targetN             : demo ? '100' : '',
  coverCrop           : demo ? ['Oats, Black'] : [],
  killDate            : demo ? new Date('05/08/2021') : '',
  cashCrop            : demo ? 'Brown Top Millet' : '',
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
  yield               : demo ? 100 : '',
  residue             : 'surface',
  NContent            : demo ? 1000 : '',
  residueC            : demo ? 100 : '',
  outputN             : 1,
  gotSSURGO           : false,
  help                : '',
  helpX               : 0,
  helpY               : 0,
  unit                : 'lb/ac',
  location            : demo ? 'Colorado' : '',
  nweeks              : 4
}

if (demo === 'corn') {
  parms.cashCrop = 'Corn';
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