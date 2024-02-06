/* eslint-disable no-console */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Airtable from 'airtable';
import moment from 'moment';

import { set, get } from '../../store/redux-autosetters';
import { useFetchSampleBiomass } from '../../hooks/useFetchStatic';

const examples = {};

const Init = () => {
  /// ///// VARIABLES ///// ////
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const PSA = useSelector(get.PSA);
  const field = useSelector(get.field);

  // eslint-disable-next-line no-unused-vars
  const [samplePolygon, sampleBiomass] = useFetchSampleBiomass();

  /// ///// FUNCTIONS ///// ////
  const loadField = (fieldVal) => {
    if (fieldVal === 'Example: Grass') {
      // navigate('location');
      dispatch(set.edited(true));
      dispatch(set.activeExample(fieldVal));
      dispatch(set.lat(32.865389));
      dispatch(set.lon(-82.258361));
      dispatch(set.location('Example'));
      dispatch(set.field('Example: Grass'));
      dispatch(set.OM(0.75));
      dispatch(set.BD(1.62));
      dispatch(set.InorganicN(10));
      dispatch(set.coverCrop(['Rye']));
      dispatch(set.coverCropPlantingDate('2018-09-01'));
      dispatch(set.coverCropTerminationDate('2019-03-21'));
      dispatch(set.cashCropPlantingDate('2019-04-01'));
      dispatch(set.biomass(5000));
      dispatch(set.lwc(1.486));
      dispatch(set.N(0.6));
      dispatch(set.carb(33.45));
      dispatch(set.cell(57.81));
      dispatch(set.lign(8.74));
      dispatch(set.cashCrop('Corn'));
      dispatch(set.yield(150));
      dispatch(set.targetN(150));
    } else if (fieldVal === 'Example: Legume') {
      // navigate('location');
      dispatch(set.edited(true));
      dispatch(set.activeExample(fieldVal));
      dispatch(set.lat(32.865389));
      dispatch(set.lon(-82.258361));
      dispatch(set.location('Example'));
      dispatch(set.field('Example: Legume'));
      dispatch(set.OM(0.75));
      dispatch(set.BD(1.62));
      dispatch(set.InorganicN(10));
      dispatch(set.coverCrop(['Clover, Crimson']));
      dispatch(set.coverCropPlantingDate('2018-10-01'));
      dispatch(set.coverCropTerminationDate('2019-04-27'));
      dispatch(set.cashCropPlantingDate('2019-05-15'));
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
      Object.keys(inputs).forEach((key) => {
        try {
          if (/Date/.test(key)) {
            const date = moment(inputs[key]).format('yyyy-MM-DD');
            dispatch(set[key](date));
          } else {
            dispatch(set[key](inputs[key]));
          }
        } catch (e) {
          console.log(key, e.message);
        }
      });
      dispatch(set.lwc(inputs.lwc)); // avoid calculation
    }
  }; // loadfield

  useEffect(() => {
    const base = new Airtable({ apiKey: 'keySO0dHQzGVaSZp2' }).base('appOEj4Ag9MgTTrMg');

    const airtable = (table, callback, wrapup) => {
      base(table).select({
        view: 'Grid view',
      }).eachPage((records, fetchNextPage) => {
        records.forEach((record) => {
          callback(record.fields);
        });

        fetchNextPage();
      }, (err) => {
        if (!err && wrapup) {
          wrapup();
        }
      });
    }; // airtable

    airtable('PSA', (site) => {
      localStorage.removeItem(site.ID);
      if (site.Hour === 0) {
        examples[site.ID] = {
          field: site.ID,
          lat: site.Lat,
          lon: site.Lon,
          location: '',
          BD: site.BD,
          coverCrop: [site['Cover Crop']],
          cashCrop: site['Cash Crop'],
          coverCropTerminationDate: new Date(site.Date),
          lwc: site.LitterWaterContent,
          biomass: Math.round(site.FOM),
          unit: 'kg/ha',
          N: +(site.FOMpctN.toFixed(2)),
          carb: +(site.Carb.toFixed(2)),
          cell: +(site.Cell.toFixed(2)),
          lign: +(site.Lign.toFixed(2)),
          targetN: 150,
          category: site.Category,
        };
      } else {
        examples[site.ID].cashCropPlantingDate = new Date(moment(site.Date).add(-111, 'days'));
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
      },
    );
    // /// temporary to load example
    // loadField('Example: Grass');
  }, [dispatch]);

  const changePSA = (e) => {
    const PSAval = examples[e.target.value];

    Object.keys(PSAval).forEach((key) => {
      try {
        dispatch(set[key](PSAval[key]));
      } catch (ee) {
        console.log(ee);
        console.log(key);
      }
    });
  }; // changePSA

  const changeField = (e) => {
    const fieldStr = e.target.value;
    if (fieldStr === 'Clear previous runs') {
      // eslint-disable-next-line no-alert
      if (window.confirm('Clear all previous runs?')) {
        localStorage.clear();
        navigate('home');
      }
    } else {
      loadField(fieldStr);
    }
  }; // changeField

  /// ///// JSX RENDER ///// ////
  return (
    <div className="Init">
      {
        PSA
        && (
          <select
            className="fields"
            onChange={changePSA}
            value={field}
          >
            <option>examples</option>
            <optgroup label="PSA">
              {
                Object.keys(examples)
                  .filter((site) => examples[site].category === 'PSA')
                  .sort().map((site) => <option key={site}>{site}</option>)
              }
            </optgroup>
            <optgroup label="Resham">
              {
                Object.keys(examples)
                  .filter((site) => examples[site].category === 'Resham')
                  .sort().map((site) => <option key={site}>{site}</option>)
              }
            </optgroup>
          </select>
        )
      }

      {
        (!PSA)
        && (
          <select
            className="fields"
            onChange={changeField}
            value={field}
          >
            <option>examples</option>
            <option>Example: Grass</option>
            <option>Example: Legume</option>
            {
              Object.keys(localStorage).filter((v) => !v.includes('mapbox.eventData')).length && (
                <>
                  <option>Clear previous runs</option>
                  <option disabled>____________________</option>
                </>
              )
            }
            { // additional field names in example dropdown
              Object.keys(localStorage).sort().filter((v) => !v.includes('mapbox.eventData')).map((fld, idx) => (
                <option key={idx} checked={fld === field}>{fld}</option> // eslint-disable-line react/no-unknown-property
              ))
            }
          </select>
        )
      }
    </div>
  );
};

export default Init;
