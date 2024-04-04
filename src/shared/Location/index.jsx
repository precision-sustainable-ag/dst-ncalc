import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as turf from '@turf/turf';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Badge,
  Box,
  Paper,
  Stack,
  Tooltip,
  styled,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import BiomassMap from '../Map/BiomassMap';
// import NitrogenMap from '../Map/NitrogenMap';
import Input from '../Inputs';
import Help from '../Help';
import {
  get, set,
} from '../../store/Store';
import NavButton from '../Navigate/NavButton';

const HLS_API_URL = 'https://covercrop-imagery.org';

const CustomizedAccordion = styled(Accordion)(() => ({
  '&.MuiPaper-root': {
    borderRadius: '1rem',
    boxShadow: 'none',
  },
  // padding: '1rem',
  boxShadow: 'none',
}));

const nextButtonBadgeContent = () => (
  <Tooltip title="No polygon is drawn">
    <Typography>?</Typography>
  </Tooltip>
);

const nextButtonHelpStyle = {
  borderRadius: '0.5rem',
  backgroundColor: 'cyan',
};

const Location = () => {
  const navigate = useNavigate();
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const mapPolygon = useSelector(get.mapPolygon);
  const coverCropPlantingDate = useSelector(get.coverCropPlantingDate);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const dispatch = useDispatch();

  const calcBiomass = () => {
    dispatch(set.biomassTaskResults({}));
    dispatch(set.biomassTaskIsDone(false));
    // setData(null);
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
            dispatch(set.biomassTaskId(response.data.task_id));
          }
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(error);
        });
    }
  };

  return (
    <Box sx={{ width: { xs: '95%', sm: '90%', lg: '70%' } }}>
      <Box mb={-2}>
        <CustomizedAccordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography variant="h5" gutterBottom>
              Where is your Field located?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack mb={1}>
              <Typography variant="h8" gutterBottom>
                Enter your address or zip code to determine your field&apos;s location. You can then
                zoom in and click to pinpoint it on the map. If you know your exact coordinates, you
                can enter them in search bar separated by comma (ex. 37.7, -80.2 ).
              </Typography>
              {
                isSatelliteMode && (
                  <Typography variant="h8" gutterBottom pt={1}>
                    Specify your field&apos;s boundary on the map using the drawing tool.
                  </Typography>
                )
              }
            </Stack>
            <Box mb={2}>
              <Input
                label="Name your Field (optional)"
                id="field"
                autoComplete="off"
                style={{ height: '2rem', minWidth: '13rem' }}
              />
              <Help className="moveLeft">
                <p>
                  This input is optional. If you enter a field name, you will be able to rerun the
                  model on this computer without re-entering your data.
                </p>
                <p>Notes:</p>
                <ul>
                  <li>
                    If you have multiple fields, you will be able to select them from a drop-down
                    menu in the upper-right.
                  </li>
                  <li>
                    Your information is stored on your computer only. It will not be uploaded to a
                    server.
                  </li>
                  <li>
                    If you clear your browser&apos;s cache, you will need to re-enter your data the
                    next time you run the program.
                  </li>
                </ul>
              </Help>
            </Box>
          </AccordionDetails>
        </CustomizedAccordion>
      </Box>
      <Box sx={{ margin: '2rem 0rem' }}>
        <Paper sx={{ padding: '1rem', borderRadius: '1rem' }}>
          <BiomassMap variant="biomass" />
          <Box
            mt={2}
            sx={{
              justifyContent: 'space-around',
              alignItems: 'space-between',
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <NavButton onClick={() => navigate('/home')}>
              BACK
            </NavButton>
            <Badge
              color="primary"
              invisible={mapPolygon.length > 0}
              badgeContent={nextButtonBadgeContent()}
            >
              <NavButton
                disabled={mapPolygon.length === 0}
                onClick={() => {
                  calcBiomass();
                  // navigate('/soil');
                  return null;
                }}
              >
                NEXT
              </NavButton>
            </Badge>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}; // Location

export default Location;
