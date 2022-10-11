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
  screen              : 'Home',
  help                : '',
  helpX               : 0,
  helpY               : 0,
  focus               : '',
  name                : '',
  email               : '',
  feedback            : '',
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
  lwc                 : (state) => (+((state.freshBiomass - state.biomass) / state.biomass).toFixed(2)) || 4,
  mapZoom             : 13,
  mapType             : 'hybrid',
  model               : {},
  OM                  : '',
  BD                  : '',
  yield               : 150,
  residue             : 'surface',
  NContent            : '',
  residueC            : '',
  outputN             : 1,
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
};

const afterChange = {
  N: (state, {payload}) => {
    if (!state.edited) {
      state.carb = Math.min(100, Math.max(0, (24.7 + 10.5 * payload))).toFixed(0);
      state.cell = Math.min(100, Math.max(0, (69 - 10.2 * payload))).toFixed(0);
      state.lign = 100 - (+state.carb + +state.cell);
    }
    fetchModel(state);
  },
  carb: (state)           => {fetchModel(state); state.edited = true;},
  cell: (state)           => {fetchModel(state); state.edited = true;},
  lign: (state)           => {fetchModel(state); state.edited = true;},
  lat: (state)            => {fetchSSURGO(state); fetchModel(state);},  // TODO: fetchModel _after_ fetchSSURGO
  lon: (state)            => {fetchSSURGO(state); fetchModel(state);},  // TODO: fetchModel _after_ fetchSSURGO
  lwc: (state)            => {fetchModel(state);},
  killDate: (state)       => {fetchModel(state);},
  plantingDate: (state)   => {fetchModel(state);},
  biomass: (state)        => {fetchModel(state);},
  freshBiomass: (state)   => {fetchModel(state);},
  // BD: (state)             => {fetchModel(state);},
  // OM: (state)             => {fetchModel(state);},
  // InorganicN: (state)     => {fetchModel(state);},
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

const fetchModel = (state) => {
  state.gotModel = false;
  state.errorModel = false;

  let {lat, lon, N, biomass, lwc, carb, cell, lign, OM, BD, InorganicN, unit} = state;
  console.log({lat, lon, N, biomass, lwc, carb, cell, lign, OM, BD, InorganicN, unit});

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

    api(
      `https://api.precisionsustainableag.org/cc-ncalc/surface?lat=${lat}&lon=${lon}&start=${start}&end=${end}&n=${N}&biomass=${biomass}&lwc=${lwc}&carb=${carb}&cell=${cell}&lign=${lign}&om=${OM}&bd=${BD}&in=${InorganicN}&pmn=${pmn}`,
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

const fetchSSURGO = (state) => {
  const {lat, lon} = state;

  state.gotSSURGO = false;

  api(
    `https://api.precisionsustainableag.org/ssurgo?lat=${lat}&lon=${lon}&component=major`,
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
      }
      // fetchModel(store.getState());
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

  const src = `https://api.precisionsustainableag.org/weather/hourly?lat=${lat}&lon=${lon}&start=${moment(plantingDate).format('yyyy-MM-DD')}&end=${end}&attributes=air_temperature`;
  
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

const reducers = {
};

export const store = createStore(initialState, {afterChange, reducers});

export const api = (url, callback, timer, delay=0) => {
  if (timer) {
    clearTimeout(api[timer]);
  }

  api[timer] = setTimeout(() => {
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
