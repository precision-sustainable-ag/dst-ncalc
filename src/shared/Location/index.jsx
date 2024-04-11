/* eslint-disable operator-linebreak */
import React from 'react';
import { useNavigate } from 'react-router-dom';
// import * as turf from '@turf/turf';
// import axios from 'axios';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { useSelector } from 'react-redux';
import { LinearProgress } from '@mui/material';
import BiomassMap from '../Map/BiomassMap';
// import NitrogenMap from '../Map/NitrogenMap';
import Input from '../Inputs';
import Help from '../Help';
import { get } from '../../store/Store';
import NavButton from '../Navigate/NavButton';
import useFetchHLS from '../../hooks/useFetchHLS';
import Datebox from '../Biomass/Datebox';

const CustomizedAccordion = styled(Accordion)(() => ({
  '&.MuiPaper-root': {
    borderRadius: '1rem',
    boxShadow: 'none',
  },
  boxShadow: 'none',
}));

const nextButtonBadgeContent = () => (
  <Tooltip title="No polygon is drawn">
    <Typography>?</Typography>
  </Tooltip>
);

const Location = ({ barebone = false }) => {
  const navigate = useNavigate();
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const biomassFetchIsLoading = useSelector(get.biomassFetchIsLoading);

  useFetchHLS();

  return (
    <Box sx={{ width: '100%', padding: '0rem' }}>
      <Box mb={-2}>
        <CustomizedAccordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            {!barebone && (
              <Typography variant="h5" gutterBottom>
                Where is your Field located?
              </Typography>
            )}
          </AccordionSummary>
          <AccordionDetails>
            <Stack mb={1}>
              <Typography variant="h8" gutterBottom>
                Enter your address or zip code to determine your field&apos;s
                location. You can then zoom in and click to pinpoint it on the
                map. If you know your exact coordinates, you can enter them in
                search bar separated by comma (ex. 37.7, -80.2 ).
              </Typography>
              {isSatelliteMode && (
                <Typography variant="h8" gutterBottom pt={1}>
                  Specify your field&apos;s boundary on the map using the
                  drawing tool.
                </Typography>
              )}
            </Stack>
            <Box mb={2}>
              <Input
                label="Name your Field (optional)"
                id="field"
                autoComplete="off"
                style={{ height: '2rem', minWidth: '13rem' }}
              />
              <Help />
            </Box>
            <Stack mt={5} gap={1}>
              {isSatelliteMode && (
                <Typography variant="h8" gutterBottom>
                  Specify your crop&apos;s planting and termination dates.
                </Typography>
              )}
              <Datebox />
            </Stack>
          </AccordionDetails>
        </CustomizedAccordion>
      </Box>
      <Box sx={{ margin: '2rem 0rem' }}>
        <Paper sx={{ padding: '1rem', borderRadius: '1rem' }}>
          {biomassFetchIsLoading && (<LinearProgress />)}
          <BiomassMap variant="biomass" />
          {!barebone && (
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
              <NavButton onClick={() => navigate('/home')}>BACK</NavButton>
              <Badge
                color="primary"
                invisible={
                  !isSatelliteMode || (isSatelliteMode)
                }
                badgeContent={nextButtonBadgeContent()}
              >
                <NavButton
                  disabled={isSatelliteMode}
                  onClick={() => {
                    if (isSatelliteMode) {
                      // calcBiomass();
                      navigate('/covercrop');
                    } else {
                      navigate('/soil');
                    }
                    return null;
                  }}
                >
                  NEXT
                </NavButton>
              </Badge>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}; // Location

export default Location;
