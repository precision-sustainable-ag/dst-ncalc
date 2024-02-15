import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Box,
  Typography,
  styled,
  Paper,
  Stack,
  Modal,
} from '@mui/material';
import CoverCrops from './CoverCrops';
import { get, set } from '../../store/Store';
import Input from '../../shared/Inputs';
import Myslider from '../../shared/Slider';
import Help from '../../shared/Help';
import Biomass from '../../shared/Biomass';
import NavButton from '../../shared/Navigate/NavButton';

const CustomInputText = styled(Typography)({
  fontSize: '1.2rem',
  fontWeight: 400,
  color: '#4f6b14',
  marginTop: '1.3rem',
  marginBottom: '0.2rem',
});

const CoverCropFirst = () => {
  const dispatch = useDispatch();
  const maxBiomass = useSelector(get.maxBiomass);
  const coverCrop = useSelector(get.coverCrop);
  const max = coverCrop.length ? coverCrop.map((s) => maxBiomass[s]).sort((a, b) => b - a)[0] || 15000 : 15000;
  const freshMax = max * 4 || 30000;
  const biomass = useSelector(get.biomass);
  const unit = useSelector(get.unit);
  const freshBiomass = useSelector(get.freshBiomass);
  const species = useSelector(get.species);
  const biomassTotalValue = useSelector(get.biomassTotalValue);
  const navigate = useNavigate();
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const mapPolygon = useSelector(get.mapPolygon);
  const [open, setOpen] = React.useState(true);

  if (!species.Grass) {
    return '';
  }

  let warningText;
  if (coverCrop.length > 1) {
    warningText = ' for these particular species';
  } else if (coverCrop.length) {
    warningText = ' for this particular species';
  } else {
    warningText = '';
  }

  return (
    <Box
      sx={{
        justifyContent: 'center',
        margin: '0% 5% 0% 5%',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '1rem',
        flexDirection: 'column',
        width: {
          xs: '100%',
          sm: '100%',
          md: '90%',
          lg: '70%',
          xl: '60%',
        },
      }}
    >
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#fff',
          padding: '1rem',
          borderRadius: '1rem',
          width: '100%',
        }}
      >
        <Typography variant="h4">Tell us about your Cover Crop</Typography>
        <Stack direction="column" spacing={2} mt={2}>
          <CustomInputText>Cover Crop Species:</CustomInputText>
          <CoverCrops />
          {
            isSatelliteMode ? (
              <Paper mt={2}>
                <Biomass minified={false} />
                {mapPolygon.length === 0 && (
                  <Modal
                    open={open}
                    onClose={() => setOpen(false)}
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
                    <Paper
                      sx={{
                        borderRadius: '2rem',
                      }}
                    >
                      <Box
                        sx={{
                          padding: '0rem 2rem',
                          overflow: 'auto',
                          fontFamily: 'monospace !important',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            maxHeight: 'auto',
                            padding: '2rem',
                            borderRadius: '1rem',
                          }}
                        >
                          <Typography variant="h5">
                            You haven&apos;t drawn a field on the Location tab yet.
                          </Typography>
                          <Typography variant="h5">
                            Please draw a field on the map to continue.
                          </Typography>
                          <Button
                            sx={{
                              borderRadius: '1rem',
                              fontSize: '18px',
                              fontWeight: 900,
                              marginTop: '2rem',

                            }}
                            onClick={() => navigate('/location')}
                            variant="outlined"
                            color="warning"
                          >
                            Go to Location Tab
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  </Modal>
                )}
              </Paper>
            ) : (
              <>
                <CustomInputText>Cover Crop Termination Date:</CustomInputText>
                <Input type="date" id="coverCropTerminationDate" />
              </>
            )
          }
          {isSatelliteMode ? '' : (
            <>
              <Box mt={1} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <CustomInputText>Dry Biomass </CustomInputText>
                <Help>
                  <p>The amount of cover crop biomass on a dry weight basis.</p>
                  <p>
                    For details on cover crop biomass sampling and taking a representative sub-sample for quality analysis, please refer to
                    <a tabIndex="-1" target="_blank" rel="noreferrer" href="https://extension.uga.edu/publications/detail.html?number=C1077">here</a>
                    .
                  </p>
                </Help>
                :
                <RadioGroup row aria-label="position" name="position" style={{ display: 'inline-block', marginLeft: '1em' }}>
                  <FormControlLabel
                    value="lb/ac"
                    control={<Radio id="unit" checked={unit === 'lb/ac'} />}
                    onChange={() => dispatch(set.unit('lb/ac'))}
                    label="lb/ac"
                  />
                  <FormControlLabel
                    value="kg/ha"
                    control={<Radio id="unit" checked={unit === 'kg/ha'} />}
                    onChange={() => dispatch(set.unit('kg/ha'))}
                    label="kg/ha"
                  />
                </RadioGroup>
              </Box>

              <Myslider
                id="biomass"
                min={0}
                max={max}
              />

              {+biomass > +max
                && (
                  <p className="warning">
                    This biomass seems too high
                    {warningText}
                    .
                    <br />
                    Please make sure the biomass entered is on a dry matter basis.
                  </p>
                )}

              <Box mt={2} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <CustomInputText>Fresh Biomass </CustomInputText>
                <Help>
                  <p>The amount of cover crop biomass on a wet weight basis.</p>
                  <p>
                    For details on cover crop biomass sampling and taking a representative sub-sample for quality analysis, please refer to
                    <a tabIndex="-1" target="_blank" rel="noreferrer" href="https://extension.uga.edu/publications/detail.html?number=C1077">here</a>
                    .
                  </p>
                </Help>
              </Box>

              <Myslider
                id="freshBiomass"
                min={0}
                max={freshMax}
              />

              {+freshBiomass > +freshMax
                && (
                  <p className="warning">
                    This biomass seems too high
                    {warningText}
                    .
                    <br />
                    Please make sure the biomass entered is on a fresh matter basis.
                  </p>
                )}

              <Box mt={2} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <CustomInputText>Cover Crop Water Content at Termination (g water/g dry biomass)</CustomInputText>
                <Help>
                  <p>Use the following calculation to adjust default values:</p>
                  <p>Cover Crop Water Content = (Total fresh weight - Total dry weight)/(Total dry weight)</p>
                </Help>
                :
              </Box>
              <Myslider
                id="lwc"
                min={0}
                max={10}
                step={0.1}
              />
            </>
          )}
        </Stack>
        <Box
          sx={{
            justifyContent: 'space-around',
            alignItems: 'space-between',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
          }}
          mt={4}
        >
          <NavButton onClick={() => navigate('/soil')}>
            BACK
          </NavButton>
          <NavButton
            onClick={() => navigate('/covercrop2')}
            disabled={!isSatelliteMode ? false : (!biomassTotalValue)}
          >
            NEXT
          </NavButton>
        </Box>
      </Box>
    </Box>
  );
}; // CoverCropFirst
CoverCropFirst.desc = 'Cover Crop';

export default CoverCropFirst;
