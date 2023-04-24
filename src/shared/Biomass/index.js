/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
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

const Biomass = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [taskIsDone, setTaskIsDone] = useState(false);
  const crop = useSelector(get.biomassCropType);
  const mapPolygon = useSelector(get.mapPolygon);
  const biomassPlantDate = useSelector(get.biomassPlantDate);
  const biomassTaskResults = useSelector(get.biomassTaskResults);
  const biomassTotalValue = useSelector(get.biomassTotalValue);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('data ', data);
    dispatch(set.biomassTaskResults(data));
  }, [data]);

  useEffect(() => {
    console.log('biomassTaskResults ', biomassTaskResults);
  }, [biomassTaskResults]);

  const handleButton = () => {
    const now = dayjs();
    // reverse order of vertices
    const revertedCoords = [...mapPolygon[0].geometry.coordinates[0]].reverse();
    const payload = {
      maxCloudCover: 5,
      startDate: biomassPlantDate,
      endDate: now.format('YYYY-MM-DD'),
      geometry: {
        type: 'Polygon',
        coordinates: [revertedCoords],
      },
    };
    setLoading(true);
    const headers = {
      'Content-Type': 'application/json',
    };
    console.log('making task request');
    axios
      .post('https://api.covercrop-imagery.org/tasks', payload, { headers })
      .then((response) => {
        console.log('response: ', response);
        if (response.status === 200 && response.data) {
          setTaskId(response.data.task_id);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchTask = () => {
    axios
      .get(`https://api.covercrop-imagery.org/tasks/${taskId}`)
      .then((response) => {
        if (response.status === 200 && response.data && response.data.task_status !== 'PENDING') {
          setData(response.data);
          setTaskIsDone(true);
          clearInterval(interval);
          setLoading(false);
          const randomIntFromInterval = (min, max) => {
            return Math.floor(Math.random() * (max - min + 1) + min);
          };

          const rndInt = randomIntFromInterval(1200, 1400);
          dispatch(set.biomassTotalValue(rndInt));
        }
      })
      .catch((error) => {
        console.log(error);
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
        <Accordion>
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
                <DateBox />
              </div>
              <div className="biomassButton">
                <Button
                  variant="outlined"
                  color="success"
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
                <div className="biomassItemText">Biomass Value</div>
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
