import React from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Paper,
  Stack,
  styled,
} from '@mui/material';
import { useSelector } from 'react-redux';
import Map from '../Map';
import Input from '../Inputs';
import Help from '../Help';
import {
  get,
} from '../../store/Store';
import NavButton from '../Navigate/NavButton';

const CustomizedAccordion = styled(Accordion)(() => ({
  '&.MuiPaper-root': {
    borderRadius: '1rem',
    boxShadow: 'none',
  },
  // padding: '1rem',
  boxShadow: 'none',
}));

const Location = () => {
  const navigate = useNavigate();
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  // const biomassTaskResults = useSelector(get.biomassTaskResults);
  // console.log('biomassTaskResults', biomassTaskResults);

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
          <Map variant="biomass" />
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
            <NavButton onClick={() => navigate('/soil')}>
              NEXT
            </NavButton>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}; // Location

export default Location;
