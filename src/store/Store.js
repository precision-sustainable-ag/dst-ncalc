/* eslint-disable no-alert */
import { createStore } from './redux-autosetters';
import initialState from './inits';

const afterChange = {
  N: (state, { payload }) => {
    if (!state.edited) {
      state.carb = Math.min(100, Math.max(0, (24.7 + 10.5 * payload))).toFixed(0);
      state.cell = Math.min(100, Math.max(0, (69 - 10.2 * payload))).toFixed(0);
      state.lign = 100 - (+state.carb + +state.cell);
    }
    state.model = null;
  },
  carb: (state) => { state.model = null; state.edited = true; },
  cell: (state) => { state.model = null; state.edited = true; },
  lign: (state) => { state.model = null; state.edited = true; },
  lat: (state) => { state.model = null; },
  lon: (state) => { state.model = null; },
  lwc: (state) => { state.model = null; },
  // coverCropTerminationDate: (state) => { state.model = null; },
  // cashCropPlantingDate: (state) => { state.model = null; },
  // biomass: (state) => { state.model = null; },
  freshBiomass: (state) => { state.model = null; },
  BD: (state) => { state.model = null; },
  OM: (state) => { state.model = null; },
  InorganicN: (state) => { state.model = null; },
}; // afterChange

const reducers = {};

const store = createStore(initialState, { afterChange, reducers });

export const missingData = () => {
  const state = store.getState();
  const {
    lat, lon, coverCropTerminationDate, cashCropPlantingDate, biomass, lwc, N, carb, cell, lign, BD, InorganicN,
  } = state;

  let result = '';

  if (/output|advanced/i.test(window.location)) {
    const test = (parm, val, scr, desc = `Please enter ${parm}`) => {
      if (!val) {
        alert(desc);
        result = scr;
        return true;
      }
      return null;
    }; // test

    if (coverCropTerminationDate - cashCropPlantingDate > 1814400000) {
      alert('Cash crop planting date must be no earlier than 3 weeks before the cover crop kill date.');
      return 'covercrop';
    } if (cashCropPlantingDate - coverCropTerminationDate > 7776000000) {
      alert('Cash crop planting date should be within 3 months of the cover crop kill date.');
      return 'covercrop';
    }
    if (test('lat', lat, 'location', 'Please enter Latitude and Longitude')) return result;
    if (test('lon', lon, 'location', 'Please enter Latitude and Longitude')) return result;

    if (test('coverCropTerminationDate', coverCropTerminationDate, 'covercrop', 'Please enter Cover Crop Termination Date')) return result;
    if (test('biomass', biomass, 'covercrop', 'Please enter Biomass')) return result;
    if (test('lwc', lwc, 'covercrop', 'Please enter Water Content')) return result;

    if (test('N', N, 'covercrop2', 'Please enter Nitrogen')) return result;
    if (test('carb', carb, 'covercrop2', 'Please enter Carbohydrates')) return result;
    if (test('cell', cell, 'covercrop2', 'Please enter Cellulose')) return result;
    if (test('lign', lign, 'covercrop2', 'Please enter Lignin')) return result;

    if (test('cashCropPlantingDate', cashCropPlantingDate, 'cashcrop', 'Please enter Cash Crop Planting Date')) return result;

    if (test('BD', BD, 'soil', 'Please enter Bulk Density')) return result;
    if (test('InorganicN', InorganicN, 'soil', 'Please enter Soil Inorganic N')) return result;
  }
  return null;
}; // missingData

export const api = ({
  url, options = {}, callback, timer = url, delay = 0,
}) => {
  if (timer) {
    clearTimeout(api[timer]);
  }

  api[timer] = setTimeout(() => {
    store.dispatch({
      type: 'api',
      payload: {
        url,
        options,
        callback,
      },
    });
  }, delay);
}; // api

export { set, get } from './redux-autosetters';
export { initialState, store };
