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
  maxZoom             : 20,
  model               : {},
  OM                  : 3,
  BD                  : 1.3,
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
  soilfiles: {},

  // hidden: true,
  // label: '...',
  // unit: '...',
  // description: <>...</>
  Biology: {
    es: {
      value: 0.06,
      unit: <>fraction</>,
      description: <>Relative effect of moisture when the soil is saturated</>
    },
    tb: {
      value: 25,
      unit: <>C</>,
      description: <>Base temperature at which eT =1</>
    },
    dthh: {
      value: 0.1,
      unit: <>cm<sup>3</sup>/cm<sup>3</sup></>,
      description: <>The highest volumetric water content for which the process is optimal</>,
    },
    dthl: {
      value: 0.08,
      unit: <>cm<sup>3</sup>/cm<sup>3</sup></>,
      description: <>The lowest volumetric water content for which the process is optimal</>,
    },
    th_m: {
      value: 1,
      description: <>Exponent in dependencies of e(theta) on theta (water content)</>
    },
    qt: {
      value: 3,
      description: <>Factor change in rate with a 10&deg; C change in temperature</>,
    },
    dthd: {
      value: 0.1,
      unit: <>cm<sup>3</sup>/cm<sup>3</sup></>,
      description: <>Threshold water content below which no denitrification occurs</>,
    },
    th_d: {
      value: 2,
      description: <>Exponent in dependencies of e(d) on theta (water content)</>
    },
  },
  Climate: {
    dailybulb: {
      value: 'Daily',
      options: ['Daily', 'Hourly'],
      description: <>Switch to indicate if daily or hourly wet bulb temperatures are available.</>
    },
    dailywind: {
      value: 1,
    },
    rainintensity: {
      value: 0,
    },
    dailyconc: {
      value: 0,
    },
    furrow: {
      value: 0,
    },
    relhumid: {
      value: 1,
    },
    dailyco2: {
      value: 0,
    },
    bsolar: {
      value: 1000000,
    },
    btemp: {
      value: 1,
    },
    atemp: {
      value: 0,
    },
    erain: {
      value: 0.1,
    },
    bwind: {
      value: 1,
    },
    bir: {
      value: 1,
    },
    avgwind: {
      value: 10,
    },
    avgrainrate: {
      value: 3,
    },
    chemconc: {
      value: 0,
    },
    rh: {
      value: 83,
    },
    avgco2: {
      value: 420,
    },
    altitude: {
      value: 1048,
    },
  },
  Fertilization: {
    amount: {
      value: 112,
    },
    depth: {
      value: 5,
    },
    'litter_c(kg/ha)': {
      label: 'litter_c',
      value: 0,
      unit: 'kg/ha',
    },
    litter_n: {
      value: 0,
    },
    manure_c: {
      value: 0,
    },
    manure_n: {
      value: 0,
    },
  },
  GridRatio: {
    sr1: {
      label: <>Surface nodes  spacing ratio</>,
      value: 1.001,
      description: <>Determines how spacing changes with increasing depth. The closer to 1 this number (but must be always &gt;1) the more uniform the node spacing</>
    },
    ir1: {
      label: <>Interior nodes spacing ratio</>,
      value: 1,
    },
    sr2: {
      label: <>Surface nodes  mininimum distance</>,
      value: 1.001,
      description: <>initial distance between vertical nodes from the surface to the first layer</>
    },
    ir2: {
      label: <>Interior nodes minimum distance</>,
      value: 3,
      description: <>initial distance between vertical nodes at a boundary</>
    },
    plantingdepth: {
      label: <>depth of seed</>,
      value: 5,
      unit: 'cm'
    },
    xlimitroot: {
      label: <>maximum initial rooting depth at emergence (for potato)</>,
      value: 23,
      unit: 'cm'
    },
    bottombc: {
      label: <>Bottom Boundary condition</>,
      value: '1 constant',
      options: ['1 constant', '-2 seepage face', '-7 unit hydraulic gradient drainage']
    },
    gasbctop: {
      value: -4,
    },
    gasbcbottom: {
      value: 1,
    },
    initrtmass: {
      value: 0,
    },
  },
  Irrigation: { // Irrig
    date: {
      value: undefined
    },
    amount: {
      value: undefined
    },
  },
  Soil: {
    bottom_depth: {
      label: <>Bottom Depth</>,
      value: 10,
      unit: <></>
    },
    om_pct: {
      label: <>Organic Matter</>,
      value: 0.004,
      unit: <>fraction</>
    },
    no3: {
      label: <>Nitrate</>,
      value: 5,
      unit: <>ug/cm3 (ppm)</>
    },
    nh4: {
      label: <>Ammonia</>,
      value: 1,
      unit: <>ug/cm3 (ppm)</>
    },
    hnnew: {
      label: <>Soil Metric Potential</>,
      value: -100,
      unit: <></>
    },
    tmpr: {
      label: <>Soil temperature</>,
      value: 23,
      unit: <>C</>
    },
    sand: {
      label: <>Sand Fraction</>,
      value: 55,
      unit: <>%</>
    },
    silt: {
      label: <>Silt Fraction</>,
      value: 35,
      unit: <>%</>
    },
    clay: {
      label: <>Clay Fraction</>,
      value: 10,
      unit: <>%</>
    },
    bd: {
      label: <>Bulk Density of Soil in Horizon</>,
      value: 1.3,
      unit: <>g/c<sup>3</sup></>
    },
    th33: {
      label: <>Soil Water Content at Capillary Pressure of 330 cm</>,
      value: 0.34,
      unit: <>cm<sup>3</sup>/cm<sup>3</sup></>
    },
    th1500: {
      label: <>Soil Water Content at Capillary Pressure of 1500 cm</>,
      value: 0.05,
      unit: <>cm<sup>3</sup>/cm<sup>3</sup></>
    },
    thr: {
      label: <>Residual Soil Water Content</>,
      value: 0.02,
      unit: <>cm<sup>3</sup>/cm<sup>3</sup></>
    },
    ths: {
      label: <>Saturated Soil Water Content</>,
      value: 0.39,
      unit: <>cm<sup>3</sup>/cm<sup>3</sup></>
    },
    tha: {
      label: <>Residual Soil Water content</>,
      value: 0.02,
      unit: <>cm<sup>3</sup>/cm<sup>3</sup></>
    },
    th: {
      label: <>Saturated Volumetric Soil Water Content</>,
      value: 0.39,
      unit: <>cm<sup>3</sup>/cm<sup>3</sup></>
    },
    alfa: {
      label: <>slope in van Genuchten's equation</>,
      value: 0.003,
      unit: <></>
    },
    n: {
      label: <>Measure of the Pore-Size Distribution</>,
      value: 1.2,
      unit: <></>
    },
    ks: {
      label: <>Saturated Hydraulic Conductivity</>,
      value: 12,
      unit: <>cm/day</>
    },
    kk: {
      label: <>Saturated Hydraulic Conductivity for alternanative version of van Genuchten's equation that allows for representing saturated hydrualic conductivity when the soil is near saturation</>,
      value: 12,
      unit: <>cm/day</>
    },
    thk: {
      label: <>Near saturated volumetric water content where Kk is used</>,
      value: 0.39,
      unit: <>cm<sup>3</sup>/cm<sup>3</sup></>
    },
    kh: {
      label: <>Potential mineralization rate fro the stable humus pool, day<sup>-1</sup></>,
      value: 0.00007,
      unit: <>day<sup>-1</sup></>
    },
    kL: {
      label: <>Potential plant residue decomposition rate, day<sup>-1</sup></>,
      value: 0.035,
      unit: <>day<sup>-1</sup></>
    },
    km: {
      label: <>Potential rate of the organic fertilizer decomposition, day<sup>-1</sup></>,
      value: 0.07,
      unit: <>day<sup>-1</sup></>
    },
    kn: {
      label: <>Potential rate of nitrification, day<sup>-1</sup></>,
      value: 0.02,
      unit: <>day<sup>-1</sup></>
    },
    kd: {
      label: <>Potential rate of denitrification, mg L<sup>-1</sup> day<sup>-1</sup></>,
      value: 0.00001,
      unit: <>day<sup>-1</sup></>
    },
    fe: {
      label: <>Microbial synthesis efficiency</>,
      value: 0.6,
      unit: <></>
    },
    fh: {
      label: <>Humification fraction</>,
      value: 0.2,
      unit: <></>
    },
    r0: {
      label: <>C/N ratio of the decomposer biomass and humification products</>,
      value: 10,
      unit: <></>
    },
    rl: {
      label: <>C/N ratio of plant residues</>,
      value: 50,
      unit: <></>
    },
    rm: {
      label: <>C/N ratio of the organic fertilizer</>,
      value: 10,
      unit: <></>
    },
    fa: {
      label: <>Fraction of the mineral nitrogen available for immobilization</>,
      value: 0.1,
      unit: <></>
    },
    nq: {
      label: <>Ratio of the mineral nitrate amount to the mineral ammonium amount characteristic to the particular soil material</>,
      value: 8,
      unit: <></>
    },
    cs: {
      label: <>Michaelis-Menten constant of denitrification, mg L<sup>-1</sup></>,
      value: 0.00001,
      unit: <>mg L<sup>-1</sup></>
    },

  }
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
    lat: (state)            => {state.gotModel = false;},
    lon: (state)            => {state.gotModel = false;},
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

    const url = `https://api.precisionsustainableag.org/cc-ncalc/surface?lat=${lat}&lon=${lon}&start=${start}&end=${end}&n=${N}&biomass=${biomass}&lwc=${lwc}&carb=${carb}&cell=${cell}&lign=${lign}&om=${OM}&bd=${BD}&in=${InorganicN}&pmn=${pmn}`;

    api({
      url,
      callback: (data) => {
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
      timer: 'model',
      delay: 2000
    });
  }
} // fetchModel

const fetchSSURGOWater = (state) => {
  const {lat, lon} = state;

  state.gotSSURGO = false;

  const url = `https://ssurgo.covercrop-data.org/?lat=${lat}&lon=${lon}&component=major`;

  api({
    url,
    callback: (data) => {
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
    timer: 'ssurgo',
    delay: 2000
  });
} // fetchSSURGOWater

const fetchSSURGO = (state) => {
  const {lat, lon} = state;

  state.gotSSURGO = false;

  const url = `https://api.precisionsustainableag.org/ssurgo?lat=${lat}&lon=${lon}&component=major`;

  api({
    url,
    callback: (data) => {
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
    timer: 'ssurgo',
    delay: 2000
  });
} // fetchSSURGO

const fetchCornN = (state) => {
  const {lat, lon, plantingDate} = state;
  
  const end = moment(state.plantingDate).add(110, 'days').add(1, 'hour').format('yyyy-MM-DD');
  
  store.dispatch(set.cornN(false));
  store.dispatch(set.errorCorn(false));

  const url = `https://api.precisionsustainableag.org/weather/hourly?lat=${lat}&lon=${lon}&start=${moment(plantingDate).format('yyyy-MM-DD')}&end=${end}&attributes=air_temperature&options=predicted`;
  
  api({
    url,
    callback: (data) => {
      if (data instanceof Array) {
        console.log('CornN:');
        console.log(data);

        store.dispatch(set.cornN(data));
      } else {
        console.log('CornN error:');
        console.log(url);
        console.log(data);
        store.dispatch(set.errorCorn(true));
      }
    }
  });
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

export const rosetta = (soildata) => {
  const rosettaData = soildata.map(row => {
    row = [...row];
    row.splice(0, 1);  // remove Matnum
    row.splice(4, 1);  // remove om
    row.splice(6, 1);  // remove 'w'
    row[0] *= 100;     // sand
    row[1] *= 100;     // silt
    row[2] *= 100;     // clay
    delete row.org;
    return row;
  });

  api({
    // url: 'https://www.handbook60.org/api/v1/rosetta/1', // doesn't support CORS
    url: 'http://localhost:80/rosetta',
    options: {
      method: 'post',
      soildata: rosettaData,
    },
    callback: (data) => {
      let s = '           *** Material information ****                                                                   g/g  \r\n';
      s += '   thr       ths         tha       thm     Alfa      n        Ks         Kk       thk       BulkD     OM    Sand    Silt    InitType\r\n';

      data.van_genuchten_params.forEach((d, i) => {
        let [theta_r, theta_s, alpha, npar, ksat] = d;

        alpha = 10 ** alpha;
        npar  = 10 ** npar;
        ksat  = 10 ** ksat;

        // eslint-disable-next-line no-unused-vars
        const [Matnum, sand, silt, clay, bd, om, TH33, TH1500, inittype] = soildata[i];

        let theta_m = theta_s;
        let theta_k = theta_s;
        let kk = ksat;

        if (npar > 1 && npar < 2) {
          theta_k -= 0.004;
          kk = ksat - (0.10 * ksat);
          theta_s -= 0.002;
        }

        // if (rosoutput.vgnpar < 2.0 && rosoutput.vgnpar > 1 && count === 1) {
				// 	vgthm = rosoutput.vgths;
				// 	vgths = rosoutput.vgths - 0.002;
				// 	vgthk = rosoutput.vgths - 0.004;
				// 	vgkk = rosoutput.ks  - (0.10 * rosoutput.ks);
				// }        

        // Heading    JS var    C++ var
        // ________   _______   ____________________
        // thr        theta_r   rosoutput.vgthr
        // ths        theta_s   vgths
        // tha        theta_r   rosoutput.vgthr
        // thm        theta_m   vgthm
        // Alfa       alpha     rosoutput.vgalp
        // n          npar      rosoutput.vgnpar
        // Ks         ksat      rosoutput.ks
        // Kk         kk        vgkk
        // thk        theta_k   vgthk 
        // BulkD      bd        rosinput.bd
        // OM         om        OM
        // Sand       sand      rosinput.sand/100.0
        // Silt       silt      rosinput.silt/100.0
        // InitType   inittype  InitType

        s += `    ${theta_r.toFixed(3)}    ${theta_s.toFixed(3)}    ${theta_r.toFixed(3)}    ${theta_m.toFixed(3)}    ${alpha.toFixed(5)}    ${npar.toFixed(5)}    ${ksat.toFixed(3)}    ${kk.toFixed(3)}    ${theta_k.toFixed(3)}    ${bd.toFixed(2)} ${om.toFixed(5)}    ${sand.toFixed(2)}    ${silt.toFixed(2)}   ${inittype}\r\n`;
      });

      const state = store.getState();
      store.dispatch(set.soilfiles({...state.soilfiles, 'meadir_run_01.soi': s}));
      console.log('ok');
    }
  });
} // rosetta

const reducers = {
  updateLocation: (state, {payload}) => {
    state = {...state, ...payload};
    fetchSSURGO(state);
    return state;
  }
};

const dst = /water/i.test(window.location) ? 'water' : 'ncalc';

export const store = createStore(initialState, {afterChange: ac[dst], reducers});

export const api = ({url, options={}, callback, timer=url, delay=0}) => {
  if (timer) {
    clearTimeout(api[timer]);
  }

  api[timer] = setTimeout(() => {
    console.log(url);
    store.dispatch({
      type: 'api',
      payload: {
        url,
        options,
        callback
      }
    });
  }, delay);
} // api

export {set, get} from './redux-autosetters';
