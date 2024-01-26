import dayjs from 'dayjs';
import { query } from '../hooks/helpers';

const now = dayjs();

const initialState = {
  focus: '',
  name: '',
  email: '',
  feedback: '',
  screen: '',
  mapAddress: '',
  PSA: window.location.toString().includes('PSA'),
  field: query('field', ''),
  targetN: '150',
  coverCrop: query('covercrop', []),
  cashCrop: '',
  lat: query('lat', 32.8654),
  lon: query('lon', -82.2584),
  InorganicN: 10,
  N: query('N', ''),
  carb: query('carb', ''),
  cell: query('cell', ''),
  lign: query('lign', ''),
  freshBiomass: '',
  biomass: query('biomass', ''),
  lwc: (state) => Math.max((+((state.freshBiomass - state.biomass) / state.biomass).toFixed(2)), 0) || 4,
  mapZoom: 13,
  mapType: 'hybrid',
  mapPolygon: [],
  biomassCropType: 'Wheat',
  coverCropPlantingDate: now.subtract(1, 'year').startOf('month').month(9).format('YYYY-MM-DD'),
  coverCropTerminationDate: now.startOf('month').month(4).format('YYYY-MM-DD'),
  cashCropPlantingDate: now.startOf('month').month(4).add(1, 'week').format('YYYY-MM-DD'),
  biomassTaskResults: null,
  biomassTotalValue: null,
  maxZoom: 20,
  model: {},
  OM: 3,
  BD: 1.30,
  yield: 150,
  residue: 'surface',
  NContent: '',
  residueC: '',
  outputN: 1,
  SSURGO: null,
  gotModel: false,
  cornN: [],
  state: '',
  stateAbbreviation: '',
  unit: 'lb/ac',
  location: '',
  nweeks: 4,
  mockup: 2,
  species: {},
  maxBiomass: {},
  privacy: false,
  errorModel: false,
  errorCorn: false,
  edited: false,
  site: '',
  sites: [],
  data: '',
  biomassCalcMode: 'satellite', // 'sampled' or 'satellite'
  openFeedbackModal: false,
  openAboutModal: false,
};

export default initialState;
