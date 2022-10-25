import {createStore, set} from './redux-autosetters';
import moment from 'moment';

const params = new URLSearchParams(window.location.search);

const query = (parm, def) => {
  if (parm === 'covercrop' && params.get('covercrop')) {
    return params.get(parm).split(',');
  } else if (/date/.test(parm) && params.get(parm)) {
    return moment(params.get(parm));
  } else {
    return params.get(parm) || def;
  }
} // query

let initialState = {
  help                : '',
  helpX               : 0,
  helpY               : 0,
  focus               : '',
  name                : '',
  email               : '',
  feedback            : '',
  screen              : '',
  PSA                 : window.location.toString().includes('PSA'),
  field               : query('field', ''),
  targetN             : '150',
  coverCrop           : query('covercrop', []),
  killDate            : query('date1', ''),
  cashCrop            : '',
  plantingDate        : query('date2', ''),
  lat                 : query('lat', 40.7849),
  lon                 : query('lon', -74.8073),
  InorganicN          : 10,
  N                   : query('N', ''),
  carb                : query('carb', ''),
  cell                : query('cell', ''),
  lign                : query('lign', ''),
  freshBiomass        : '',
  biomass             : query('biomass', ''),
  lwc                 : (state) => Math.max((+((state.freshBiomass - state.biomass) / state.biomass).toFixed(2)), 0) || 4,
  mapZoom             : 13,
  mapType             : 'hybrid',
  mapPolygon          : [],
  model               : {},
  OM                  : '',
  BD                  : '',
  yield               : 150,
  residue             : 'surface',
  NContent            : '',
  residueC            : '',
  outputN             : 1,
  SSURGO              : {},
  gotSSURGO           : false,
  gotModel            : false,
  cornN               : false,
  state               : '',
  stateAbbreviation   : '',
  unit                : 'lb/ac',
  location            : '',
  nweeks              : 4,
  mockup              : 2,
  species             : {},
  maxBiomass          : {},
  privacy             : false,
  errorModel          : false,
  errorCorn           : false,
  edited              : false,
  site: '',
  sites: [],
  worksheetName: '',
  worksheet: [],
  data: '',
  xl: {
    Description:    [],
    Biology:        [],
    Climate:        [],
    Fertilization:  [],
    GridRatio:      [],
    Irrig:          [],
    Init:           [],
    Soil:           [],
    Solute:         [],
    Time:           [],
    Variety:        [],
    Weather:        [],
    Gas:            [],
    MulchDecomp:    [],
    MulchGeo:       [],
    Tillage:        [],
  },
};

const ac = {
  ncalc: {
    N: (state, {payload}) => {
      if (!state.edited) {
        state.carb = Math.min(100, Math.max(0, (24.7 + 10.5 * payload))).toFixed(0);
        state.cell = Math.min(100, Math.max(0, (69 - 10.2 * payload))).toFixed(0);
        state.lign = 100 - (+state.carb + +state.cell);
      }
      state.gotModel = false;
    },
    carb: (state)           => {state.gotModel = false; state.edited = true;},
    cell: (state)           => {state.gotModel = false; state.edited = true;},
    lign: (state)           => {state.gotModel = false; state.edited = true;},
    lat: (state)            => {state.gotModel = false; fetchSSURGO(state);},
    lon: (state)            => {state.gotModel = false; fetchSSURGO(state);},
    lwc: (state)            => {state.gotModel = false;},
    killDate: (state)       => {state.gotModel = false;},
    plantingDate: (state)   => {state.gotModel = false;},
    biomass: (state)        => {state.gotModel = false;},
    freshBiomass: (state)   => {state.gotModel = false;},
    BD: (state)             => {state.gotModel = false;},
    OM: (state)             => {state.gotModel = false;},
    InorganicN: (state)     => {state.gotModel = false;},
  },
  water: {
    lat: (state)            => fetchSSURGOWater(state),
    lon: (state)            => fetchSSURGOWater(state),
  }
};

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

export const fetchModel = () => {
  const state = store.getState();
  store.dispatch(set.gotModel(false));
  store.dispatch(set.errorModel(false));

  let {lat, lon, N, biomass, lwc, carb, cell, lign, OM, BD, InorganicN, unit} = state;
  // console.log({lat, lon, N, biomass, lwc, carb, cell, lign, OM, BD, InorganicN, unit});

  const start = moment(state.killDate).format('yyyy-MM-DD');
  const end   = moment(state.plantingDate).add(110, 'days').add(1, 'hour').format('yyyy-MM-DD');
  const validDates = start !== 'Invalid date' && end !== 'Invalid date' && end > start;
  
  console.log({start, end}, state.killDate, validDates);
  
  if (validDates) {
    const pmn = 10;

    InorganicN = InorganicN || 10;

    lwc = lwc || 10;
    carb = carb || (24.7 + 10.5 * N);
    cell = cell || (69 - 10.2 * N);
    lign = lign || (100 - (carb + cell));

    const total = +carb + +cell + +lign;
    carb = carb * 100 / total;
    cell = cell * 100 / total;
    lign = lign * 100 / total;

    const factor = unit === 'lb/ac' ? 1.12085 : 1;
    
    biomass *= factor;

    const src = `https://api.precisionsustainableag.org/cc-ncalc/surface?lat=${lat}&lon=${lon}&start=${start}&end=${end}&n=${N}&biomass=${biomass}&lwc=${lwc}&carb=${carb}&cell=${cell}&lign=${lign}&om=${OM}&bd=${BD}&in=${InorganicN}&pmn=${pmn}`;

    api(
      src,
      (data) => {
        if (data.name === 'error' || !data.surface) {
          store.dispatch(set.errorModel(true));
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
      
        const model = {
          s: modelSurface,
          i: modelIncorporated
        }
      
        const cols = Object.keys(model.s).sort((a, b) => a.toUpperCase().localeCompare(b.toUpperCase()));

        cols.filter(col => !model.s[col].length).forEach(col => {
          model.s[col] = new Array(model.s.Rain.length).fill(model.s[col]);
        });
      
        store.dispatch(set.model(model));
        store.dispatch(set.gotModel(true));
        console.log('model');
        console.log(data);

        fetchCornN(store.getState());
      },
      'model',
      2000
    );
  }
} // fetchModel

const fetchSSURGOWater = (state) => {
  const {lat, lon} = state;

  state.gotSSURGO = false;

  const src = `https://api.precisionsustainableag.org/ssurgo?lat=${lat}&lon=${lon}&component=major`;

  api(
    src,
    (data) => {
      if (data.ERROR) {
        console.log(`No SSURGO data at ${lat}, ${lon}`);
        store.dispatch(set.BD(''));
        store.dispatch(set.OM(''));
      } else {
        // store.dispatch(set.BD(weightedAverage(data, 'dbthirdbar_r')));
        // store.dispatch(set.OM(weightedAverage(data, 'om_r')));
        store.dispatch(set.gotSSURGO(true));
        store.dispatch(set.SSURGO(data));
      }
    },
    'ssurgo',
    2000
  );
} // fetchSSURGOWater

const fetchSSURGO = (state) => {
  const {lat, lon} = state;

  state.gotSSURGO = false;

  const src = `https://api.precisionsustainableag.org/ssurgo?lat=${lat}&lon=${lon}&component=major`;

  api(
    src,
    (data) => {
      if (data.ERROR) {
        console.log(`No SSURGO data at ${lat}, ${lon}`);
        store.dispatch(set.BD(''));
        store.dispatch(set.OM(''));
      } else {
        data = data.filter(d => d.desgnmaster !== 'O');
        const minhzdept = Math.min.apply(Math, data.map(d => d.hzdept_r));
        data = data.filter(d => +d.hzdept_r === +minhzdept);

        store.dispatch(set.BD(weightedAverage(data, 'dbthirdbar_r')));
        store.dispatch(set.OM(weightedAverage(data, 'om_r')));
        store.dispatch(set.gotSSURGO(true));
        store.dispatch(set.SSURGO(data));
      }
    },
    'ssurgo',
    2000
  );
} // fetchSSURGO

const fetchCornN = (state) => {
  const {lat, lon, plantingDate} = state;
  
  const end = moment(state.plantingDate).add(110, 'days').add(1, 'hour').format('yyyy-MM-DD');
  
  store.dispatch(set.cornN(false));
  store.dispatch(set.errorCorn(false));

  const src = `https://api.precisionsustainableag.org/weather/hourly?lat=${lat}&lon=${lon}&start=${moment(plantingDate).format('yyyy-MM-DD')}&end=${end}&attributes=air_temperature&options=predicted`;
  
  api(
    src,
    (data) => {
      if (data instanceof Array) {
        console.log('CornN:');
        console.log(data);

        store.dispatch(set.cornN(data));
      } else {
        console.log('CornN error:');
        console.log(src);
        console.log(data);
        store.dispatch(set.errorCorn(true));
      }
    }
  );
} // fetchCornN

export const missingData = () => {
  const state = store.getState();
  const {lat, lon, killDate, plantingDate, biomass, lwc, N, carb, cell, lign, BD, InorganicN} = state;

  let result = '';

  if (/output|advanced/i.test(window.location)) {
    const test = (parm, val, scr, desc = `Please enter ${parm}`) => {
      if (!val) {
        alert(desc);
        result = scr;
        return true;
      }
    } // test

    if (killDate - plantingDate > 1814400000) {
      alert('Cash crop planting date must be no earlier than 3 weeks before the cover crop kill date.');
      return 'covercrop';
    } else if (plantingDate - killDate > 7776000000) {
      alert('Cash crop planting date should be within 3 months of the cover crop kill date.');
      return 'covercrop';
    } else {
      if (test('lat', lat, 'location', 'Please enter Latitude and Longitude')) return result;
      if (test('lon', lon, 'location', 'Please enter Latitude and Longitude')) return result;
      
      if (test('killDate', killDate, 'covercrop', 'Please enter Cover Crop Termination Date')) return result;
      if (test('biomass', biomass, 'covercrop', 'Please enter Biomass')) return result;
      if (test('lwc', lwc, 'covercrop', 'Please enter Water Content')) return result;
      
      if (test('N', N, 'covercrop2', 'Please enter Nitrogen')) return result;
      if (test('carb', carb, 'covercrop2', 'Please enter Carbohydrates')) return result;
      if (test('cell', cell, 'covercrop2', 'Please enter Cellulose')) return result;
      if (test('lign', lign, 'covercrop2', 'Please enter Lignin')) return result;
      
      if (test('plantingDate', plantingDate, 'cashcrop', 'Please enter Cash Crop Planting Date')) return result;
      
      if (test('BD', BD, 'soil', 'Please enter Bulk Density')) return result;
      if (test('InorganicN', InorganicN, 'soil', 'Please enter Soil Inorganic N')) return result;
    }
  }
} // missingData

const reducers = {
};

const dst = /water/i.test(window.location) ? 'water' : 'ncalc';

export const store = createStore(initialState, {afterChange: ac[dst], reducers});

export const api = (url, callback, timer, delay=0) => {
  if (timer) {
    clearTimeout(api[timer]);
  }

  api[timer] = setTimeout(() => {
    console.log(url);
    store.dispatch({
      type: 'api',
      payload: {
        url,
        callback
      }
    });
  }, delay);
} // api

export {set, get} from './redux-autosetters';
