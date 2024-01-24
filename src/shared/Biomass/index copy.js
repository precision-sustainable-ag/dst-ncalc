/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import * as turf from '@turf/turf';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import { get, set } from '../../store/Store';

let interval;

const arrayAverage = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;

const Biomass = ({ minified = false }) => {
  const [loading, setLoading] = useState(false);
  const [errorArea, setErrorArea] = useState(false);
  const [data, setData] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [taskIsDone, setTaskIsDone] = useState(false);
  const [taskIsFailed, setTaskIsFailed] = useState(false);
  const mapPolygon = useSelector(get.mapPolygon);
  const coverCropPlantDate = useSelector(get.coverCropPlantDate);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const biomassTotalValue = useSelector(get.biomassTotalValue);
  const biomassTaskResults = useSelector(get.biomassTaskResults);
  const dispatch = useDispatch();

  useEffect(() => {
    if (data && data.task_result) {
      const values = JSON.parse(data.task_result.replace(/\bNaN\b/g, 'null'));
      // eslint-disable-next-line no-console
      const rasterObject = { data_array: values.data_array, bbox: values.bbox };
      dispatch(set.biomassTaskResults(rasterObject));
    }
  }, [data]);

  useEffect(() => {
    if (biomassTaskResults && biomassTaskResults.data_array) {
      const flattenedBiomass = biomassTaskResults.data_array.flat(1).filter((el) => el !== 0);
      const biomassAVG = arrayAverage(flattenedBiomass);
      dispatch(set.biomassTotalValue(Math.round(biomassAVG, 0)));
    }
  }, [biomassTaskResults]);

  useEffect(() => {
    dispatch(set.cashCropPlantingDate(coverCropPlantDate));
    dispatch(set.coverCropTerminationDate(coverCropTerminationDate));
  }, [coverCropPlantDate, coverCropTerminationDate]);

  useEffect(() => {
    if (biomassTotalValue) {
      dispatch(set.biomass(biomassTotalValue));
    }
  }, [biomassTotalValue]);

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
        startDate: coverCropPlantDate,
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

  // const handleChange = (event) => {
  //   dispatch(set.biomassCropType(event.target.value));
  // };
  return (
    <div className="biomassWrapper">
      <div className="biomassTextWrapper">
        {errorArea && (
          <Dialog
            open={errorArea}
            onClose={() => {
              setErrorArea(false);
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">Large Area Warning!</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                The area selected is too large to calculate. Please select a smaller region under
                10000 Acres. Please delete the current polygon and draw a new one.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setErrorArea(false);
                }}
                autoFocus
              >
                close
              </Button>
            </DialogActions>
          </Dialog>
        )}
        {taskIsFailed && (
          <Dialog
            open={taskIsFailed}
            onClose={() => {
              setTaskIsFailed(false);
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">Server Failed</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Task failed to complete. Please try again.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setTaskIsFailed(false);
                }}
                autoFocus
              >
                close
              </Button>
            </DialogActions>
          </Dialog>
        )}
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography variant="h5" gutterBottom>
              Calculate my field&apos;s Biomass
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h8" gutterBottom>
              You can change your planting date and termination dates below and recalculate the biomass value.
            </Typography>
            <div className="biomassControlWrapper">
              <DateBox minified={minified} />
              <div className="biomassButton">
                <Button
                  variant="outlined"
                  color={errorArea ? 'warning' : 'success'}
                  disabled={mapPolygon.length !== 1 || loading}
                  onClick={handleButton}
                >
                  <div style={{ fontWeight: 900 }}>Calculate Biomass</div>
                </Button>
                {loading && (
                  <div className="biomassLoading">
                    <LinearProgress />
                  </div>
                )}
              </div>
              {!minified && (
                <div className="biomassResults">
                  <div className="biomassItemText">Average Dry Biomass</div>
                  {biomassTotalValue && (
                    <Box sx={{ border: 1 }}>
                      <div>
                        {biomassTotalValue}
                        &nbsp;
                        Kg/Ha
                      </div>
                    </Box>
                  )}
                </div>
              )}
            </div>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  ); // Biomass
};
export default Biomass;
