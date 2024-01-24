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
  const [cornData, setCornData] = useState(null);
  const dispatch = useDispatch();
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);

  useEffect(() => {
    const end = moment(cashCropPlantingDate)
      .add(110, 'days')
      .add(1, 'hour')
      .format('yyyy-MM-DD');
    setEndDate(end);
    // dispatch(set.cornN([]));
    dispatch(set.errorCorn(false));
    // eslint-disable-next-line max-len
    const url = `${WEATHER_API_URL}/hourly?lat=${lat}&lon=${lon}&start=${moment(
      cashCropPlantingDate,
    ).format(
      'yyyy-MM-DD',
    )}&end=${endDate}&attributes=air_temperature&options=predicted`;
    axios
      .get(url)
      .then(({ data }) => {
        if (data && data instanceof Array) {
          console.log('cornN4j353j4n3', data);
          dispatch(set.cornN(data));
          setCornData(data);
        } else {
          dispatch(set.errorCorn(true));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [cashCropPlantingDate, endDate]);
  return cornData;
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
  coverCropTerminationDate,
  cashCropPlantingDate,
  carb,
  cell,
  lign,
  biomass,
  lwc,
  InorganicN,
}) => {
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
    coverCropTerminationDate,
    cashCropPlantingDate,
    carb,
    cell,
    lign,
    biomass,
    lwc,
    InorganicN,
  });

  console.log('####### useFetchModel useEffect');
  const start = moment(coverCropTerminationDate)
    .add(1, 'hour')
    .format('yyyy-MM-DD');
  const end = moment(cashCropPlantingDate)
    .add(110, 'days')
    .add(1, 'hour')
    .format('yyyy-MM-DD');

  useEffect(() => {
    const validity = start !== 'Invalid date'
      && end !== 'Invalid date'
      && moment(end) > moment(start);
    setIsDatesValid(validity);
    // const end = moment(cashCropPlantingDate).add(110, 'days').add(1, 'hour').format('yyyy-MM-DD');
    console.log('cashCropPlantingDate', cashCropPlantingDate);
    console.log('coverCropTerminationDate', coverCropTerminationDate);
    console.log('startDate', start);
    console.log('endDate', end);
    console.log('isDatesValid', validity);
    console.log('gdfhhgfdhfg############', start, end, moment(end) > moment(start));
    if (!validity) {
      console.log('invalid dates for fetch Model'); // eslint-disable-line no-console
    } else {
      console.log('fdgfdgd############', start, end, isDatesValid);
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

      const url = `${NCAL_API_URL}?lat=${lat}&lon=${lon}&start=${start}
                   &end=${end}&n=${N}&biomass=${biomass}&lwc=${lwc}&carb=${carb}&cell=${cell}
                   &lign=${lign}&om=${OM}&bd=${BD}&in=${InorganicN}&pmn=${pmn}`;
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
  }, [cashCropPlantingDate, coverCropTerminationDate, end, start]);

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
        console.log('SSURGO url', url);
        if (data.ERROR || !data.data || !data.data.length) {
          console.log(`No SSURGO data at ${lat}, ${lon}`);
          dispatch(set.BD(''));
          dispatch(set.OM(''));
        } else {
          console.log('SSURGO data', data);
          let filteredData = data.data.filter((d) => d.desgnmaster !== 'O');
          console.log('SSURGO filteredData', filteredData);
          const minhzdept = Math.min(...filteredData.map((d) => d.hzdept_r));
          filteredData = filteredData.filter((d) => +d.hzdept_r === +minhzdept);
          dispatch(set.BD(weightedAverage(filteredData, 'dbthirdbar_r')));
          dispatch(set.OM(weightedAverage(filteredData, 'om_r')));
          dispatch(set.SSURGO(filteredData));
          console.log('SSURGO', filteredData);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [lat, lon]);
}; // fetchSSURGO

export { useFetchModel, useFetchSSURGO, useFetchCornN };
