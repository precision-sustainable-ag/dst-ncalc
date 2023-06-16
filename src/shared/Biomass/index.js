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

function arrayMean(ary) {
  const index = {};
  let i;
  let label;
  let value;
  const result = [[], []];

  for (i = 0; i < ary[0].length; i++) {
    label = ary[0][i];
    value = ary[1][i];
    if (!(label in index)) {
      index[label] = { sum: 0, occur: 0 };
    }
    index[label].sum += value;
    index[label].occur += 1;
  }
  // eslint-disable-next-line no-restricted-syntax
  for (i in index) {
    // eslint-disable-next-line no-prototype-builtins
    if (index.hasOwnProperty(i)) {
      result[0].push(parseInt(i, 10));
      result[1].push(index[i].occur > 0 ? index[i].sum / index[i].occur : 0);
    }
  }
  return result;
}

const Biomass = () => {
  const [loading, setLoading] = useState(false);
  const [errorArea, setErrorArea] = useState(false);
  const [data, setData] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [taskIsDone, setTaskIsDone] = useState(false);
  const crop = useSelector(get.biomassCropType);
  const mapPolygon = useSelector(get.mapPolygon);
  const biomassPlantDate = useSelector(get.biomassPlantDate);
  const biomassTerminationDate = useSelector(get.biomassTerminationDate);
  const biomassTaskResults = useSelector(get.biomassTaskResults);
  const biomassTotalValue = useSelector(get.biomassTotalValue);
  const dispatch = useDispatch();

  useEffect(() => {
    // console.log('data ', data);
    dispatch(set.biomassTaskResults(data));
  }, [data]);

  useEffect(() => {
    // console.log('biomassTaskResults ', biomassTaskResults);
  }, [biomassTaskResults]);

  useEffect(() => {
    // console.log('errorArea ', errorArea);
  }, [errorArea]);

  const handleButton = () => {
    let area;
    // reverse order of vertices
    if (mapPolygon.length > 0) {
      area = 0.000247105 * turf.area(turf.polygon(mapPolygon[0].geometry.coordinates));
      // console.log('area', area);
    }

    if (area > 1000) {
      setErrorArea(true);
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
      console.log('payload ', payload);
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
        if (response.status === 200 && response.data && response.data.task_status !== 'PENDING') {
          setData(response.data);
          setTaskIsDone(true);
          clearInterval(interval);
          setLoading(false);
          const biomassAVG = arrayMean(data.data_array);
          console.log('biomassAVG ', biomassAVG);
          dispatch(set.biomassTotalValue(biomassAVG));
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
    setTaskIsDone(false);
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
                1000 Acres.
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
                    <div>{biomassTotalValue}</div>
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
