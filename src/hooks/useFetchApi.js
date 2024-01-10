/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { get, set } from '../store/Store';
import { weightedAverage } from './helpers';

const NCAL_API_URL = 'https://api.precisionsustainableag.org/cc-ncalc/surface';
const SSURGO_API_URL = 'https://ssurgo.covercrop-data.org';
const WEATHER_API_URL = 'https://weather.covercrop-data.org';

/// Desc: useFetchCornN
/// ..............................................................................
/// ..............................................................................
//
const useFetchCornN = () => {
  const [endDate, setEndDate] = useState(null);
  const dispatch = useDispatch();
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const plantingDate = useSelector(get.plantingDate);

  useEffect(() => {
    const end = moment(plantingDate)
      .add(110, 'days')
      .add(1, 'hour')
      .format('yyyy-MM-DD');
    setEndDate(end);
  }, [plantingDate]);

  useEffect(() => {
    dispatch(set.cornN(null));
    dispatch(set.errorCorn(false));
    // eslint-disable-next-line max-len
    const url = `${WEATHER_API_URL}/hourly?lat=${lat}&lon=${lon}&start=${moment(
      plantingDate,
    ).format(
      'yyyy-MM-DD',
    )}&end=${endDate}&attributes=air_temperature&options=predicted`;
    axios
      .get(url)
      .then((data) => {
        if (data instanceof Array) {
          dispatch(set.cornN(data));
        } else {
          dispatch(set.errorCorn(true));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
}; // fetchCornN

/// Desc: useFetchModel
/// ..............................................................................
/// ..............................................................................
//
const useFetchModel = ({
  lat,
  lon,
  N,
  OM,
  BD,
  unit,
  killDate,
  plantingDate,
  carb,
  cell,
  lign,
  biomass,
  lwc,
  InorganicN,
}) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isDatesValid, setIsDatesValid] = useState(null);
  const [model, setModel] = useState(null);
  const dispatch = useDispatch();

  console.log('useFetchModel', {
    lat,
    lon,
    N,
    OM,
    BD,
    unit,
    killDate,
    plantingDate,
    carb,
    cell,
    lign,
    biomass,
    lwc,
    InorganicN,
  });
  // useEffect(() => {

  // }, [killDate, plantingDate]);

  useEffect(() => {
    console.log('####### useFetchModel useEffect');
    const start = moment(killDate)
      .add(1, 'hour')
      .format('yyyy-MM-DD');
    const end = moment(plantingDate)
      .add(110, 'days')
      .add(1, 'hour')
      .format('yyyy-MM-DD');
    setStartDate(start);
    setEndDate(end);
    setIsDatesValid(
      start !== 'Invalid date'
      && end !== 'Invalid date'
      && end > start,
    );
    // const end = moment(plantingDate).add(110, 'days').add(1, 'hour').format('yyyy-MM-DD');
    console.log('plantingDate', plantingDate);
    console.log('killDate', killDate);
    console.log('startDate', start);
    console.log('endDate', end);
    console.log('isDatesValid', isDatesValid);
    console.log('gdfhhgfdhfg############', killDate, plantingDate);
    if (!isDatesValid) {
      console.log('invalid dates for fetch Model'); // eslint-disable-line no-console
    } else {
      const pmn = 10;

      InorganicN = InorganicN || 10;

      lwc = lwc || 10;
      carb = carb || 24.7 + 10.5 * N;
      cell = cell || 69 - 10.2 * N;
      lign = lign || 100 - (carb + cell);

      const total = +carb + +cell + +lign;
      carb = (carb * 100) / total;
      cell = (cell * 100) / total;
      lign = (lign * 100) / total;

      const factor = unit === 'lb/ac' ? 1.12085 : 1;

      biomass *= factor;

      // eslint-disable-next-line max-len
      const url = `${NCAL_API_URL}?lat=${lat}&lon=${lon}&start=${startDate}&end=${endDate}&n=${N}&biomass=${biomass}&lwc=${lwc}&carb=${carb}&cell=${cell}&lign=${lign}&om=${OM}&bd=${BD}&in=${InorganicN}&pmn=${pmn}`;
      console.log('NCAL_API_URL', url);
      axios
        .get(url)
        .then(({ data }) => {
          console.log('data', data);
          if (data.name === 'error' || !data.surface) {
            dispatch(set.errorModel(true));
            console.log('error in fetch model', data);
            return;
          }

          const modelSurface = {};
          data.surface.forEach((ddata) => {
            Object.keys(ddata).forEach((key) => {
              modelSurface[key] = modelSurface[key] || [];
              modelSurface[key].push(ddata[key]);
            });
          });
          console.log('modelSurface', modelSurface);
          const modelIncorporated = {};

          const modelData = {
            s: modelSurface,
            i: modelIncorporated,
          };

          const cols = Object.keys(modelData.s).sort((a, b) => a.toUpperCase().localeCompare(b.toUpperCase()));

          cols
            .filter((col) => !modelData.s[col].length)
            .forEach((col) => {
              modelData.s[col] = new Array(
                modelData.s.Rain.length,
              ).fill(modelData.s[col]);
            });
          console.log('modelData', modelData);
          dispatch(set.model(modelData));
          setModel(modelData);
          // dispatch(set.gotModel(true));
          // console.log('gotModel', store.getState().gotModel);
          useFetchCornN();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, []);
  return model;
};

/// Desc: useFetchSSURGO
/// ..............................................................................
/// ..............................................................................
//

const useFetchSSURGO = () => {
  const dispatch = useDispatch();
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);

  useEffect(() => {
    const url = `${SSURGO_API_URL}/?lat=${lat}&lon=${lon}&component=major`;
    dispatch(set.SSURGO(null));
    dispatch(set.model(null));
    axios
      .get(url)
      .then((data) => {
        if (data.ERROR) {
          console.log(`No SSURGO data at ${lat}, ${lon}`);
          dispatch(set.BD(''));
          dispatch(set.OM(''));
        } else {
          data = data.filter((d) => d.desgnmaster !== 'O');
          // const minhzdept = Math.min.apply(Math, data.map((d) => d.hzdept_r));
          const minhzdept = Math.min(...data.map((d) => d.hzdept_r));
          data = data.filter((d) => +d.hzdept_r === +minhzdept);
          dispatch(set.BD(weightedAverage(data, 'dbthirdbar_r')));
          dispatch(set.OM(weightedAverage(data, 'om_r')));
          dispatch(set.SSURGO(data));
          useFetchModel();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [lat, lon]);
}; // fetchSSURGO

export { useFetchModel, useFetchSSURGO, useFetchCornN };
