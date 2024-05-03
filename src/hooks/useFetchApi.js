/* eslint-disable react-hooks/exhaustive-deps */
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
const PLANTFACTORS_API_URL = 'https://api.covercrop-imagery.org';

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
    )}&end=${end}&attributes=air_temperature&options=predicted`;
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
  // eslint-disable-next-line no-unused-vars
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
          // useFetchCornN();
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
  const updateSSURGO = useSelector(get.updateSSURGO);
  const SSURGO = useSelector(get.SSURGO);
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const field = useSelector(get.field);

  useEffect(() => {
    if (!field.includes('Mockup')) {
      const url = `${SSURGO_API_URL}/?lat=${lat}&lon=${lon}&component=major`;
      axios
        .get(url)
        .then((data) => {
          if (data.ERROR || !data.data || !data.data.length) {
            dispatch(set.BD(''));
            dispatch(set.OM(''));
          } else if (!SSURGO || updateSSURGO) {
            // } else {
            let filteredData = data.data.filter((d) => d.desgnmaster !== 'O');
            const minhzdept = Math.min(...filteredData.map((d) => d.hzdept_r));
            filteredData = filteredData.filter((d) => +d.hzdept_r === +minhzdept);
            dispatch(set.BD(weightedAverage(filteredData, 'dbthirdbar_r')));
            dispatch(set.OM(weightedAverage(filteredData, 'om_r')));
            dispatch(set.SSURGO(filteredData));
            dispatch(set.updateSSURGO(false));
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [updateSSURGO, field]);
}; // fetchSSURGO

/// Desc: useFetchPlantFactors
/// ..............................................................................
/// ..............................................................................
//

const useFetchPlantFactors = () => {
  const dispatch = useDispatch();
  const species = useSelector(get.species);
  const plantGrowthStages = useSelector(get.plantGrowthStages);
  const coverCrop = useSelector(get.coverCrop);
  const coverCropGrowthStage = useSelector(get.coverCropGrowthStage);
  // const N = useSelector(get.N);
  // const carb = useSelector(get.carb);
  // const cell = useSelector(get.cell);
  // const lign = useSelector(get.lign);

  useEffect(() => {
    if (coverCrop && coverCropGrowthStage) {
      const url = `${PLANTFACTORS_API_URL}/plantfactors`;
      axios
        .get(url, { params: { plant_species: coverCrop, growth_stage: coverCropGrowthStage } })
        .then((data) => {
          console.log('growth data', data);
          if (data.data) {
            dispatch(set.N(data.data.nitrogen_percentage));
            dispatch(set.carb(data.data.carbohydrates_percentage));
            dispatch(set.cell(data.data.holo_cellulose_percentage));
            dispatch(set.lign(data.data.lignin_percentage));
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [dispatch, coverCrop, coverCropGrowthStage]);

  useEffect(() => {
    if (!species) {
      const url = `${PLANTFACTORS_API_URL}/species`;
      axios
        .get(url)
        .then((data) => {
          if (data.data) {
            dispatch(set.species(data.data));
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
    if (!plantGrowthStages) {
      const url = `${PLANTFACTORS_API_URL}/plantgrowthstages`;
      axios
        .get(url)
        .then((data) => {
          if (data.data) {
            dispatch(set.plantGrowthStages(data.data));
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [dispatch, species, plantGrowthStages]);
}; // useFetchPlantFactors

/// Desc: useFetchNitrogenArray
/// ..............................................................................
/// ..............................................................................
//

const useFetchNitrogenArray = () => {
  const dispatch = useDispatch();
  const N = useSelector(get.N);
  const carb = useSelector(get.carb);
  const cell = useSelector(get.cell);
  const lign = useSelector(get.lign);
  const biomassTaskResults = useSelector(get.biomassTaskResults);
  // const nitrogenTaskResults = useSelector(get.nitrogenTaskResults);

  useEffect(() => {
    if (biomassTaskResults && N && carb && cell && lign) {
      console.log('biomassTaskResults', biomassTaskResults);
      const url = `${PLANTFACTORS_API_URL}/nitrogen`;
      const payload = {
        nitrogen_percentage: N,
        carbohydrates_percentage: carb,
        holo_cellulose_percentage: cell,
        lignin_percentage: lign,
        data_array: biomassTaskResults.data_array,
        bbox: biomassTaskResults.bbox,
      };
      console.log('payload', payload);
      axios
        .post(url, payload)
        .then((response) => {
          if (response.data) {
            dispatch(set.nitrogenTaskResults(response.data));
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [dispatch, biomassTaskResults, N, carb, cell, lign]);
}; // useFetchNitrogenArray

export {
  useFetchModel,
  useFetchSSURGO,
  useFetchCornN,
  useFetchPlantFactors,
  useFetchNitrogenArray,
};
