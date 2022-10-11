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
  },
  carb: (state) => {state.edited = true;},
  cell: (state) => {state.edited = true;},
  lign: (state) => {state.edited = true;},
  lat: (state) => {getSSURGO(state)},
  lon: (state) => {getSSURGO(state)},
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

const getSSURGO = (state) => {
  const {lat, lon} = state;

  api(
    `https://api.precisionsustainableag.org/ssurgo?lat=${lat}&lon=${lon}&component=major`,
    (data) => {
      if (data.ERROR) {
        console.log(`No SSURGO data at ${lat}, ${lon}`);
        store.dispatch(set.BD(''));
        store.dispatch(set.OM(''));
        store.dispatch(set.gotSSURGO(false));
      } else {
        data = data.filter(d => d.desgnmaster !== 'O');
        const minhzdept = Math.min.apply(Math, data.map(d => d.hzdept_r));
        data = data.filter(d => +d.hzdept_r === +minhzdept);

        store.dispatch(set.BD(weightedAverage(data, 'dbthirdbar_r')));
        store.dispatch(set.OM(weightedAverage(data, 'om_r')));
        store.dispatch(set.gotSSURGO(true));
      }
    },
    'ssurgo',
    1000
  );
} // getSSURGO

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
