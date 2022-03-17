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
import Feedback   from './components/Feedback';
import Advanced   from './components/Advanced';
import { Button } from '@mui/material';

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
    Feedback,
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

      if (parms.plantingDate < parms.killDate) {
        alert('Cash crop planting date must be later than the cover crop kill date.');
        setScreen('CoverCrop1');
      } else if (parms.plantingDate - parms.killDate > 7776000000) {
        alert('Cash crop planting date should be within 3 months of the cover crop kill date.');
        setScreen('CoverCrop1');
      } else {
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
      }
    } else {
      setScreen2(scr);

      // AutoComplete component doesn't understand autoFocus:
      let focus = scr === 'CoverCrop1' ? '#coverCrop' :
                  scr === 'CashCrop'   ? '#cashCrop'  :
                  scr === 'Feedback'   ? '#Feedback'  :
                                         null;
        
      if (focus) {
        setTimeout(() => document.querySelector(focus).focus(), 10);
      }
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
      localStorage.removeItem(site.ID);
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
    if (field === 'Example: Grass') {
      setScreen('Location');
      set.edited(true);
      set.lat(32.865389);
      set.lon(-82.258361);
      set.location('Example');
      set.field('Example: Grass');
      set.OM(0.75);
      set.BD(1.62);
      set.InorganicN(10);
      set.coverCrop(['Rye']);
      set.killDate(new Date('03/21/2019'));
      set.plantingDate(new Date('04/01/2019'));
      set.biomass(5000);
      set.lwc(1.486);
      set.N(0.6);
      set.carb(33.45);
      set.cell(57.81);
      set.lign(8.74);
      set.cashCrop('Corn');
      set.yield(150);
      set.targetN(150);
    } else if (field === 'Example: Legume') {
      setScreen('Location');
      set.edited(true);
      set.lat(32.865389);
      set.lon(-82.258361);
      set.location('Example');
      set.field('Example: Legume');
      set.OM(0.75);
      set.BD(1.62);
      set.InorganicN(10);
      set.coverCrop(['Clover, Crimson']);
      set.killDate(new Date('04/27/2019'));
      set.plantingDate(new Date('05/15/2019'));
      set.biomass(3500);
      set.lwc(7.4);
      set.N(3.5);
      set.carb(56.18);
      set.cell(36.74);
      set.lign(7.08);
      set.cashCrop('Corn');
      set.yield(150);
      set.targetN(100);
    } else {
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
    }
  } // loadField

  const changeScreen = (e) => {
    const button = e.target;

    if (button.tagName === 'BUTTON') {
      setScreen(button.dataset.scr);
    }
  } // changeScreen

  const changeField=(e) => {
    const field = e.target.value;
    if (field === 'Clear previous runs') {
      if (window.confirm('Clear all previous runs?')) {
        localStorage.clear();
        setScreen('Home');
      }
    } else {
      loadField(field);
    }
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

  useEffect(() => {
    if (params.get('dev')) {
      loadField('Example: Grass');
    }
  }, []);

  return (
    <div
      tabIndex="0"

      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          set.help('');
          set.privacy(false);
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
      <img alt="logo" src="PSALogo.png" id="PSALogo"/>

      <nav onClick={changeScreen}>
        <button className={/Home|About/.test(screen)  ? 'selected' : undefined} data-scr="Home"       >Home</button>
        <button className={/Location/.test(screen)    ? 'selected' : undefined} data-scr="Location"   >Location</button>
        <button className={/Soil/.test(screen)        ? 'selected' : undefined} data-scr="Soil"       >Soil</button>
        <button className={/CoverCrop/.test(screen)   ? 'selected' : undefined} data-scr="CoverCrop1" >Cover Crop</button>
        {/*  <button id="CCQuality" data-scr="CoverCrop2">Quality</button> */}
        <button className={/CashCrop/.test(screen)    ? 'selected' : undefined} data-scr="CashCrop"   >Cash Crop</button>
        <button className={/Output/.test(screen)      ? 'selected' : undefined} data-scr="Output"     >Output</button>
        {
          params.get('dev') && 
          <button className={/Advanced/.test(screen)    ? 'selected' : undefined} data-scr="Advanced"   >Advanced</button>
        }
        
        <Button className="feedback" data-scr="Feedback" variant="outlined" color="primary" >Feedback</Button>
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
          true || Object.keys(localStorage).length ?
            <select id="Fields"
              onChange={changeField}
              value={parms.field}
            >
              <option></option>
              <option>Example: Grass</option>
              <option>Example: Legume</option>
              {
                Object.keys(localStorage).length && (
                  <>
                    <option>Clear previous runs</option>
                    <option disabled>____________________</option>
                  </>
                )
              }
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
      })}
    </div>
  );
} // Screens

const App = () => {
  const runModel = () => {
    clearTimeout(modelTimer);
    modelTimer = setTimeout(runModel2, 300);
  } // runModel

  const runModel2 = () => {
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

    const ssurgoSrc = params.get('dev') ? `https://weather.aesl.ces.uga.edu/ssurgo?lat=${parms.lat}&lon=${parms.lon}&component=major` :
                                          `https://api.precisionsustainableag.org/ssurgo?lat=${parms.lat}&lon=${parms.lon}&component=major`

    // const modelSrc  = `https://weather.aesl.ces.uga.edu/cc-ncalc/both?lat=${parms.lat}&lon=${parms.lon}&start=${start}&end=${end}&n=${parms.N}&biomass=${biomass}&lwc=${lwc}&carb=${carb}&cell=${cell}&lign=${lign}&om=${om}&bd=${bd}&in=${In}&pmn=${pmn}`;
    const modelSrc  = params.get('dev') ? `https://weather.aesl.ces.uga.edu/cc-ncalc/surface?lat=${parms.lat}&lon=${parms.lon}&start=${start}&end=${end}&n=${parms.N}&biomass=${biomass}&lwc=${lwc}&carb=${carb}&cell=${cell}&lign=${lign}&om=${om}&bd=${bd}&in=${In}&pmn=${pmn}` :
                                          `https://api.precisionsustainableag.org/cc-ncalc/surface?lat=${parms.lat}&lon=${parms.lon}&start=${start}&end=${end}&n=${parms.N}&biomass=${biomass}&lwc=${lwc}&carb=${carb}&cell=${cell}&lign=${lign}&om=${om}&bd=${bd}&in=${In}&pmn=${pmn}`

    set.gotSSURGO(false);
    set.gotModel(false);

    if (start !== 'Invalid date' && end !== 'Invalid date' && end > start) {
      console.log(modelSrc);
  
      fetch(modelSrc)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          if (!data.surface) {
            return;
          }
          const modelSurface = {};
          data.surface.forEach(data => {
            Object.keys(data).forEach(key => {
              modelSurface[key] = modelSurface[key] || [];
              modelSurface[key].push(data[key]);
            });
          });
        
          const modelIncorporated = {};
          /*
          data.incorporated.forEach(data => {
            Object.keys(data).forEach(key => {
              modelIncorporated[key] = modelIncorporated[key] || [];
              modelIncorporated[key].push(data[key]);
            });
          });
          */
        
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

    console.log(ssurgoSrc);
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
      }
    );
  } // runModel2

  const NDefaults = () => {
    if (!parms.edited) {
      const carb = Math.min(100, Math.max(0, (24.7 + 10.5 * parms.N))).toFixed(0);
      const cell = Math.min(100, Math.max(0, (69 - 10.2 * parms.N))).toFixed(0);
      set.carb(carb);
      set.cell(cell);
      set.lign(100 - (+carb + +cell));
    }
  } // NDefaults

  const change = (parm, value, target, index) => {
  } // change

  const query = (parm, def) => {
    if (parm === 'covercrop' && params.get('covercrop')) {
      return params.get(parm).split(',');
    } else if (/date/.test(parm) && params.get(parm)) {
      return moment(params.get(parm));
    } else {
      return params.get(parm) || def;
    }
  } // query

  let {parms, set, props} = defaults(
    change,
    {
      name                : '',
      email               : '',
      feedback            : '',
      field               : demo ? 'My field' : query('field', ''),
      targetN             : demo ? '150' : '150',
      coverCrop           : demo ? ['Oats, Black'] : query('covercrop', []),
      killDate            : demo ? new Date('05/08/2021') : query('date1', ''),
      cashCrop            : demo ? 'Corn' : '',
      plantingDate        : demo ? new Date('05/20/2021') : query('date2', ''),
      lat                 : demo ? 32.5714 : query('lat', 40.7849),
      lon                 : demo ? -82.0760 : query('lon', -74.8073),
      N                   : demo ? 1.52 : query('N', ''),
      InorganicN          : demo ? 10   : 10,
      carb                : demo ? 44.34 : query('carb', ''),
      cell                : demo ? 50.77 : query('cell', ''),
      lign                : demo ? 4.88 : query('lign', ''),
      lwc                 : 4,
      highOM              : 'No',
      nutrient            : 'Left on the surface',
      biomass             : demo ? 5235 : query('biomass', ''),
      mapZoom             : 13,
      mapType             : 'hybrid',
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
      privacy             : false,
      edited              : query('carb', false),
      effects : {
        lat           : runModel,
        lon           : runModel,
        plantingDate  : runModel,
        killDate      : runModel,
        N             : [NDefaults, runModel],
        carb          : runModel,
        cell          : runModel,
        lign          : runModel,
        lwc           : runModel,
        // BD            : runModel,  // TODO
        // OM            : runModel,  // TODO
        // InorganicN    : runModel,  // TODO
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

if (params.get('fy')) {
  setTimeout(() => {
    document.querySelector('button[data-scr=Output]').click();
    setTimeout(() => {
      window.close();
    }, 2000);
  }, 5000);
}

if (isPSA && !demo) {
  demo = 'AMD';
}

let examples = {};

let modelTimer;

if (examples[demo]) {
  // parms = {...parms, ...examples[demo]}
}

export default App;
