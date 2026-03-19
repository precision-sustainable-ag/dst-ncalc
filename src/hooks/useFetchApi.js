/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { get, set } from '../store/Store';
import { weightedAverage } from './helpers';
import { historyStates } from '../store/inits';

const NCAL_API_URL = 'https://api.covercrop-ncalc.org/surface';
const SSURGO_API_URL = 'https://ssurgo.covercrop-data.org';
const WEATHER_API_URL = 'https://weather.covercrop-data.org';
const PLANTFACTORS_API_URL = 'https://developapi.covercrop-imagery.org';

// TODO: hooks for fetching data from different apis

/// Desc: useFetchCornN
/// ..............................................................................
/// ..............................................................................
//
/** fetch cornN data(used for model calculation in Released Nitrogen chart) */
const useFetchCornN = () => {
  const [cornData, setCornData] = useState(null);
  const dispatch = useDispatch();
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);

  useEffect(() => {
    const end = moment(cashCropPlantingDate).add(110, 'days').add(1, 'hour').format('yyyy-MM-DD');
    dispatch(set.errorCorn(false));
    // eslint-disable-next-line max-len
    const url = `${WEATHER_API_URL}/hourly?lat=${lat}&lon=${lon}&start=${moment(cashCropPlantingDate).format(
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
  }, []);
  return cornData;
}; // fetchCornN

/// Desc: useFetchModel
/// ..............................................................................
/// ..............................................................................
//
const useFetchModel = ({
  lat, lon, N, OM, BD, unit, coverCropTerminationDate, cashCropPlantingDate, carb, cell, lign, biomass, lwc, InorganicN,
}) => {
  // eslint-disable-next-line no-unused-vars
  // const [isDatesValid, setIsDatesValid] = useState(null);
  const model = useSelector(get.model);
  const dispatch = useDispatch();

  const start = moment(coverCropTerminationDate).add(1, 'hour').format('yyyy-MM-DD');
  const end = moment(cashCropPlantingDate).add(110, 'days').add(1, 'hour').format('yyyy-MM-DD');

  useEffect(() => {
    if (!N || !biomass) return;
    const validity = start !== 'Invalid date' && end !== 'Invalid date' && moment(end) > moment(start);
    // setIsDatesValid(validity);
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

      const url = `${NCAL_API_URL}?lat=${lat}&lon=${lon}&start=${start}`
                   + `&end=${end}&n=${N}&biomass=${biomass}&lwc=${lwc}&carb=${carb}&cell=${cell}`
                   + `&lign=${lign}&om=${OM}&bd=${BD}&in=${InorganicN}&pmn=${pmn}`;
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
          // setModel(modelData);
          // useFetchCornN();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [N]);

  return model;
};

/// Desc: useFetchSSURGO
/// ..............................................................................
/// ..............................................................................
//
/** Fetch soil data from ssurgo api */
const useFetchSSURGO = () => {
  const dispatch = useDispatch();
  const updateSSURGO = useSelector(get.updateSSURGO);
  const SSURGO = useSelector(get.SSURGO);
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const field = useSelector(get.field);
  const { historyState } = useSelector(get.user);

  useEffect(() => {
    // if ssurgo data need to be updated(map location change), set ssurgo to null
    if (updateSSURGO) {
      dispatch(set.SSURGO(null));
    }
    // exclude example fields
    if ((!SSURGO || updateSSURGO)) {
      const url = `${SSURGO_API_URL}/?lat=${lat}&lon=${lon}&component=major`;
      axios
        .get(url)
        .then((data) => {
          if (data.ERROR || !data.data || !data.data.length) {
            throw new Error('No SSURGO data found for this location');
          } if (!SSURGO || updateSSURGO) {
            // } else {
            let filteredData = data.data.filter((d) => d.desgnmaster !== 'O');
            const minhzdept = Math.min(...filteredData.map((d) => d.hzdept_r));
            filteredData = filteredData.filter((d) => +d.hzdept_r === +minhzdept);
            if (historyState !== historyStates.imported) {
              dispatch(set.BD(weightedAverage(filteredData, 'dbthirdbar_r')));
              dispatch(set.OM(weightedAverage(filteredData, 'om_r')));
            }
            dispatch(set.SSURGO(filteredData));
            dispatch(set.updateSSURGO(false));
          }
        })
        .catch((error) => {
          console.log(error);
          dispatch(set.user.alertMessage(`Error: ${error.message}. Please use a different location or try again later!`));
          dispatch(set.user.showAlert(true));
        });
    }
  }, [updateSSURGO, field]);
}; // fetchSSURGO

const fetchNitrogenData = async (
  biomassTaskResults,
  coverCrop,
  coverCropGrowthStage,
  coverCropTerminationDate,
  cashCropPlantingDate,
  targetN,
  biomassCalcMode,
  fieldGeometry,
  nitrogenSprayMap,
  nitrogenSprayMapProperty,
  multiplier,
  hasFixedNRate,
  gridSize,
  dispatch,
) => {
  const url = `${PLANTFACTORS_API_URL}/nitrogen`;

  dispatch(set.nitrogenFetchIsLoading(true));

  let species;
  let growthStage;

  if (biomassCalcMode === 'satellite') {
    species = coverCrop?.[0];
    growthStage = coverCropGrowthStage?.[species] || 'Unknown growth stage';
  } else if (biomassCalcMode === 'pm3d') {
    species = coverCrop?.length > 0 ? coverCrop : [];
    growthStage = species.map(
      (item) => coverCropGrowthStage?.[item] || 'Unknown growth stage',
    );
  }

  try {
    const response = await axios.post(url, {
      data_array: biomassTaskResults.data_array,
      bbox: biomassTaskResults.bbox,
      species,
      growth_stage: growthStage,
      start: coverCropTerminationDate,
      end: cashCropPlantingDate,
      mode: biomassCalcMode,
      field_geometry: fieldGeometry,
      multiplier,
      has_fixed_rate: hasFixedNRate === 'fixed',
      ...(hasFixedNRate === 'fixed' && { target_n: targetN }),
      ...((hasFixedNRate === 'variable') && {
        feature_collection: nitrogenSprayMap,
        property_key: nitrogenSprayMapProperty,
      }),
      grid_size: gridSize,
    });

    dispatch(set.nitrogenFetchIsLoading(false));

    if (response.status === 200 && response.data) {
      const geojsonData = response.data?.geojson_data;
      delete geojsonData.properties;

      const biomassGeojson = JSON.parse(JSON.stringify(geojsonData));
      const reqnGeojson = JSON.parse(JSON.stringify(geojsonData));

      biomassGeojson.features.forEach((feature) => {
        if (
          feature.properties
          && feature.properties.ReqN !== undefined
        ) {
          feature.properties.value = feature.properties.biomass_average;
        }
      });

      geojsonData.features.forEach((feature) => {
        if (
          feature.properties
          && feature.properties.MinNfromFOM !== undefined
        ) {
          feature.properties.value = feature.properties.MinNfromFOM;
        }
      });

      reqnGeojson.features.forEach((feature) => {
        if (
          feature.properties
          && feature.properties.ReqN !== undefined
        ) {
          feature.properties.value = feature.properties.ReqN;
        }
      });

      dispatch(set.biomassGeojson(biomassGeojson));
      dispatch(set.nitrogenTaskResults({ minN: geojsonData, reqN: reqnGeojson }));
    } else {
      dispatch(set.nitrogenFetchIsFailed(true));
    }
  } catch (error) {
    console.log(error);
    dispatch(set.nitrogenFetchIsLoading(false));
    dispatch(set.nitrogenFetchIsFailed(true));
  }
};

const fetchPrescription = async (
  points,
  fieldGeometry,
  nitrogenSprayMap,
  coverCrop,
  coverCropGrowthStage,
  coverCropTerminationDate,
  cashCropPlantingDate,
  nitrogenSprayMapProperty,
  multiplier,
  hasFixedNRate,
  targetN,
  dispatch,
) => {
  const url = `${PLANTFACTORS_API_URL}/prescription`;
  const growthStage = coverCrop.map(
    (item) => coverCropGrowthStage?.[item] || 'Unknown growth stage',
  );
  try {
    dispatch(set.biomassFetchIsLoading(true));
    dispatch(set.nitrogenFetchIsLoading(true));
    const payload = {
      points,
      field_geometry: fieldGeometry,
      species: coverCrop,
      growth_stage: growthStage,
      start: coverCropTerminationDate,
      end: cashCropPlantingDate,
      multiplier,
      has_fixed_rate: hasFixedNRate === 'fixed',
      ...(hasFixedNRate === 'fixed' && { target_n: targetN }),
      ...((hasFixedNRate === 'variable') && {
        feature_collection: nitrogenSprayMap,
        property_key: nitrogenSprayMapProperty,
      }),
    };
    const response = await axios.post(url, payload);
    if (response.status === 200 && response.data) {
      // console.log('prescription response', response.data);
      const geojsonData = response.data?.geojson_data;
      delete geojsonData.properties;

      const biomassGeojson = JSON.parse(JSON.stringify(geojsonData));
      const reqnGeojson = JSON.parse(JSON.stringify(geojsonData));

      biomassGeojson.features.forEach((feature) => {
        if (
          feature.properties
          && feature.properties.ReqN !== undefined
        ) {
          feature.properties.value = feature.properties.biomass_average;
        }
      });

      geojsonData.features.forEach((feature) => {
        if (
          feature.properties
          && feature.properties.MinNfromFOM !== undefined
        ) {
          feature.properties.value = feature.properties.MinNfromFOM;
        }
      });

      reqnGeojson.features.forEach((feature) => {
        if (
          feature.properties
          && feature.properties.ReqN !== undefined
        ) {
          feature.properties.value = feature.properties.ReqN;
        }
      });

      dispatch(set.biomassGeojson(biomassGeojson));
      dispatch(set.nitrogenTaskResults({ minN: geojsonData, reqN: reqnGeojson }));

      const fieldSummary = response.data?.field_summary;
      const biomassVal = fieldSummary?.avg_biomass ?? 0;
      const nVal = fieldSummary?.avg_n ?? 0;
      const carbVal = fieldSummary?.avg_carb ?? 0;
      const cellVal = fieldSummary?.avg_cell ?? 0;
      const lignVal = fieldSummary?.avg_lign ?? 0;
      const residueNVal = biomassVal * nVal * 0.01;

      dispatch(set.biomass(Number(biomassVal.toFixed(2))));
      dispatch(set.N(Number(nVal.toFixed(2))));
      dispatch(set.carb(Number(carbVal.toFixed(2))));
      dispatch(set.cell(Number(cellVal.toFixed(2))));
      dispatch(set.lign(Number(lignVal.toFixed(2))));
      dispatch(set.residueN(Number(residueNVal.toFixed(2))));
    } else {
      dispatch(set.nitrogenFetchIsFailed(true));
    }
  } catch (error) {
    console.error(error);
    dispatch(set.nitrogenFetchIsFailed(true));
  } finally {
    dispatch(set.biomassFetchIsLoading(false));
    dispatch(set.nitrogenFetchIsLoading(false));
  }
};

const prepareExportData = (reqnGeojson) => {
  if (!reqnGeojson || !reqnGeojson.features) return null;

  const exportedFeatures = reqnGeojson.features.map((feature) => ({
    type: 'Feature',
    geometry: feature.geometry,
    properties: {
      RATE: feature.properties.value ?? 0,
    },
  }));

  return {
    type: 'FeatureCollection',
    features: exportedFeatures,
  };
};

const downloadPrescriptionShapefile = async (reqnGeojson, dispatch) => {
  const filteredData = prepareExportData(reqnGeojson);
  if (!filteredData) {
    dispatch(set.user.alertMessage('No prescription data available for download.'));
    dispatch(set.user.showAlert(true));
    return;
  }

  try {
    const response = await axios.post(`${PLANTFACTORS_API_URL}/export-shapefile`, { geojson: filteredData }, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'prescription_rate.zip');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Export failed:', error);
  }
};
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
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);
  const N = useSelector(get.N);
  const carb = useSelector(get.carb);
  const cell = useSelector(get.cell);
  const lign = useSelector(get.lign);
  const activeStep = useSelector(get.activeStep);
  const targetN = useSelector(get.targetN);
  const biomassTaskResults = useSelector(get.biomassTaskResults);
  const nitrogenTaskResults = useSelector(get.nitrogenTaskResults);
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const biomassCalcMode = useSelector(get.biomassCalcMode);
  const selectedBiomassFile = useSelector(get.selectedBiomassFile);
  const selectedField = useSelector(get.selectedField);
  const nitrogenSprayMap = useSelector(get.nitrogenSprayMap);
  const nitrogenSprayMapProperty = useSelector(get.nitrogenSprayMapProperty);
  const multiplier = useSelector(get.multiplier);
  const hasFixedNRate = useSelector(get.hasFixedNRate);
  const gridSize = useSelector(get.gridSize);
  const activeExample = useSelector(get.activeExample);
  const mapPolygon = useSelector(get.mapPolygon);
  const biomass = useSelector(get.biomass);

  useEffect(() => {
    if (activeExample) return;

    if (isSatelliteMode && coverCrop && coverCropGrowthStage[coverCrop]) {
      const url = `${PLANTFACTORS_API_URL}/plantfactors`;
      axios
        .get(url, { params: { plant_species: coverCrop[0], growth_stage: coverCropGrowthStage[coverCrop] } })
        .then((data) => {
          if (data.data) {
            dispatch(set.N(Number(data.data.mean_n.toFixed(2))));
            dispatch(set.carb(Number(data.data.mean_carb.toFixed(2))));
            dispatch(set.cell(Number(data.data.mean_holocellulose.toFixed(2))));
            dispatch(set.lign(Number(data.data.mean_lignin.toFixed(2))));
            if (biomass && biomass > 0) dispatch(set.residueN(Number((biomass * data.data.mean_n * 0.01).toFixed(2))));
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      dispatch(set.N(null));
      dispatch(set.carb(null));
      dispatch(set.cell(null));
      dispatch(set.lign(null));
      dispatch(set.residueN(null));
    }
  }, [dispatch, coverCrop, coverCropGrowthStage]);

  useEffect(() => {
    const satelliteSpecies = 'Winter cereals';
    const url = isSatelliteMode ? `${PLANTFACTORS_API_URL}/species/${satelliteSpecies}` : `${PLANTFACTORS_API_URL}/species`;
    axios
      .get(url)
      .then((data) => {
        if (data.data) {
          dispatch(set.species(data.data));
        }
      })
      .catch((error) => {
        dispatch(set.species([]));
        console.log(error);
      });
  }, [dispatch, biomassCalcMode]);

  useEffect(() => {
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
  }, [dispatch]);

  useEffect(() => {
    dispatch(set.biomassGeojson(null));
    dispatch(set.nitrogenTaskResults(null));
  }, [biomassTaskResults, coverCrop, coverCropGrowthStage, coverCropTerminationDate, cashCropPlantingDate, targetN,
    gridSize, multiplier, hasFixedNRate, nitrogenSprayMap, nitrogenSprayMapProperty]);

  useEffect(() => {
    if (activeExample) return;
    if (
      biomassTaskResults
      && !nitrogenTaskResults
      && mapPolygon?.[0]?.geometry
      && coverCrop
      && plantGrowthStages
      && coverCropTerminationDate
      && cashCropPlantingDate
      && ((hasFixedNRate === 'variable' && nitrogenSprayMap && nitrogenSprayMapProperty) || (hasFixedNRate === 'fixed' && targetN > 0))
      && gridSize > 0
      && activeStep > 5
    ) {
      fetchNitrogenData(
        biomassTaskResults,
        coverCrop,
        coverCropGrowthStage,
        coverCropTerminationDate,
        cashCropPlantingDate,
        targetN,
        biomassCalcMode,
        mapPolygon?.[0].geometry,
        nitrogenSprayMap,
        nitrogenSprayMapProperty,
        multiplier,
        hasFixedNRate,
        gridSize,
        dispatch,
      );
    }
  }, [
    dispatch,
    biomassTaskResults,
    species,
    plantGrowthStages,
    coverCropTerminationDate,
    cashCropPlantingDate,
    targetN,
    N,
    carb,
    cell,
    lign,
    nitrogenSprayMap,
    nitrogenSprayMapProperty,
    multiplier,
    hasFixedNRate,
    gridSize,
    activeStep,
  ]);

  useEffect(() => {
    if (activeExample || biomassCalcMode !== 'pm3d') return;

    if (
      !nitrogenTaskResults
      && selectedBiomassFile
      && selectedBiomassFile.points
      && selectedField
      && selectedField.geometry
      && ((hasFixedNRate === 'variable' && nitrogenSprayMap && nitrogenSprayMapProperty) || (hasFixedNRate === 'fixed' && targetN > 0))
      && coverCrop
      && plantGrowthStages
      && coverCropTerminationDate
      && cashCropPlantingDate
      && multiplier
      && activeStep > 5
    ) {
      fetchPrescription(
        selectedBiomassFile.points,
        selectedField.geometry,
        nitrogenSprayMap,
        coverCrop,
        coverCropGrowthStage,
        coverCropTerminationDate,
        cashCropPlantingDate,
        nitrogenSprayMapProperty,
        multiplier,
        hasFixedNRate,
        targetN,
        dispatch,
      );
    }
  }, [
    dispatch,
    selectedBiomassFile,
    nitrogenSprayMap,
    nitrogenSprayMapProperty,
    coverCrop,
    plantGrowthStages,
    coverCropTerminationDate,
    cashCropPlantingDate,
    multiplier,
    activeStep,
  ]);
}; // useFetchPlantFactors

/// Desc: useFetchNitrogenArray
/// ..............................................................................
/// ..............................................................................
//
/** only work in satellite mode */
// const useFetchNitrogenArray = () => {
//   const dispatch = useDispatch();
//   const N = useSelector(get.N);
//   const carb = useSelector(get.carb);
//   const cell = useSelector(get.cell);
//   const lign = useSelector(get.lign);
//   const biomassTaskResults = useSelector(get.biomassTaskResults);
//   // const nitrogenTaskResults = useSelector(get.nitrogenTaskResults);

//   useEffect(() => {
//     if (biomassTaskResults && N && carb && cell && lign) {
//       const url = `${PLANTFACTORS_API_URL}/nitrogen`;
//       const payload = {
//         nitrogen_percentage: N,
//         carbohydrates_percentage: carb,
//         holo_cellulose_percentage: cell,
//         lignin_percentage: lign,
//         data_array: biomassTaskResults.data_array,
//         bbox: biomassTaskResults.bbox,
//       };
//       axios
//         .post(url, payload)
//         .then((response) => {
//           if (response.data) {
//             dispatch(set.nitrogenTaskResults(response.data));
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     }
//   }, [dispatch, biomassTaskResults, N, carb, cell, lign]);
// }; // useFetchNitrogenArray

export {
  useFetchModel, useFetchSSURGO, useFetchCornN, useFetchPlantFactors, fetchNitrogenData, downloadPrescriptionShapefile,
};
