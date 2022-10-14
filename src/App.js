import {useEffect} from 'react';

import './App.css';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import {useSelector, useDispatch} from 'react-redux';

import {get, set} from './store/Store';

import {
  Route,
  NavLink,
  Routes,
  useNavigate
} from 'react-router-dom';

const Airtable = require('airtable');

const screens = {};

if (true) {
  screens.home        = require('./components/Home').default;
  screens.location    = require('./components/Location').default;
  screens.about       = require('./components/About').default;
  screens.soil        = require('./components/Soil').default;
  screens.covercrop   = require('./components/CoverCrop').CoverCrop1;
  screens.covercrop2  = require('./components/CoverCrop').CoverCrop2;
  screens.cashcrop    = require('./components/CashCrop').default;
  screens.output      = require('./components/Output').default;
  screens.feedback    = require('./components/Feedback').default;
  screens.advanced    = require('./components/Advanced').default;

  screens.about.menu      = false;
  screens.covercrop2.menu = false;
  screens.advanced.menu   = false;

  Object.keys(screens).forEach(key => {
    screens[key].desc = screens[key].name;
  });

  screens.covercrop.desc  = 'Cover Crop';
  screens.cashcrop.desc   = 'Cash Crop';
  screens.feedback.desc   = 'FEEDBACK';
}

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

const App = () => {
  const dispatch = useDispatch();

  const field = useSelector(get.field);

  let navigate = useNavigate();

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

  const loadField = (field) => {
    if (field === 'Example: Grass') {
      navigate('location');
      dispatch(set.edited(true));
      dispatch(set.lat(32.865389));
      dispatch(set.lon(-82.258361));
      dispatch(set.location('Example'));
      dispatch(set.field('Example: Grass'));
      dispatch(set.OM(0.75));
      dispatch(set.BD(1.62));
      dispatch(set.InorganicN(10));
      dispatch(set.coverCrop(['Rye']));
      dispatch(set.killDate('2019-03-21'));
      dispatch(set.plantingDate('2019-04-01'));
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
      navigate('location');
      dispatch(set.edited(true));
      dispatch(set.lat(32.865389));
      dispatch(set.lon(-82.258361));
      dispatch(set.location('Example'));
      dispatch(set.field('Example: Legume'));
      dispatch(set.OM(0.75));
      dispatch(set.BD(1.62));
      dispatch(set.InorganicN(10));
      dispatch(set.coverCrop(['Clover, Crimson']));
      dispatch(set.killDate('2019-04-27'));
      dispatch(set.plantingDate('2019-05-15'));
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

  const changeField=(e) => {
    const field = e.target.value;
    if (field === 'Clear previous runs') {
      if (window.confirm('Clear all previous runs?')) {
        localStorage.clear();
        navigate('home');
      }
    } else {
      loadField(field);
    }
  } // changeField

  const path = window.location.pathname.slice(1).toLowerCase();
  const Screen = screens[path];

  const changePSA = (e) => {
    const PSA = examples[e.target.value];
    
    Object.keys(PSA).forEach(key => {
      try {
        set[key](PSA[key]);
      } catch(ee) {

      }
    });
    // window.location = `?PSA=true&demo=${e.target.value}`;
  } // changePSA

//  // AutoComplete component doesn't understand autoFocus:
//  const focus = screen === 'CoverCrop'  ? '#coverCrop' :
//                screen === 'CashCrop'   ? '#cashCrop'  :
//                screen === 'Feedback'   ? '#Feedback'  :
//                                            null;
//  if (focus) {
//    setTimeout(() => document.querySelector(focus).focus(), 10);
//  }

//   return <Home />;

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
      <Help />
      <img alt="logo" src="PSALogo.png" id="PSALogo" />

      <nav>
        {
          Object.keys(screens)
            .filter(scr => screens[scr].menu !== false)
            .map(scr => {
              return (
                <NavLink
                  key={scr}
                  className={scr.toLowerCase()}

                  style={({isActive}) => {
                    return {
                      color: isActive ? '#385E1B' : ''
                    };
                  }}

                  to={'/' + scr.toLowerCase()}
                >
                  {screens[scr].desc || scr}
                </NavLink>
              )
            })
        }
        
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

      <Routes>
        {
          Object.keys(screens).map(scr => {
            return (
              <Route
                key={scr}
                path={'/' + scr.toLowerCase()}
                element={<Screen />}
              />
            )
          })
        }
        <Route
          path={'/'}
          element={<Screen />}
        />
      </Routes>
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

export default App;
