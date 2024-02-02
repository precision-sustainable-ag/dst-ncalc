import dayjs from 'dayjs';
import { query } from '../hooks/helpers';

const now = dayjs();

const coverCropPlantingDate = now.month() < 6
  ? now.subtract(2, 'year').startOf('month').month(10)
  : now.subtract(1, 'year').startOf('month').month(10);
const coverCropTerminationDate = coverCropPlantingDate.add(6, 'month');
const cashCropPlantingDate = coverCropTerminationDate.add(1, 'week');

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
  coverCropPlantingDate: coverCropPlantingDate.format('YYYY-MM-DD'),
  coverCropTerminationDate: coverCropTerminationDate.format('YYYY-MM-DD'),
  cashCropPlantingDate: cashCropPlantingDate.format('YYYY-MM-DD'),
  biomassTaskResults: null,
  biomassTotalValue: null,
  maxZoom: 20,
  model: {},
  OM: 3,
  BD: 1.30,
  yield: 150,
  residue: 'surface',
  NContent: '',
  residueC: '30',
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
  // selectedCoverCropSpecies: [],
  maxBiomass: {},
  privacy: false,
  errorModel: false,
  errorCorn: false,
  edited: false,
  activeExample: null,
  site: '',
  sites: [],
  data: '',
  biomassCalcMode: 'sampled', // 'sampled' or 'satellite'
  openFeedbackModal: false,
  openAboutModal: false,
  incorporatedData: [],
};

export default initialState;
