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
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import DateBox from '../DateBox';
import { get, set } from '../../store/Store';

import './styles.scss';

let interval;

const arrayAverage = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;

const Biomass = () => {
  const [loading, setLoading] = useState(false);
  const [errorArea, setErrorArea] = useState(false);
  const [data, setData] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [taskIsDone, setTaskIsDone] = useState(false);
  const [taskIsFailed, setTaskIsFailed] = useState(false);
  const crop = useSelector(get.biomassCropType);
  const mapPolygon = useSelector(get.mapPolygon);
  const biomassPlantDate = useSelector(get.biomassPlantDate);
  const biomassTerminationDate = useSelector(get.biomassTerminationDate);
  // const biomassTaskResults = useSelector(get.biomassTaskResults);
  const biomassTotalValue = useSelector(get.biomassTotalValue);
  const dispatch = useDispatch();

  useEffect(() => {
    if (data && data.task_result) {
      const values = JSON.parse(data.task_result.replace(/\bNaN\b/g, 'null'));
      // eslint-disable-next-line no-console
      const rasterObject = { data_array: values.data_array, bbox: values.bbox };
      const flattenedBiomass = rasterObject.data_array.flat(1).filter((el) => el !== 0);
      const biomassAVG = arrayAverage(flattenedBiomass);
      dispatch(set.biomassTotalValue(Math.round(biomassAVG, 0)));
      dispatch(set.biomassTaskResults(rasterObject));
    }
  }, [data]);

  const handleButton = () => {
    dispatch(set.biomassTaskResults({}));
    setTaskIsDone(false);
    setData(null);
    let area;
    area = 0;
    // reverse order of vertices
    if (mapPolygon.length > 0) {
      area = 0.000247105 * turf.area(turf.polygon(mapPolygon[0].geometry.coordinates));
      // console.log('area', area);
    }

    if (area > 10000) {
      setErrorArea(true);
      dispatch(set.mapPolygon([]));
    } else {
      const revertedCoords = [...mapPolygon[0].geometry.coordinates[0]].reverse();
      const payload = {
        maxCloudCover: 5,
        startDate: biomassPlantDate,
        endDate: biomassTerminationDate,
        geometry: {
          type: 'Polygon',
          coordinates: [revertedCoords],
        },
      };
      setLoading(true);
      const headers = {
        'Content-Type': 'application/json',
      };
      // console.log('making task request');
      axios
        .post('https://covercrop-imagery.org/tasks', payload, { headers })
        .then((response) => {
          // console.log('response: ', response);
          if (response.status === 200 && response.data) {
            setTaskId(response.data.task_id);
          }
        })
        .catch(() => {
          // console.log(error);
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
        // console.log(error);
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

  const handleChange = (event) => {
    dispatch(set.biomassCropType(event.target.value));
  };
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
              Specify your field&apos;s boundary on the map using the drawing tool and input your
              planting date and crop type in the boxes below.
            </Typography>
            <div className="biomassControlWrapper">
              <div className="biomassDate">
                <div className="biomassItemText">Type of Crop</div>
                <Box sx={{ minWidth: 120 }}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Crop</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      label="Crop"
                      id="demo-simple-select"
                      value={crop}
                      onChange={handleChange}
                    >
                      <MenuItem value="Wheat">Wheat</MenuItem>
                      <MenuItem value="Bean">Bean</MenuItem>
                      <MenuItem value="Grass">Grass</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </div>
              <div className="biomassDate">
                <div className="biomassItemText">Planting Start Date</div>
                <DateBox date={biomassPlantDate} dateSetter={set.biomassPlantDate} />
              </div>
              <div className="biomassDate">
                <div className="biomassItemText">Planting Termination Date</div>
                <DateBox date={biomassTerminationDate} dateSetter={set.biomassTerminationDate} />
              </div>
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
              <div className="biomassResults">
                <div className="biomassItemText">Average Biomass</div>
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
            </div>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  ); // Biomass
};
export default Biomass;
