import {createStore} from './redux-autosetters';
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
  N                   : query('N', ''),
  InorganicN          : 10,
  carb                : query('carb', ''),
  cell                : query('cell', ''),
  lign                : query('lign', ''),
  lwc                 : 4,
  highOM              : 'No',
  nutrient            : 'Left on the surface',
  freshBiomass        : '',
  biomass             : query('biomass', ''),
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
  unit                : 'lb/ac',
  location            : '',
  nweeks              : 4,
  firstSSURGO         : true,
  mockup              : 2,
  species             : {},
  maxBiomass          : {},
  privacy             : false,
  errorModel          : false,
  errorSSURGO         : false,
  errorCorn           : false,
  edited              : query('carb', false),
};

const afterChange = {
};

const reducers = {
}

export const store = createStore(initialState, {afterChange, reducers});

export {set as sets, get} from './redux-autosetters';
