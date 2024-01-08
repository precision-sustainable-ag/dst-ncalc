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
  killDate: query('date1', ''),
  cashCrop: '',
  plantingDate: query('date2', ''),
  lat: query('lat', 40.7849),
  lon: query('lon', -74.8073),
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
  biomassPlantDate: now.subtract(1, 'year').startOf('month').month(9).format('YYYY-MM-DD'),
  biomassTerminationDate: now.startOf('month').month(5).format('YYYY-MM-DD'),
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
  SSURGO: {},
  gotSSURGO: true,
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
  biomassCalcMode: 'sampled', // 'sampled' or 'satellite'
  openFeedbackModal: false,
  openAboutModal: false,
};

export default initialState;