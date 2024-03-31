/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import * as turf from '@turf/turf';
import { get, set } from '../store/Store';

const HLS_API_URL = 'https://covercrop-imagery.org';
let interval;
const arrayAverage = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;

/// Desc: useFetchHLS
/// ..............................................................................
/// ..............................................................................
//
const useFetchHLS = () => {
  const [data, setData] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [taskIsDone, setTaskIsDone] = useState(false);
  const mapPolygon = useSelector(get.mapPolygon);
  const coverCropPlantingDate = useSelector(get.coverCropPlantingDate);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const biomassTotalValue = useSelector(get.biomassTotalValue);
  const biomassTaskResults = useSelector(get.biomassTaskResults);
  const unit = useSelector(get.unit);
  const dispatch = useDispatch();

  const handleButton = () => {
    dispatch(set.biomassTaskResults({}));
    setTaskIsDone(false);
    setData(null);
    let area;
    area = 0;
    // reverse order of vertices
    if (mapPolygon.length > 0) {
      area = 0.000247105 * turf.area(turf.polygon(mapPolygon[0].geometry.coordinates));
    }

    if (area > 10000) {
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
      dispatch(set.biomassFetchIsLoading(true));
      const headers = {
        'Content-Type': 'application/json',
      };
      axios
        .post(`${HLS_API_URL}/tasks`, payload, { headers })
        .then((response) => {
          if (response.status === 200 && response.data) {
            setTaskId(response.data.task_id);
          }
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(error);
        });
    }
  };

  const fetchTask = () => {
    axios
      .get(`https://covercrop-imagery.org/tasks/${taskId}`)
      .then((response) => {
        if (response.data && response.data.task_result && response.data.task_result.message) {
          dispatch(set.dataFetchStatus(response.data.task_result.message));
        } else {
          dispatch(set.dataFetchStatus('idle'));
        }
        if (response.data.task_status === 'SUCCESS') {
          setData(response.data);
          setTaskIsDone(true);
          clearInterval(interval);
          dispatch(set.biomassFetchIsLoading(true));
        } else if (response.data.task_status === 'FAILURE') {
          setTaskIsDone(true);
          clearInterval(interval);
          dispatch(set.biomassFetchIsLoading(true));
          dispatch(set.biomassFetchIsFailed(true));
        }
      })
      .catch(() => {
        setTaskIsDone(true);
        dispatch(set.biomassFetchIsLoading(true));
        clearInterval(interval);
      });
  };

  useEffect(() => {
    if (data && data.task_result) {
      const values = JSON.parse(data.task_result.replace(/\bNaN\b/g, 'null'));
      // eslint-disable-next-line no-console
      const rasterObject = { data_array: values.data_array, bbox: values.bbox };
      dispatch(set.biomassTaskResults(rasterObject));
    }
  }, [data]);
  // .data_array.map(row => row.map(el => el*0.001))
  useEffect(() => {
    if (biomassTaskResults && biomassTaskResults.data_array) {
      const flattenedBiomass = biomassTaskResults.data_array.flat(1).filter((el) => el !== 0);
      const factor = unit === 'lb/ac' ? 1.12085 : 1;
      const biomassAVG = arrayAverage(flattenedBiomass) * factor;
      dispatch(set.biomassTotalValue(Math.round(biomassAVG, 0)));
    }
  }, [biomassTaskResults, unit]);

  // useEffect(() => {
  //   dispatch(set.coverCropPlantingDate(coverCropPlantingDate));
  //   dispatch(set.coverCropTerminationDate(coverCropTerminationDate));
  // }, [coverCropPlantingDate, coverCropTerminationDate]);

  useEffect(() => {
    if (biomassTotalValue) {
      dispatch(set.biomass(biomassTotalValue));
    }
  }, [biomassTotalValue, unit]);

  useEffect(() => {
    if (taskId && !data && !taskIsDone) {
      interval = setInterval(fetchTask, 200);
    }
    return () => {
      clearInterval(interval);
    };
  }, [taskId]);
  return null;
}; // useFetchHLS

export default useFetchHLS;
