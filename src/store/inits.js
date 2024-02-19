import dayjs from 'dayjs';
import { query } from '../hooks/helpers';

const now = dayjs();

const coverCropPlantingDate = now.month() < 6
  ? now.subtract(2, 'year').startOf('month').month(10)
  : now.subtract(1, 'year').startOf('month').month(10);
const coverCropTerminationDate = coverCropPlantingDate.add(6, 'month');
const cashCropPlantingDate = coverCropTerminationDate.add(1, 'week');

// const initSpecies = {
//   Brassica: [
//     'Brassica, Forage',
//     'Mustard',
//     'Radish, Forage',
//     'Radish, Oilseed',
//     'Rape, Oilseed',
//     'Rapeseed, Forage',
//     'Turnip, Forage',
//     'Turnip, Purple Top',
//   ],
//   Broadleaf: [
//     'Phacelia',
//     'Sunflower',
//   ],
//   Grass: [
//     'Barley',
//     'Cereal Rye',
//     'Millet, Foxtail',
//     'Millet, Japanese',
//     'Millet, Pearl',
//     'Oats',
//     'Ryegrass, Annual',
//     'Ryegrass, Perennial',
//     'Sorghum',
//     'Sorghum-sudangrass',
//     'Sudangrass',
//     'Teff',
//     'Triticale',
//     'Wheat',
//   ],
//   Legume: [
//     'Alfalfa, Dormant',
//     'Clover, Alsike',
//     'Clover, Balansa',
//     'Clover, Berseem',
//     'Clover, Crimson',
//     'Clover, Red',
//     'Clover, White',
//     'Cowpea',
//     'Pea',
//     'Sunn Hemp',
//     'Sweetclover, Yellow',
//     'Vetch, Hairy',
//   ],
// };

const initMaxBiomass = {
  'Brassica, Forage': 2000,
  Mustard: 4000,
  'Radish, Forage': 4000,
  'Radish, Oilseed': 3000,
  'Rape, Oilseed': 2000,
  'Rapeseed, Forage': 2500,
  'Turnip, Forage': 3300,
  'Turnip, Purple Top': 3000,
  Buckwheat: 3500,
  Phacelia: 6000,
  Sunflower: 5000,
  Barley: 5000,
  'Cereal Rye': 11200,
  'Millet, Foxtail': 4100,
  'Millet, Japanese': 3500,
  'Millet, Pearl': 8000,
  Oats: 9600,
  'Ryegrass, Annual': 9000,
  'Ryegrass, Perennial': 6000,
  Sorghum: 8000,
  'Sorghum-sudangrass': 8000,
  Sudangrass: 10000,
  Teff: 5000,
  Triticale: 7500,
  Wheat: 9400,
  'Alfalfa, Dormant': 5800,
  'Clover, Alsike': 1200,
  'Clover, Balansa': 3000,
  'Clover, Berseem': 3000,
  'Clover, Crimson': 8200,
  'Clover, Red': 5000,
  'Clover, White': 2000,
  Cowpea: 8500,
  Pea: 5600,
  'Sunn Hemp': 11600,
  'Sweetclover, Yellow': 5000,
  'Vetch, Hairy': 6300,
};

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
  coverCrop: query('covercrop', null),
  cashCrop: null,
  lat: query('lat', 32.8654),
  lon: query('lon', -82.2584),
  InorganicN: 10,
  N: query('N', null),
  carb: query('carb', null),
  cell: query('cell', null),
  lign: query('lign', null),
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
  updateSSURGO: false,
  gotModel: false,
  cornN: [],
  state: '',
  stateAbbreviation: '',
  unit: 'lb/ac',
  location: '',
  nweeks: 4,
  mockup: 2,
  cropNames: [],
  privacy: false,
  errorModel: false,
  errorCorn: false,
  edited: false,
  activeExample: null,
  site: '',
  sites: [],
  data: '',
  dates: [],
  biomassCalcMode: 'satellite', // 'sampled' or 'satellite'
  openFeedbackModal: false,
  openAboutModal: false,
  incorporatedData: [],
  species: null,
  plantGrowthStages: null,
  coverCropSpecieGroup: null,
  coverCropGrowthStage: null,
  maxBiomass: initMaxBiomass,
};

export default initialState;
