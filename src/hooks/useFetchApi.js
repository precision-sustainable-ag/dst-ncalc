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
    if (!validity) {
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

      const url = `${NCAL_API_URL}?lat=${lat}&lon=${lon}&start=${start}
                   &end=${end}&n=${N}&biomass=${biomass}&lwc=${lwc}&carb=${carb}&cell=${cell}
                   &lign=${lign}&om=${OM}&bd=${BD}&in=${InorganicN}&pmn=${pmn}`;
      axios
        .get(url)
        .then(({ data }) => {
          if (data.name === 'error' || !data.surface) {
            dispatch(set.errorModel(true));
            return;
          }

          const modelSurface = {};
          data.surface.forEach((ddata) => {
            Object.keys(ddata).forEach((key) => {
              modelSurface[key] = modelSurface[key] || [];
              modelSurface[key].push(ddata[key]);
            });
          });
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
          dispatch(set.model(modelData));
          setModel(modelData);
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

const useFetchSSURGO = ({ lat, lon }) => {
  const dispatch = useDispatch();
  // const SSURGO = useSelector(get.SSURGO);

  useEffect(() => {
    const url = `${SSURGO_API_URL}/?lat=${lat}&lon=${lon}&component=major`;
    axios
      .get(url)
      .then((data) => {
        if (data.ERROR || !data.data || !data.data.length) {
          dispatch(set.BD(''));
          dispatch(set.OM(''));
          // } else if (!SSURGO) {
        } else {
          let filteredData = data.data.filter((d) => d.desgnmaster !== 'O');
          const minhzdept = Math.min(...filteredData.map((d) => d.hzdept_r));
          filteredData = filteredData.filter((d) => +d.hzdept_r === +minhzdept);
          dispatch(set.BD(weightedAverage(filteredData, 'dbthirdbar_r')));
          dispatch(set.OM(weightedAverage(filteredData, 'om_r')));
          dispatch(set.SSURGO(filteredData));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [lat, lon]);
}; // fetchSSURGO

export { useFetchModel, useFetchSSURGO, useFetchCornN };
