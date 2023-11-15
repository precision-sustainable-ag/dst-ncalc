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
} from '@mui/material';

import { get, set } from '../../store/Store';
import Input from '../../shared/Inputs';
import Myslider from '../../shared/Slider';
import Help from '../../shared/Help';
import Biomass from '../../shared/Biomass';

const CustomInputText = styled(Typography)({
  fontSize: '1.2rem',
  fontWeight: 400,
  color: '#4f6b14',
  marginTop: '1.3rem',
  marginBottom: '0.2rem',
});

const CoverCrops = () => {
  const species = useSelector(get.species);
  return (
    <Input
      multiple
      id="coverCrop"
      autoFocus
      groupBy={
        (option) => {
          let out;
          if (species.Brassica.includes(option)) {
            out = 'Brassica';
          } else if (species.Broadleaf.includes(option)) {
            out = 'Broadleaf';
          } else if (species.Grass.includes(option)) {
            out = 'Grass';
          } else if (species.Legume.includes(option)) {
            out = 'Legume';
          } else {
            out = 'ERROR';
          }
          return out;
        }
      }
      options={[
        ...species.Grass,
        ...species.Legume,
        ...species.Brassica,
        ...species.Broadleaf,
      ]}
      placeholder="Select one or more cover crops"
    />
  );
}; // CoverCrops

const CoverCrop1 = () => {
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
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '1rem',
        flexDirection: 'column',
        width: {
          xs: '100%',
          sm: '90%',
          md: '80%',
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
        <Box mt={0}>
          <CustomInputText>Cover Crop Species:</CustomInputText>
          <CoverCrops />

          {
            isSatelliteMode ? (
              <Paper mt={2}>
                <Biomass minified={false} />
              </Paper>
            ) : (
              <>
                <CustomInputText>Cover Crop Termination Date:</CustomInputText>
                <Input type="date" id="killDate" />
              </>
            )
          }
          {isSatelliteMode ? '' : (
            <>
              <Box mt={2} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
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
        </Box>
        <Box
          sx={{
            justifyContent: 'space-around',
            alignItems: 'space-between',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
          }}
          mt={6}
        >
          <Button
            sx={{ borderRadius: '1rem', fontSize: '22px', fontWeight: 900 }}
            onClick={() => navigate('/soil')}
            variant="contained"
            color="success"
          >
            BACK
          </Button>
          <Button
            sx={{ borderRadius: '1rem', fontSize: '22px', fontWeight: 900 }}
            onClick={() => navigate('/covercrop2')}
            variant="contained"
            color="success"
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            disabled={!isSatelliteMode ? false : (!biomassTotalValue)}
          >
            NEXT
          </Button>
        </Box>
      </Box>
    </Box>
  );
}; // CoverCrop1

const CoverCrop2 = () => {
  const N = useSelector(get.N);
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '1rem',
        flexDirection: 'column',
        width: {
          xs: '100%',
          sm: '90%',
          md: '80%',
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
        <Typography variant="h4">Tell us about your Cover Crop Quality</Typography>

        <Box sx={{ width: '90%' }}>
          <Box mt={2} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <CustomInputText>Nitrogen (%)</CustomInputText>
            <Help>
              Cover crop nitrogen concentration based on lab results.
            </Help>
            :
          </Box>
          <Myslider
            id="N"
            min={0}
            max={6}
            step={0.1}
          />
          {N ? <p className="note">Adjust default values below based on lab results.</p> : ''}
          <Box mt={2} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <CustomInputText>Carbohydrates (%)</CustomInputText>
            <Help>
              <p>
                Non-structural labile carbohydrate concentration based on lab results. This represents the most
                readily decomposable C constituents in plant materials.
              </p>
              <p>The default value is based on the nitrogen concentration.</p>
              <p>If you have the raw data from near infra-red reflectance spectroscopy (NIRS) analysis, use the following equation:</p>
              <p>carbohydrates (%) = % crude protein (CP) + % fat + % non-fibrous carbohydrates (NFC)</p>
            </Help>
            :
          </Box>
          <Myslider
            id="carb"
            min={20}
            max={70}
            step={0.1}
          />
          <Box mt={2} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <CustomInputText>Holo-cellulose (%)</CustomInputText>
            <Help>
              <p>
                Structural holo-cellulose (i.e., both cellulose and hemi-cellulose) concentration
                based on lab results. This represents the moderately decomposable C constituents in plant materials.
              </p>
              <p>The default value is based on the nitrogen concentration.</p>
              <p>If you have the raw data from near infra-red reflectance spectroscopy (NIRS) analysis, use the following equation:</p>
              <p>holo-cellulose (%) = % neutral detergent fiber (NDF) – (% lignin + % ash)</p>
            </Help>
            :
          </Box>
          <Myslider
            id="cell"
            min={20}
            max={70}
            step={0.1}
          />
          <Box mt={2} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <CustomInputText>Lignin (%)</CustomInputText>
            <Help>
              <p>Structural lignin concentration based on lab results. This represents the most recalcitrant C constituents in plant materials.</p>
              <p>The default value is based on the nitrogen concentration.</p>
            </Help>
            :
          </Box>
          <Myslider
            id="lign"
            min={1}
            max={10}
            step={0.1}
          />
        </Box>
        <Box
          sx={{
            justifyContent: 'space-around',
            alignItems: 'space-between',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
          }}
          mt={6}
        >
          <Button
            sx={{ borderRadius: '1rem', fontSize: '22px', fontWeight: 900 }}
            onClick={() => navigate('/covercrop')}
            variant="contained"
            color="success"
          >
            BACK
          </Button>
          <Button
            sx={{ borderRadius: '1rem', fontSize: '22px', fontWeight: 900 }}
            onClick={() => navigate('/cashcrop')}
            variant="contained"
            color="success"
          >
            NEXT
          </Button>
        </Box>
      </Box>
    </Box>
  );
}; // CoverCrop2

CoverCrop1.desc = 'Cover Crop';
CoverCrop2.showInMenu = false;

export {
  CoverCrop1,
  CoverCrop2,
};
