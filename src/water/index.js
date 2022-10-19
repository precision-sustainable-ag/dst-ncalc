import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import Airtable from 'airtable';
import moment from 'moment';

import {set, get} from '../../store/redux-autosetters';
import './styles.scss';

let examples = {};

const Init = () => {
  const dispatch = useDispatch();
  let navigate = useNavigate();

  const PSA = useSelector(get.PSA);
  const field = useSelector(get.field);

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

  const changePSA = (e) => {
    const PSA = examples[e.target.value];
    
    Object.keys(PSA).forEach(key => {
      try {
        dispatch(set[key](PSA[key]));
      } catch(ee) {
        console.log(ee);
        console.log(key);
      }
    });
  } // changePSA

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

  return (
    PSA ?
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
  )
}

export default Init;