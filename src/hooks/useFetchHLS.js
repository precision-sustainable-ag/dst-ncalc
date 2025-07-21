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
const HLS_API_URL = 'https://covercrop-imagery.org';
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

  // initiate calculation of biomass
  useEffect(() => {
    if (isSatelliteMode && mapPolygon.length > 0 && !activeExample && !biomassTaskResults) {
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
        const revertedCoords = [...mapPolygon[0].geometry.coordinates[0]].reverse();
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
  }, [mapPolygon, isSatelliteMode]);

  /** Call api with task id, return task status, if task success, set data with response */
  const fetchTask = (taskId) => {
    axios
      .get(`https://covercrop-imagery.org/tasks/${taskId}`)
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
      dispatch(set.biomassTaskResults(rasterObject));
    }
  }, [data, isSatelliteMode]);

  // .data_array.map(row => row.map(el => el*0.001))

  // set biomass value
  useEffect(() => {
    if (isSatelliteMode && biomassTaskResults && biomassTaskResults.data_array) {
      const flattenedBiomass = biomassTaskResults.data_array.flat(1).filter((el) => el !== 0);
      const factor = unit === 'lb/ac' ? 1.12085 : 1;
      const biomassAVG = arrayAverage(flattenedBiomass) * factor;
      dispatch(set.biomassTotalValue(Math.round(biomassAVG, 0)));
    }
  }, [biomassTaskResults, unit, isSatelliteMode]);

  // useEffect(() => {
  //   dispatch(set.coverCropPlantingDate(coverCropPlantingDate));
  //   dispatch(set.coverCropTerminationDate(coverCropTerminationDate));
  // }, [coverCropPlantingDate, coverCropTerminationDate]);

  useEffect(() => {
    if (biomassTotalValue) {
      dispatch(set.biomass(biomassTotalValue));
    }
  }, [biomassTotalValue, unit]);

  return null;
}; // useFetchHLS

export default useFetchHLS;
