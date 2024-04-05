/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { get, set } from '../store/Store';

let interval;
const arrayAverage = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;

/// Desc: useFetchHLS
/// ..............................................................................
/// ..............................................................................
//
const useFetchHLS = () => {
  const [data, setData] = useState(null);
  // const [taskId, setTaskId] = useState(null);
  const [taskIsDone, setTaskIsDone] = useState(false);
  const biomassTotalValue = useSelector(get.biomassTotalValue);
  const biomassTaskResults = useSelector(get.biomassTaskResults);
  const biomassTaskId = useSelector(get.biomassTaskId);
  const unit = useSelector(get.unit);
  const dispatch = useDispatch();

  const fetchTask = () => {
    axios
      .get(`https://covercrop-imagery.org/tasks/${biomassTaskId}`)
      .then((response) => {
        if (
          response.data &&
          response.data.task_result &&
          response.data.task_result.message
        ) {
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
      const flattenedBiomass = biomassTaskResults.data_array
        .flat(1)
        .filter((el) => el !== 0);
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
    if (biomassTaskId && !data && !taskIsDone) {
      interval = setInterval(fetchTask, 200);
    }
    return () => {
      clearInterval(interval);
    };
  }, [biomassTaskId]);
  return null;
}; // useFetchHLS

export default useFetchHLS;
