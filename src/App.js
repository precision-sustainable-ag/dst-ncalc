// npm i --no-optional
// https://github.com/Tjatse/ansi-html/issues/19

// https://itnext.io/fixing-security-vulnerabilities-in-npm-dependencies-in-less-than-3-mins-a53af735261d
// npm i minimist --save-dev
// "resolutions": {
//   "minimist": "^1.2.5"
// }
// "scripts": {
//   "preinstall": "npx npm-force-resolutions"
// }
// npm i
// npm audit fix
// npm audit

// TODO: Advanced graphs
// TODO: Compare *incorporated* Georgia data to Iteris
// TODO: Inputs
// TODO: Change NUptake to percentage. "your first mock-up could be having a common secondary y-axis for both corn N uptake and cover crop N released (0-100%). And your second mock-up could be two different labels on secondary y-axis, both going from 0-100%."
// TODO: Saved PSA fields
// TODO: Carb, Cell, Lignin graph
// TODO: Rain, RH, Temp graph
// TODO: CNRF, ContactFactor, MTRF graph (?)
// TODO: num:  iteris moisture - Air Dry
// TODO: Output:  Mockup:  Center or enlarge left graph
// TODO: Flexbox Output screen:  Portrait
// TODO: Use SSURGO to troubleshoot Iteris vs Weather Station
// TODO: SSURGO: Field capacity and Permanent Wilting Point
// TODO: wthirdbar_r == DUL, wfifteenbar_r == Air Dry, awc_r
// TODO: SSURGO Air Dry / 2 === our Air Dry
// TODO: * 100 for percent
// TODO: MFac = (Sw - Ad) / (Dul - Ad
// TODO: Beta testing in January

// DONE: Output: Target N and Planting date:  .highcharts-plot-line-label {overflow: visible !important;}
// DONE: Make it a backend
// DONE: Incorporated

import React, {useEffect} from 'react';

import './App.css';

import moment from 'moment';

import 'react-datepicker/dist/react-datepicker.css';

import {defaults} from './defaults';

// Screens
import Home       from './components/Home';
import About      from './components/About';
import Location   from './components/Location';
import Soil       from './components/Soil';
import {CoverCrop1, CoverCrop2} from './components/CoverCrop';
import CashCrop   from './components/CashCrop';
import Output     from './components/Output';
import Advanced   from './components/Advanced';

const Airtable = require('airtable');

const holdError = console.error;
console.error = (msg, ...subst) => {
  if (!/StrictMode|Deprecation/.test(msg)) {
    holdError(msg, ...subst);
  }
}

const holdWarn = console.warn;
console.warn = (msg, ...subst) => {
  if (!/StrictMode|Deprecation/.test(msg)) {
    holdWarn(msg, ...subst);
  }
}

const Help = ({parms}) => {
  const style = {
    left: parms.helpX,
    top: parms.helpY,
    maxWidth:  `calc(100vw - ${parms.helpX}px - 20px)`,
    maxHeight: `calc(100vh - ${parms.helpY}px - 20px)`,
    overflow: 'auto'
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

const Screens = ({parms, props, set}) => {
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
        set.OM(1.5);
        parms.BD = 1.6;
        set.BD(1.6);
      }

      test('lat', 'Location', 'Please enter Latitude and Longitude') ||
      test('lon', 'Location', 'Please enter Latitude and Longitude') ||

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
    const airtable = (table, callback, wrapup) => {
      base(table).select({
        view: 'Grid view'
      }).eachPage((records, fetchNextPage) => {
        records.forEach(record => {
          callback(record.fields);
        });
    
        fetchNextPage();
      }, function done(err) {
        if (err) {
          console.error(err);
        } else if (wrapup) {
          wrapup();
        }
      });
    } // airtable

    const base = new Airtable({apiKey: 'keySO0dHQzGVaSZp2'}).base('appOEj4Ag9MgTTrMg');

    airtable('PSA', (site) => {
      // console.log(site);
      if (site.Hour === 0) {
        examples[site.ID] = {
          field             : site.ID,
          lat               : site.Lat,
          lon               : site.Lon,
          location          : '',
          BD                : site.BD,
          coverCrop         : [site['Cover Crop']],
          cashCrop          : site['Cash Crop'],
          killDate          : new Date(site.Date),
          lwc               : site.LitterWaterContent,
          biomass           : Math.round(site.FOM),
          unit              : 'kg/ha',
          N                 : +(site.FOMpctN.toFixed(2)),
          carb              : +(site.Carb.toFixed(2)),
          cell              : +(site.Cell.toFixed(2)),
          lign              : +(site.Lign.toFixed(2)),
          targetN           : 150,
          category          : site.Category,
        } 
      } else {
        examples[site.ID].plantingDate = new Date(moment(site.Date).add(-111, 'days'));
      }
    });

    const mb = {};
    const species = {};
  
    airtable(
      'CoverCrops',
      (crop) => {
        species[crop.Category] = species[crop.Category] || [];
        species[crop.Category].push(crop.Crop);
        mb[crop.Crop] = crop.MaxBiomass;
      },
      () => {
        set.maxBiomass(mb);
        set.species(species);
      }
    );
  }, []);

  const loadField = (field) => {
    const inputs = JSON.parse(localStorage[field]);
    Object.keys(inputs).forEach(key => {
      try {
        if (/Date/.test(key)) {
          set[key](new Date(inputs[key]));
        } else {
          set[key](inputs[key]);
        }
      } catch(e) {
        console.log(key, e.message);
      }
    });
  } // loadField

  const update = (e, id = e.target.id, val = e.target.value) => {
    try {
      if (/googlemap|mui/.test(id)) {
        return;
      }

      console.log(JSON.stringify(val));

      set[id](val);

      if (id === 'cell') {
        // set.lign(+(100 - (+parms.carb + +val)).toFixed(1));
      } else if (id === 'N') {
        const carb = (24.7 + 10.5 * val).toFixed(0);
        const cell = (69 - 10.2 * val).toFixed(0);
        set.carb(carb);
        set.cell(cell);
        set.lign(100 - (+carb + +cell));
      }

      console.log(id, val);
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
        set[key](PSA[key]);
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
          set.help('');
        }
      }}

      onClick={(e) => {
        if (/^help/.test(e.target.innerHTML)) {
          set.help(e.target.innerHTML.slice(4));
          set.helpX(Math.min(e.pageX + 20, window.innerWidth - 400));
          set.helpY(e.pageY - 20);
        } else {
          set.help('');
        }
      }}

      id="Main"
    >
      <nav onClick={changeScreen}>
        <img src="logo.png" alt="" />
        <button className={/Home|About/.test(screen)  ? 'selected' : undefined} data-scr="Home"       >Home</button>
        <button className={/Location/.test(screen)    ? 'selected' : undefined} data-scr="Location"   >Location</button>
        <button className={/Soil/.test(screen)        ? 'selected' : undefined} data-scr="Soil"       >Soil</button>
        <button className={/CoverCrop/.test(screen)   ? 'selected' : undefined} data-scr="CoverCrop1" >Cover Crop</button>
        <button className={/CashCrop/.test(screen)    ? 'selected' : undefined} data-scr="CashCrop"   >Cash Crop</button>
        <button className={/Output/.test(screen)      ? 'selected' : undefined} data-scr="Output"     >Output</button>
        {
          isPSA ? 
            <select id="Fields"
              onChange={changePSA}
              value={parms.field}
            >
              <option></option>
              <optgroup label="PSA">
                {
                  Object.keys(examples)
                    .filter(site => examples[site].category === 'PSA')
                    .sort().map(site => <option key={site}>{site}</option>)
                }
              </optgroup>
              <optgroup label="Resham">
                {
                  Object.keys(examples)
                    .filter(site => examples[site].category === 'Resham')
                    .sort().map(site => <option key={site}>{site}</option>)
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
        props: props,
        set: set,
        parms: parms,
        setScreen: setScreen,
        update: update
      })}
    </div>
  );
} // Screens

const App = () => {
  const runModel = () => {
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
  
    if (!parms.lat || !parms.lon) {
      return;
    }

    if (!parms.firstSSURGO) {
      set.BD('');
    }
    set.OM('');

    // const ssurgoSrc = `https://api.precisionsustainableag.org/ssurgo?lat=${parms.lat}&lon=${parms.lon}&component=major`;
    const start = moment(parms.killDate).format('yyyy-MM-DD');
    const end   = moment(parms.plantingDate).add(110, 'days').add(1, 'hour').format('yyyy-MM-DD');
    const lwc = parms.lwc || 10;
    let carb = parms.carb || (24.7 + 10.5 * parms.N);
    let cell = parms.cell || (69 - 10.2 * parms.N);
    let lign = parms.lign || (100 - (carb + cell));

    const total = +parms.carb + +parms.cell + +parms.lign;
    carb = parms.carb * 100 / total;
    cell = parms.cell * 100 / total;
    lign = parms.lign * 100 / total;
    const factor = parms.unit === 'lb/ac' ? 1.12085 : 1;
    const biomass = parms.biomass * factor;
    const om = parms.OM;
    const bd = parms.BD;
    const In = parms.InorganicN || 10;
    const pmn = 10;
    console.log(parms.N, carb, cell, lign, biomass, bd, In);
    const ssurgoSrc = `https://weather.aesl.ces.uga.edu/ssurgo?lat=${parms.lat}&lon=${parms.lon}&component=major`;
    const modelSrc  = `https://weather.aesl.ces.uga.edu/cc-ncalc/both?lat=${parms.lat}&lon=${parms.lon}&start=${start}&end=${end}&n=${parms.N}&biomass=${biomass}&lwc=${lwc}&carb=${carb}&cell=${cell}&lign=${lign}&om=${om}&bd=${bd}&in=${In}&pmn=${pmn}`;

    console.log(ssurgoSrc);
    console.log(modelSrc);
    clearTimeout(ssurgoTimer);
    set.gotSSURGO(false);
    set.gotModel(false);

    ssurgoTimer = setTimeout(() => {
      if (start !== 'Invalid date' && end !== 'Invalid date') {
        fetch(modelSrc)
          .then(response => response.json())
          .then(data => {
            console.log(data);
            const modelSurface = {};
            data.surface.forEach(data => {
              Object.keys(data).forEach(key => {
                modelSurface[key] = modelSurface[key] || [];
                modelSurface[key].push(data[key]);
              });
            });
          
            const modelIncorporated = {};
            data.incorporated.forEach(data => {
              Object.keys(data).forEach(key => {
                modelIncorporated[key] = modelIncorporated[key] || [];
                modelIncorporated[key].push(data[key]);
              });
            });
          
            const model = {
              s: modelSurface,
              i: modelIncorporated
            }
          
            const cols = Object.keys(model.s).sort((a, b) => a.toUpperCase().localeCompare(b.toUpperCase()));

            cols.filter(col => !model.s[col].length).forEach(col => {
              model.s[col] = new Array(model.s.Rain.length).fill(model.s[col]);
            });
          
            set.model(model);
            set.gotModel(true);
            console.log('model');
            console.log(data);
          });
      }

      fetch(ssurgoSrc)
        .then(response => response.json())
        .then(data => {
          if (data instanceof Array) {
            set.gotSSURGO(true);
            console.log('SSURGO:');
            console.log(data);
            
            data = data.filter(d => d.desgnmaster !== 'O');

            const minhzdept = Math.min.apply(Math, data.map(d => d.hzdept_r));
            data = data.filter(d => +d.hzdept_r === +minhzdept);

            console.log(JSON.stringify(data.map(d => [d.dbthirdbar_r, d.om_r, d.comppct_r, d.hzdept_r]), null, 2));
            console.log(weightedAverage(data, 'dbthirdbar_r'));

            if (!parms.firstSSURGO || !parms.BD) {
              set.BD(weightedAverage(data, 'dbthirdbar_r'));
            }
            set.firstSSURGO(false);
            
            set.OM(weightedAverage(data, 'om_r'));
          }
        });
    }, 1000);
  } // runModel

  const getWeather = () => {
    if (!parms.lat || !parms.lon || !parms.killDate || !parms.plantingDate) {
      return;
    }

    set.weather([]);

    const src = `https://weather.aesl.ces.uga.edu/weather/hourly?lat=${parms.lat}&lon=${parms.lon}&start=${moment(parms.killDate).format('yyyy-MM-DD')}&end=${moment(parms.plantingDate).add(110, 'days').format('yyyy-MM-DD')}&attributes=air_temperature,relative_humidity,precipitation&options=predicted`;
    console.log(src);
    clearTimeout(weatherTimer);
    weatherTimer = setTimeout(() => {
      fetch(src)
        .then(response => response.json())
        .then(data => {
          if (!(data instanceof Array)) {
            alert(`No data found.\nPlease choose a location within the conterminous United States.`);
          } else {
            set.weather(data);
            console.log('Weather:');
            console.log(data);
          }
        });
    }, 1000)
  } // getWeather

  const change = (parm, value, target, index) => {
  } // change

  let {parms, set, props} = defaults(
    change,
    {
      field               : demo ? 'My field' : '',
      targetN             : demo ? '150' : '',
      coverCrop           : demo ? ['Oats, Black'] : [],
      killDate            : demo ? new Date('05/08/2021') : '',
      cashCrop            : demo ? 'Corn' : '',
      plantingDate        : demo ? new Date('05/20/2021') : '',
      lat                 : demo ? 32.5714 : 40.7849,
      lon                 : demo ? -82.0760 : -74.8073,
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
      model               : {},
      OM                  : demo ? 5   : '',
      BD                  : demo ? 1.5 : '',
      yield               : demo ? 150 : 150,
      residue             : 'surface',
      NContent            : demo ? 1000 : '',
      residueC            : demo ? 100 : '',
      outputN             : 1,
      gotSSURGO           : false,
      gotModel            : false,
      help                : '',
      helpX               : 0,
      helpY               : 0,
      state               : '',
      unit                : 'lb/ac',
      location            : demo ? '' : '',
      nweeks              : 4,
      firstSSURGO         : true,
      mockup              : 2,
      species             : {},
      maxBiomass          : {},
      effects : {
        lat           : [getWeather, runModel],
        lon           : [getWeather, runModel],
        plantingDate  : [getWeather, runModel],
        killDate      : [getWeather, runModel],
        N             : runModel,
        carb          : runModel,
        cell          : runModel,
        lign          : runModel,
        lwc           : runModel,
        // BD            : runModel,  // TODO
        // OM            : runModel,  // TODO
        InorganicN    : runModel,
        biomass       : runModel,
      }
    }
  );

  return (
    <div>
      <Screens parms={parms} props={props} set={set} />
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

let examples = {};

if (examples[demo]) {
  // parms = {...parms, ...examples[demo]}
}

// localStorage.clear();

document.title = 'CC-NCalc';

export default App;
