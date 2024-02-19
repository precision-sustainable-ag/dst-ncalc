/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import * as turf from '@turf/turf';
import { get, set } from '../../store/Store';
import { AreaErrorModal, TaskFailModal } from './Warnings';
import Datebox from './Datebox';

let interval;

const arrayAverage = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;

const Biomass = () => {
  const [loading, setLoading] = useState(false);
  const [errorArea, setErrorArea] = useState(false);
  const [data, setData] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [taskIsDone, setTaskIsDone] = useState(false);
  const [taskIsFailed, setTaskIsFailed] = useState(false);
  const mapPolygon = useSelector(get.mapPolygon);
  const coverCropPlantingDate = useSelector(get.coverCropPlantingDate);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const biomassTotalValue = useSelector(get.biomassTotalValue);
  const biomassTaskResults = useSelector(get.biomassTaskResults);
  const unit = useSelector(get.unit);
  const dispatch = useDispatch();

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
      setErrorArea(true);
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
      setLoading(true);
      const headers = {
        'Content-Type': 'application/json',
      };
      axios
        .post('https://covercrop-imagery.org/tasks', payload, { headers })
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
        if (response.data.task_status === 'SUCCESS') {
          setData(response.data);
          setTaskIsDone(true);
          clearInterval(interval);
          setLoading(false);
        } else if (response.data.task_status === 'FAILURE') {
          setTaskIsDone(true);
          clearInterval(interval);
          setLoading(false);
          setTaskIsFailed(true);
        }
      })
      .catch(() => {
        setTaskIsDone(true);
        setLoading(false);
        clearInterval(interval);
      });
  };

  useEffect(() => {
    if (taskId && !data && !taskIsDone) {
      interval = setInterval(fetchTask, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [taskId]);

  return (
    <Box pb={2}>
      {errorArea && (
        <AreaErrorModal errorArea={errorArea} setErrorArea={setErrorArea} />
      )}
      {taskIsFailed && (
        <TaskFailModal taskIsFailed={taskIsFailed} setTaskIsFailed={setTaskIsFailed} />
      )}
      <Box sx={{ margin: 2 }}>
        <Grid container spacing={2} alignItems="flex-end" justify="center">
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Calculate my field&apos;s Biomass
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h8" gutterBottom>
              You can change your planting date and termination dates below and recalculate the biomass value.
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Datebox />
          </Grid>
          <Grid
            item
            xs={12}
            md={2}
            display="flex"
            justifyContent="center"
          >
            <Box display="flex" order="2px solid blue">
              <Stack direction="column" spacing={0}>
                {loading && (<LinearProgress />)}
                <Button
                  variant="outlined"
                  color={errorArea ? 'warning' : 'success'}
                  disabled={mapPolygon.length !== 1 || loading}
                  onClick={handleButton}
                >
                  <div style={{ fontWeight: 900 }}>Calculate Biomass</div>
                </Button>
              </Stack>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            md={2}
            display="flex"
            justifyContent="center"
          >
            {biomassTotalValue
              && (
                <Box sx={{ border: 1, maxWidth: 200, padding: '0.3rem 1.2rem' }}>
                  <Stack direction="column" justifyContent="center" alignItems="center">
                    <Typography variant="h8" gutterBottom>
                      {biomassTotalValue}
                    </Typography>
                    <Typography variant="h8" gutterBottom>
                      {unit === 'lb/ac' ? 'lb/ac' : 'kg/ha'}
                    </Typography>
                  </Stack>
                </Box>
              )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  ); // Biomass
};
export default Biomass;
