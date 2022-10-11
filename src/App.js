import {useEffect} from 'react';
import './App.css';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import {useSelector, useDispatch} from 'react-redux';

// Screens
import Home       from './components/Home';
import About      from './components/About';
import Location   from './components/Location';
import Soil       from './components/Soil';
import {CoverCrop1, CoverCrop2} from './components/CoverCrop';
import CashCrop   from './components/CashCrop';
import Output     from './components/Output';
import Feedback   from './components/Feedback';
import Advanced   from './components/Advanced';
import {Button}   from '@mui/material';

import {get, set} from './store/Store';

const Airtable = require('airtable');

const holdError = console.error;
console.error = (msg, ...subst) => {
  if (!/StrictMode|Deprecation/.test(msg)) {
    holdError(msg, ...subst);
  }
}

const holdWarn = console.warn;
console.warn = (msg, ...subst) => {
  if (!/StrictMode|Deprecation/.test(msg)) {
    holdWarn(msg, ...subst);
  }
}

const Help = () => {
  const help  = useSelector(get.help);
  const helpX = useSelector(get.helpX);
  const helpY = useSelector(get.helpY);

  const style = {
    left: helpX,
    top: helpY,
    maxWidth:  `calc(100vw - ${helpX}px - 20px)`,
    maxHeight: `calc(100vh - ${helpY}px - 20px)`,
    overflow: 'auto'
  }

  return (
    help &&
    <div
      className="help"
      style={style}
      dangerouslySetInnerHTML={{ __html: help }}
    />
  )
}

const Screens = ({parms, props, set}) => {
  const screen = useSelector(get.screen);
  const dispatch = useDispatch();

  const BD = useSelector(get.BD);
  const killDate = useSelector(get.killDate);
  const plantingDate = useSelector(get.plantingDate);
  const field = useSelector(get.field);

  const screens = {
    Home,
    About,
    Location,
    Soil,
    CoverCrop1,
    CoverCrop2,
    CashCrop,
    Output,
    Feedback,
    Advanced,
  };

  const setScreen = (scr) => {
    const test = (parm, scr, desc = `Please enter ${parm}`) => {
      return false;
      // const val = useSelector(get[parm]);
      // 
      // if (!val) {
      //   alert(desc);
      //   setScreen(scr);
      //   return true;
      // }
    } // test

    if (/Output|Advanced/.test(scr)) {
      if (demo && !BD) {
        dispatch(set.OM(1.5));
        dispatch(set.BD(1.6));
      }

      if (killDate - plantingDate > 1814400000) {
        alert('Cash crop planting date must be no earlier than 3 weeks before the cover crop kill date.');
        dispatch(set.screen('CoverCrop1'));
      } else if (plantingDate - killDate > 7776000000) {
        alert('Cash crop planting date should be within 3 months of the cover crop kill date.');
        dispatch(set.screen('CoverCrop1'));
      } else {
        test('lat', 'Location', 'Please enter Latitude and Longitude') ||
        test('lon', 'Location', 'Please enter Latitude and Longitude') ||

        test('killDate', 'CoverCrop1', 'Please enter Cover Crop Termination Date') ||
        test('biomass', 'CoverCrop1', 'Please enter Biomass') ||
        test('lwc', 'CoverCrop1', 'Please enter Water Content') ||

        test('N', 'CoverCrop2', 'Please enter Nitrogen') ||
        test('carb', 'CoverCrop2', 'Please enter Carbohydrates') ||
        test('cell', 'CoverCrop2', 'Please enter Cellulose') ||
        test('lign', 'CoverCrop2', 'Please enter Lignin') ||

        test('plantingDate', 'CashCrop', 'Please enter Cash Crop Planting Date') ||

        test('BD', 'Soil', 'Please enter Bulk Density') ||
        test('InorganicN', 'Soil', 'Please enter Soil Inorganic N') ||

        dispatch(set.screen(scr));
      }
    } else {
      dispatch(set.screen(scr));

      // AutoComplete component doesn't understand autoFocus:
      let focus = scr === 'CoverCrop1' ? '#coverCrop' :
                  scr === 'CashCrop'   ? '#cashCrop'  :
                  scr === 'Feedback'   ? '#Feedback'  :
                                         null;
        
      if (focus) {
        setTimeout(() => document.querySelector(focus).focus(), 10);
      }
    }
  } // setScreen

  const loadField = (field) => {
    if (field === 'Example: Grass') {
      dispatch(set.screen('Location'));
      dispatch(set.edited(true));
      dispatch(set.lat(32.865389));
      dispatch(set.lon(-82.258361));
      dispatch(set.location('Example'));
      dispatch(set.field('Example: Grass'));
      dispatch(set.OM(0.75));
      dispatch(set.BD(1.62));
      dispatch(set.InorganicN(10));
      dispatch(set.coverCrop(['Rye']));
      dispatch(set.killDate(new Date('03/21/2019')));
      dispatch(set.plantingDate(new Date('04/01/2019')));
      dispatch(set.biomass(5000));
      dispatch(set.lwc(1.486));
      dispatch(set.N(0.6));
      dispatch(set.carb(33.45));
      dispatch(set.cell(57.81));
      dispatch(set.lign(8.74));
      dispatch(set.cashCrop('Corn'));
      dispatch(set.yield(150));
      dispatch(set.targetN(150));
    } else if (field === 'Example: Legume') {
      dispatch(set.screen('Location'));
      dispatch(set.edited(true));
      dispatch(set.lat(32.865389));
      dispatch(set.lon(-82.258361));
      dispatch(set.location('Example'));
      dispatch(set.field('Example: Legume'));
      dispatch(set.OM(0.75));
      dispatch(set.BD(1.62));
      dispatch(set.InorganicN(10));
      dispatch(set.coverCrop(['Clover, Crimson']));
      dispatch(set.killDate(new Date('04/27/2019')));
      dispatch(set.plantingDate(new Date('05/15/2019')));
      dispatch(set.biomass(3500));
      dispatch(set.lwc(7.4));
      dispatch(set.N(3.5));
      dispatch(set.carb(56.18));
      dispatch(set.cell(36.74));
      dispatch(set.lign(7.08));
      dispatch(set.cashCrop('Corn'));
      dispatch(set.yield(150));
      dispatch(set.targetN(100));
    } else {
      const inputs = JSON.parse(localStorage[field]);
      Object.keys(inputs).forEach(key => {
        try {
          if (/Date/.test(key)) {
            set[key](new Date(inputs[key]));
          } else {
            set[key](inputs[key]);
          }
        } catch(e) {
          console.log(key, e.message);
        }
      });
    }
  } // loadField

  const changeScreen = (e) => {
    const button = e.target;

    if (button.tagName === 'BUTTON') {
      dispatch(set.screen(button.dataset.scr));
    }
  } // changeScreen

  const changeField=(e) => {
    const field = e.target.value;
    if (field === 'Clear previous runs') {
      if (window.confirm('Clear all previous runs?')) {
        localStorage.clear();
        dispatch(set.screen('Home'));
      }
    } else {
      loadField(field);
    }
  } // changeField

  const changePSA=(e) => {
    const PSA = examples[e.target.value];
    
    Object.keys(PSA).forEach(key => {
      try {
        set[key](PSA[key]);
      } catch(ee) {

      }
    });
    // window.location = `?PSA=true&demo=${e.target.value}`;
  } // changePSA

  return (
    <div>
      <nav onClick={changeScreen}>
        <Button className="feedback" data-scr="Feedback" variant="outlined" color="primary" >Feedback</Button>
        {
          isPSA ? 
            <select id="Fields"
              onChange={changePSA}
              value={field}
            >
              <option></option>
              <optgroup label="PSA">
                {
                  Object.keys(examples)
                    .filter(site => examples[site].category === 'PSA')
                    .sort().map(site => <option key={site}>{site}</option>)
                }
              </optgroup>
              <optgroup label="Resham">
                {
                  Object.keys(examples)
                    .filter(site => examples[site].category === 'Resham')
                    .sort().map(site => <option key={site}>{site}</option>)
                }
              </optgroup>
            </select>
          :
          true || Object.keys(localStorage).length ?
            <select id="Fields"
              onChange={changeField}
              value={field}
            >
              <option></option>
              <option>Example: Grass</option>
              <option>Example: Legume</option>
              {
                Object.keys(localStorage).length && (
                  <>
                    <option>Clear previous runs</option>
                    <option disabled>____________________</option>
                  </>
                )
              }
              {
                Object.keys(localStorage).sort().map((fld, idx) => (
                  <option key={idx} checked={fld === field}>{fld}</option>
                ))
              }
            </select>
            : ''
        }
      </nav>
      
      {screens[screen]({
        props,
        set,
        parms,
      })}
    </div>
  );
} // Screens

const App = () => {
  const dispatch = useDispatch();

  const BD = useSelector(get.BD);
  const OM = useSelector(get.OM);
  const N = useSelector(get.N);
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const killDate = useSelector(get.killDate);
  const plantingDate = useSelector(get.plantingDate);
  const Carb = useSelector(get.carb);
  const Cell = useSelector(get.cell);
  const Lign = useSelector(get.lign);
  const Lwc = useSelector(get.lwc);
  const Biomass = useSelector(get.biomass);
  const unit = useSelector(get.unit);
  const InorganicN = useSelector(get.InorganicN);

  // const { data, error, isLoading } = useGetPokemonByNameQuery('bulbasaur');
  // console.log(data);
  // console.log(error);
  // console.log(isLoading);
  
  useEffect(() => {
    const airtable = (table, callback, wrapup) => {
      base(table).select({
        view: 'Grid view'
      }).eachPage((records, fetchNextPage) => {
        records.forEach(record => {
          callback(record.fields);
        });
    
        fetchNextPage();
      }, function done(err) {
        if (err) {
          console.error(err);
        } else if (wrapup) {
          wrapup();
        }
      });
    } // airtable

    const base = new Airtable({apiKey: 'keySO0dHQzGVaSZp2'}).base('appOEj4Ag9MgTTrMg');

    airtable('PSA', (site) => {
      localStorage.removeItem(site.ID);
      if (site.Hour === 0) {
        examples[site.ID] = {
          field             : site.ID,
          lat               : site.Lat,
          lon               : site.Lon,
          location          : '',
          BD                : site.BD,
          coverCrop         : [site['Cover Crop']],
          cashCrop          : site['Cash Crop'],
          killDate          : new Date(site.Date),
          lwc               : site.LitterWaterContent,
          biomass           : Math.round(site.FOM),
          unit              : 'kg/ha',
          N                 : +(site.FOMpctN.toFixed(2)),
          carb              : +(site.Carb.toFixed(2)),
          cell              : +(site.Cell.toFixed(2)),
          lign              : +(site.Lign.toFixed(2)),
          targetN           : 150,
          category          : site.Category,
        } 
      } else {
        examples[site.ID].plantingDate = new Date(moment(site.Date).add(-111, 'days'));
      }
    });

    const mb = {};
    const species = {};

    airtable(
      'CoverCrops',
      (crop) => {
        species[crop.Category] = species[crop.Category] || [];
        species[crop.Category].push(crop.Crop);
        mb[crop.Crop] = crop.MaxBiomass;
      },
      () => {
        dispatch(set.maxBiomass(mb));
        dispatch(set.species(species));
      }
    );
  }, [dispatch]);

  const runModel = () => {
    clearTimeout(modelTimer);
    modelTimer = setTimeout(runModel2, 300);
  } // runModel

  const runModel2 = () => {
    const start = moment(killDate).format('yyyy-MM-DD');
    const end   = moment(plantingDate).add(110, 'days').add(1, 'hour').format('yyyy-MM-DD');
    const lwc = Lwc || 10;
    let carb = Carb || (24.7 + 10.5 * N);
    let cell = Cell || (69 - 10.2 * N);
    let lign = Lign || (100 - (carb + cell));

    const total = +carb + +cell + +lign;
    carb = carb * 100 / total;
    cell = cell * 100 / total;
    lign = lign * 100 / total;
    const factor = unit === 'lb/ac' ? 1.12085 : 1;
    const biomass = Biomass * factor;
    const om = OM;
    const bd = BD;
    const In = InorganicN || 10;
    const pmn = 10;

    // const modelSrc  = `https://weather.aesl.ces.uga.edu/cc-ncalc/both?lat=${lat}&lon=${lon}&start=${start}&end=${end}&n=${N}&biomass=${biomass}&lwc=${lwc}&carb=${carb}&cell=${cell}&lign=${lign}&om=${om}&bd=${bd}&in=${In}&pmn=${pmn}`;
    const modelSrc = params.get('dev') ? `https://weather.aesl.ces.uga.edu/cc-ncalc/surface?lat=${lat}&lon=${lon}&start=${start}&end=${end}&n=${N}&biomass=${biomass}&lwc=${lwc}&carb=${carb}&cell=${cell}&lign=${lign}&om=${om}&bd=${bd}&in=${In}&pmn=${pmn}` :
                                         `https://api.precisionsustainableag.org/cc-ncalc/surface?lat=${lat}&lon=${lon}&start=${start}&end=${end}&n=${N}&biomass=${biomass}&lwc=${lwc}&carb=${carb}&cell=${cell}&lign=${lign}&om=${om}&bd=${bd}&in=${In}&pmn=${pmn}`

    const cornNSrc =  params.get('dev') ? `https://weather.aesl.ces.uga.edu/weather/hourly?lat=${lat}&lon=${lon}&start=${moment(plantingDate).format('yyyy-MM-DD')}&end=${end}&attributes=air_temperature` :
                                          `https://api.precisionsustainableag.org/weather/hourly?lat=${lat}&lon=${lon}&start=${moment(plantingDate).format('yyyy-MM-DD')}&end=${end}&attributes=air_temperature`;
    
    dispatch(set.gotModel(false));
    dispatch(set.errorModel(false));

    dispatch(set.cornN(false));
    dispatch(set.errorCorn(false));

    if (start !== 'Invalid date' && end !== 'Invalid date' && end > start) {
      console.log(modelSrc);
      fetch(modelSrc)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          if (data.name === 'error' || !data.surface) {
            dispatch(set.errorModel(true));
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
          /*
          data.incorporated.forEach(data => {
            Object.keys(data).forEach(key => {
              modelIncorporated[key] = modelIncorporated[key] || [];
              modelIncorporated[key].push(data[key]);
            });
          });
          */
        
          const model = {
            s: modelSurface,
            i: modelIncorporated
          }
        
          const cols = Object.keys(model.s).sort((a, b) => a.toUpperCase().localeCompare(b.toUpperCase()));

          cols.filter(col => !model.s[col].length).forEach(col => {
            model.s[col] = new Array(model.s.Rain.length).fill(model.s[col]);
          });
        
          dispatch(set.model(model));
          dispatch(set.gotModel(true));
          console.log('model');
          console.log(data);
        })
        .catch((error) => {
          alert(JSON.stringify(error));
        });
    }

    fetch(cornNSrc)
      .then(response => response.json())
      .then(data => {
        if (data instanceof Array) {
          console.log('CornN:');
          console.log(data);

          dispatch(set.cornN(data));
        } else {
          dispatch(set.errorCorn(true));
        }
      })
      .catch((error) => {
        alert(JSON.stringify(error));
      });
  } // runModel2

  const query = (parm, def) => {
    if (parm === 'covercrop' && params.get('covercrop')) {
      return params.get(parm).split(',');
    } else if (/date/.test(parm) && params.get(parm)) {
      return moment(params.get(parm));
    } else {
      return params.get(parm) || def;
    }
  } // query
/*
  effects : {
    lat           : runModel,
    lon           : runModel,
    plantingDate  : runModel,
    killDate      : runModel,
    N             : runModel,
    carb          : runModel,
    cell          : runModel,
    lign          : runModel,
    lwc           : runModel,
    // BD            : runModel,  // TODO
    // OM            : runModel,  // TODO
    // InorganicN    : runModel,  // TODO
    biomass       : runModel,
    freshBiomass  : runModel,
  }
*/

const changeScreen = (e) => {
  const button = e.target;

  if (button.tagName === 'BUTTON') {
    dispatch(set.screen(button.dataset.scr));
  }
} // changeScreen

const screen = useSelector(get.screen);

const sc = {
  'Home'        : <Home />,
  'About'       : <About />,
  'Location'    : <Location />,
  'Soil'        : <Soil />,
  'CoverCrop1'  : <CoverCrop1 />,
  'CoverCrop2'  : <CoverCrop2 />,
  'CashCrop'    : <CashCrop />,
  'Output'      : <Output />,
  'Advanced'    : <Advanced />,
  'Feedback'    : <Feedback />,
}[screen] || console.log(screen);

return (
  <div
    tabIndex="0"

    onKeyDown={(e) => {
      if (e.key === 'Escape') {
        dispatch(set.help(''));
        dispatch(set.privacy(false));
      }
    }}

    onClick={(e) => {
      if (/^help/.test(e.target.innerHTML)) {
        dispatch(set.help(e.target.innerHTML.slice(4)));
        dispatch(set.helpX(Math.min(e.pageX + 20, window.innerWidth - 400)));
        dispatch(set.helpY(e.pageY - 20));
      } else {
        dispatch(set.help(''));
      }
    }}

    id="Main"
  >
    <img alt="logo" src="PSALogo.png" id="PSALogo" />
    <nav onClick={changeScreen}>
      <button className={/Home|About/.test(screen)  ? 'selected' : undefined} data-scr="Home"       >Home</button>
      <button className={/Location/.test(screen)    ? 'selected' : undefined} data-scr="Location"   >Location</button>
      <button className={/Soil/.test(screen)        ? 'selected' : undefined} data-scr="Soil"       >Soil</button>
      <button className={/CoverCrop/.test(screen)   ? 'selected' : undefined} data-scr="CoverCrop1" >Cover Crop</button>
      {/*  <button id="CCQuality" data-scr="CoverCrop2">Quality</button> */}
      <button className={/CashCrop/.test(screen)    ? 'selected' : undefined} data-scr="CashCrop"   >Cash Crop</button>
      <button className={/Output/.test(screen)      ? 'selected' : undefined} data-scr="Output"     >Output</button>

      <Button className="feedback" data-scr="Feedback" variant="outlined" color="primary" >Feedback</Button>
    </nav>
    {sc}
    <Help />
  </div>
);

  return (
    <div>
      { /* <Screens parms={parms} props={props} set={set} /> */ }
      <Screens />
    </div>
  );
} // App

const params = new URLSearchParams(window.location.search);
let demo = params.get('site');
const isPSA = params.get('PSA');

if (params.get('fy')) {
  setTimeout(() => {
    document.querySelector('button[data-scr=Output]').click();
    setTimeout(() => {
      window.close();
    }, 2000);
  }, 5000);
}

if (isPSA && !demo) {
  demo = 'AMD';
}

let examples = {};

let modelTimer;

if (examples[demo]) {
  // parms = {...parms, ...examples[demo]}
}

export default App;
