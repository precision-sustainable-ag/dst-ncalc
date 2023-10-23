import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import LensIcon from '@mui/icons-material/Lens';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import { get, set } from '../../store/Store';

const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: 'IBM Plex Sans',
      textTransform: 'none',
      fontSize: '1rem',
    },
  },
});

const BullettedText = ({ children }) => (
  <ListItem sx={{ m: 0, p: 0, paddingBottom: '0.2rem', paddingLeft: '1rem' }}>
    <ListItemIcon sx={{ minWidth: '1rem' }}>
      <LensIcon sx={{ fontSize: '0.5rem' }} />
    </ListItemIcon>
    {children}
  </ListItem>
);

const About = () => {
  const dispatch = useDispatch();
  const openAboutModal = useSelector(get.openAboutModal);
  const handleCloseModal = () => dispatch(set.openAboutModal(false));

  return (
    <Modal
      open={openAboutModal}
      onClose={handleCloseModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      style={{
        display: 'flex',
        top: '0%',
        left: '10%',
        width: '80vw',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper>
        <ThemeProvider theme={theme}>
          <Box
            sx={{
              padding: '2rem 2rem',
              maxHeight: '90vh',
              overflow: 'auto',
              fontFamily: 'monospace !important',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '5%',
                right: 0,
                display: 'flex',
                flexDirection: 'row',
                minWidth: '100%',
                justifyContent: 'flex-end',
                maxHeight: 'auto',
                p: 0,
                m: 0,
              }}
            >
              <Button size="small" onClick={handleCloseModal}>
                <CancelPresentationIcon sx={{ fontSize: '2rem' }} />
              </Button>
            </Box>
            <Typography sx={{ paddingBottom: '1rem', fontSize: '1.2rem', fontWeight: 700 }} id="modal-modal-title" variant="h5" component="h2">
              CC-NCALC estimates:
            </Typography>
            <List sx={{ p: 0 }}>
              <BullettedText>
                <Typography variant="body1" component="p">
                  How much N is released from decomposing residues over time,
                </Typography>
              </BullettedText>
              <BullettedText>
                <Typography variant="body1" component="p">
                  The amount of undecomposed residue remaining over time,
                </Typography>
              </BullettedText>
              <BullettedText>
                <Typography variant="body1" component="p">
                  Corn N uptake based on yield goal, and
                </Typography>
              </BullettedText>
              <BullettedText>
                <Typography variant="body1" component="p">
                  N fertilizer recommendations for the subsequent cash crop that accounts for cover crop N credit.
                </Typography>
              </BullettedText>
            </List>
            <Typography sx={{ paddingY: '1rem', fontSize: '1.2rem', fontWeight: 700 }} id="modal-modal-title" variant="h5" component="h2">
              Background:
            </Typography>
            <Typography id="modal-modal-title" variant="body1" component="h2">
              Cover crops influence nitrogen (N) management to subsequent cash crops.
              Some of the N taken up or fixed by the cover crops becomes available over the cash crop growing season following termination.
              Estimating the rate of N release is challenging. The
              <strong> Cover Crop N Calculator </strong>
              provides a user-friendly approach to estimate decay of cover crop residues and release of N for
              offsetting N fertilizer inputs. This tool was developed for farmers and agricultural professionals.
            </Typography>
            <Typography id="modal-modal-title" variant="body1" component="h2">
              The N calculator is adapted from the original CERES-N (N subroutine of the Crop Environment REsource Synthesis) sub-model.
              Data from controlled laboratory experiments and on-farm cover crop decomposition studies across diverse environments were used in its
              development.
              Depending on residue placement, the calculator uses soil moisture and soil temperature (for incorporated residues) or residue water
              potential and air temperature (for surface residues) to adjust decomposition rates.
            </Typography>
            <Typography sx={{ paddingY: '1rem', fontSize: '1.2rem', fontWeight: 700 }} id="modal-modal-title" variant="h5" component="h2">
              Input data requirements:
            </Typography>
            <Typography sx={{ paddingBottom: '0.7rem' }} id="modal-modal-title" variant="body1" component="h2">
              Based on field location (latitude and longitude), the calculator automatically imports:
            </Typography>
            <List sx={{ p: 0 }}>
              <BullettedText>
                <Typography variant="body1" component="p">
                  Local soil properties (organic matter and bulk density) from the NRCS&apos;s Soil Survey Geographic database
                  <a target="_blank" rel="noreferrer" href="https://ssurgo.covercrop-data.org/">(SSURGO),</a>
                </Typography>
              </BullettedText>
              <BullettedText>
                <Typography variant="body1" component="p">
                  Daily soil moisture and soil temperature from
                  <a target="_blank" rel="noreferrer" href="https://docs.clearag.com/documentation/Soil_Conditions/Soil_Conditions/latest">Iteris,</a>
                  and
                </Typography>
              </BullettedText>
              <BullettedText>
                <Typography variant="body1" component="p">
                  Hourly weather (air relative humidity, air temperature, and rain) data from a
                  <a target="_blank" rel="noreferrer" href="https://weather.covercrop-data.org/">weather API</a>
                  to estimate surface residue environmental conditions.
                </Typography>
              </BullettedText>
            </List>
            <Typography sx={{ paddingY: '0.7rem' }} id="modal-modal-title" variant="body1" component="h2">
              At a minimum, users need to provide:
            </Typography>
            <BullettedText>
              <Typography variant="body1" component="p">
                Field location,
              </Typography>
            </BullettedText>
            <BullettedText>
              <Typography variant="body1" component="p">
                Cover crop biomass on a dry weight basis,
              </Typography>
            </BullettedText>
            <BullettedText>
              <Typography variant="body1" component="p">
                Cover crop N concentration.
              </Typography>
            </BullettedText>
            <Typography sx={{ paddingY: '0.7rem' }} id="modal-modal-title" variant="body1" component="h2">
              If available, users should also provide:
            </Typography>
            <BullettedText>
              <Typography variant="body1" component="p">
                Cover crop residue chemistry (i.e., Carbohydrate, Holo-cellulose, and lignin concentrations).
              </Typography>
            </BullettedText>
            <BullettedText>
              <Typography variant="body1" component="p">
                Cover crop water content at termination.
              </Typography>
            </BullettedText>
            <Typography sx={{ paddingY: '0.7rem' }} id="modal-modal-title" variant="body1" component="h6">
              If these data are unavailable, the program will estimate cover crop residue chemistry
              based on N concentrations and will use a default value for cover crop water content at termination.
            </Typography>
            <Typography sx={{ paddingY: '0.7rem' }} id="modal-modal-title" variant="body1" component="h6" sx={{ fontWeight: 'bold' }}>
              <strong><em>CC-NCALC uses real-time weather data and five year historic averages for days where data are not yet available.</em></strong>
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: '100%',
                paddingY: '1rem',
              }}
            >
              <Button size='small' variant='contained' sx={{ backgroundColor: 'green' }}>
                <Typography sx={{ fontWeight: 900 }}>
                  GET STARTED
                </Typography>
              </Button>
            </Box>
            <Typography sx={{ paddingY: '0.7rem', fontSize: '14px' }} id="modal-modal-title" variant="body1" component="h6">
              For more information about
              <strong> Precision Sustainable Agriculture </strong>
              projects, please
              visit <a href="https://precisionsustainableag.org/">https://precisionsustainableag.org/.</a>
            </Typography>
          </Box>
        </ThemeProvider>
      </Paper>
    </Modal >
  );
}; // About

About.showInMenu = false;

export default About;
