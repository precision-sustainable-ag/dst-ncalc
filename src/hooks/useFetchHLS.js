/* eslint-disable camelcase */
/* eslint-disable operator-linebreak */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import * as turf from '@turf/turf';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { get, set } from '../store/Store';
// import { map } from 'lodash';

const arrayAverage = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;
const HLS_API_URL = 'https://develop.covercrop-imagery.org';
const fetchTimeout = 750;

/// Desc: useFetchHLS
/// ..............................................................................
/// ..............................................................................
//
/** hook for fetching biomass raster data */
const useFetchHLS = () => {
  const [data, setData] = useState(null);
  // const [taskId, setTaskId] = useState(null);
  const biomassTotalValue = useSelector(get.biomassTotalValue);
  const biomassTaskResults = useSelector(get.biomassTaskResults);
  const unit = useSelector(get.unit);
  const coverCropPlantingDate = useSelector(get.coverCropPlantingDate);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const mapPolygon = useSelector(get.mapPolygon);
  const activeExample = useSelector(get.activeExample);
  const dispatch = useDispatch();
  // eslint-disable-next-line no-unneeded-ternary
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite' ? true : false;
  const isPM3DMode = useSelector(get.biomassCalcMode) === 'pm3d';
  const pm3dData = useSelector(get.pm3dData);
  const activeStep = useSelector(get.activeStep);
  const N = useSelector(get.N);

  useEffect(() => {
    if (!activeExample && isSatelliteMode) {
      dispatch(set.biomassGeojson(null));
      dispatch(set.biomassTaskResults(null));
      dispatch(set.biomassTotalValue(null));
      dispatch(set.biomass(null));
      dispatch(set.residueN(null));
    }
  }, [JSON.stringify(mapPolygon), coverCropPlantingDate, coverCropTerminationDate]);

  useEffect(() => {
    if (!activeExample && isPM3DMode) {
      dispatch(set.biomassGeojson(null));
      dispatch(set.biomassTaskResults(null));
      dispatch(set.biomassTotalValue(null));
      dispatch(set.biomass(null));
      dispatch(set.residueN(null));
    }
  }, [JSON.stringify(pm3dData)]);

  // initiate calculation of biomass
  useEffect(() => {
    if (isSatelliteMode && mapPolygon.length > 0 && !activeExample && !biomassTaskResults && activeStep > 2) {
      dispatch(set.biomassTaskIsDone(false));
      // setData(null);
      let area;
      area = 0;
      // reverse order of vertices
      if (mapPolygon.length > 0) {
        area = 0.000247105 * turf.area(turf.polygon(mapPolygon[0].geometry.coordinates));
      }

      if (area > 10000) {
        // if area too large, not do calculation
        dispatch(set.polyDrawTooBig(true));
        dispatch(set.mapPolygon([]));
      } else {
        const revertedCoords = [...mapPolygon[0].geometry.coordinates[0]];
        const payload = {
          maxCloudCover: 5,
          startDate: coverCropPlantingDate,
          endDate: coverCropTerminationDate,
          geometry: {
            type: 'Polygon',
            coordinates: [revertedCoords],
          },
        };
        const headers = {
          'Content-Type': 'application/json',
        };
        // post task api, will return a task id
        axios
          .post(`${HLS_API_URL}/tasks`, payload, { headers })
          .then((response) => {
            if (response.status === 200 && response.data) {
              dispatch(set.biomassFetchIsLoading(true));
              const { task_id } = response.data;
              // eslint-disable-next-line no-use-before-define
              fetchTask(task_id);
            }
          })
          .catch((error) => {
            dispatch(set.biomassFetchIsFailed(true));
            console.log(error);
          });
      }
    }
  }, [JSON.stringify(mapPolygon), isSatelliteMode, activeStep]);

  /** Call api with task id, return task status, if task success, set data with response */
  const fetchTask = (taskId) => {
    axios
      .get(`https://develop.covercrop-imagery.org/tasks/${taskId}`)
      .then((response) => {
        // set snackbar message for task status
        if (response.data && response.data.task_result && response.data.task_result.message) {
          dispatch(set.dataFetchStatus(response.data.task_result.message));
        } else {
          dispatch(set.dataFetchStatus('idle'));
        }

        const { task_status } = response.data;
        if (task_status === 'PENDING') {
          setTimeout(() => fetchTask(taskId), fetchTimeout);
        } else if (task_status === 'SUCCESS') {
          setData(response.data);
          dispatch(set.biomassFetchIsLoading(false));
        } else if (task_status === 'FAILURE') {
          dispatch(set.biomassFetchIsLoading(false));
          dispatch(set.biomassFetchIsFailed(true));
        }
      })
      .catch(() => {
        dispatch(set.biomassFetchIsLoading(false));
        dispatch(set.biomassFetchIsFailed(true));
      });
  };

  // set raster object
  useEffect(() => {
    if (isSatelliteMode && data && data.task_result) {
      const values = JSON.parse(data.task_result.replace(/\bNaN\b/g, 'null'));
      // eslint-disable-next-line no-console
      const rasterObject = { data_array: values.data_array, bbox: values.bbox };
      // const biomassGeojson = values.biomass_geojson;
      // dispatch(set.biomassGeojson(biomassGeojson));
      dispatch(set.biomassTaskResults(rasterObject));
    }
  }, [data, isSatelliteMode]);

  // .data_array.map(row => row.map(el => el*0.001))

  // set biomass value
  useEffect(() => {
    if ((isSatelliteMode || isPM3DMode) && biomassTaskResults && biomassTaskResults.data_array) {
      const flattenedBiomass = biomassTaskResults.data_array.flat(1).filter((el) => el !== 0);
      // biomass is received in kg/ha
      const factor = unit === 'lb/ac' ? 0.8922 : 1;
      const biomassAVG = arrayAverage(flattenedBiomass) * factor;
      dispatch(set.biomassTotalValue(Math.round(biomassAVG, 0)));
    }
  }, [biomassTaskResults, unit, isSatelliteMode, isPM3DMode]);

  // useEffect(() => {
  //   dispatch(set.coverCropPlantingDate(coverCropPlantingDate));
  //   dispatch(set.coverCropTerminationDate(coverCropTerminationDate));
  // }, [coverCropPlantingDate, coverCropTerminationDate]);

  useEffect(() => {
    if (biomassTotalValue) {
      dispatch(set.biomass(biomassTotalValue));
      dispatch(set.residueN(Number((biomassTotalValue * N * 0.01).toFixed(2))));
    }
  }, [biomassTotalValue, unit]);

  useEffect(() => {
    async function fetchBiomass() {
      if (isPM3DMode && pm3dData && !biomassTaskResults && activeStep > 1) {
        const url = `${HLS_API_URL}/generate-grid`;
        try {
          const response = await axios.post(url, {
            points: pm3dData,
            grid_size_meters: 63.6,
          });

          if (response.status === 200 && response.data) {
            const biomassData = response.data;
            const { bbox } = biomassData;
            const rasterObject = { data_array: biomassData.data_array, bbox: biomassData.bbox };
            const biomassGeojson = biomassData.biomass_geojson;
            const coverCrop = biomassData.species;
            const speciesBiomassAverage = biomassData.species_biomass_average;
            dispatch(set.biomassGeojson(biomassGeojson));
            dispatch(set.biomassTaskResults(rasterObject));
            dispatch(set.speciesBiomassAverage(speciesBiomassAverage));
            dispatch(set.coverCrop(coverCrop));
            dispatch(set.lon((bbox[0] + bbox[2]) / 2));
            dispatch(set.lat((bbox[1] + bbox[3]) / 2));
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    fetchBiomass();
  }, [isPM3DMode, pm3dData, activeStep]);

  return null;
}; // useFetchHLS

export default useFetchHLS;
