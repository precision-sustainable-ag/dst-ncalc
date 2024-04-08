import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Stack, styled } from '@mui/material';
import { get } from '../../store/Store';
import Myslider from '../../shared/Slider';
import Help from '../../shared/Help';
import Required from '../../shared/Required';
import NavButton from '../../shared/Navigate/NavButton';

const CustomInputText = styled(Typography)({
  fontSize: '1.2rem',
  fontWeight: 400,
  color: '#4f6b14',
  marginTop: '1.3rem',
  marginBottom: '0.2rem',
});

const CoverCropSecond = ({ barebone = false }) => {
  const navigate = useNavigate();
  const N = useSelector(get.N);
  const carb = useSelector(get.carb);
  const cell = useSelector(get.cell);
  const lign = useSelector(get.lign);
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';

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
        {barebone ? (
          <Typography variant="h5">
            Tell us about your Cover Crop Quality
          </Typography>
        ) : (
          <Typography variant="h4">
            Tell us about your Cover Crop Quality
          </Typography>
        )}
        {isSatelliteMode && (
          <Typography variant="subtitle1" fontWeight={900}>
            These values are estimated based on plant species and growth satge
          </Typography>
        )}
        <Box sx={{ width: '90%' }}>
          <Box
            mt={2}
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            <Stack direction="row" alignItems="center">
              <CustomInputText>Nitrogen (%)</CustomInputText>
              <Help>
                Cover crop nitrogen concentration based on lab results.
              </Help>
              {!N && <Required />}
            </Stack>
            :
          </Box>
          <Myslider
            id="N"
            min={0}
            max={6}
            step={0.1}
            disabled={isSatelliteMode}
          />
          {!isSatelliteMode && N ? (
            <p className="note">
              Adjust default values below based on lab results.
            </p>
          ) : (
            ''
          )}
          <Box
            mt={2}
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            <Stack direction="row" alignItems="center">
              <CustomInputText>Carbohydrates (%)</CustomInputText>
              <Help>
                <p>
                  Non-structural labile carbohydrate concentration based on lab
                  results. This represents the most readily decomposable C
                  constituents in plant materials.
                </p>
                <p>The default value is based on the nitrogen concentration.</p>
                <p>
                  If you have the raw data from near infra-red reflectance
                  spectroscopy (NIRS) analysis, use the following equation:
                </p>
                <p>
                  carbohydrates (%) = % crude protein (CP) + % fat + %
                  non-fibrous carbohydrates (NFC)
                </p>
              </Help>
              {!carb && <Required />}
            </Stack>
            :
          </Box>
          <Myslider
            id="carb"
            min={20}
            max={70}
            step={0.1}
            disabled={isSatelliteMode}
          />
          <Box
            mt={2}
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            <Stack direction="row" alignItems="center">
              <CustomInputText>Holo-cellulose (%)</CustomInputText>
              <Help>
                <p>
                  Structural holo-cellulose (i.e., both cellulose and
                  hemi-cellulose) concentration based on lab results. This
                  represents the moderately decomposable C constituents in plant
                  materials.
                </p>
                <p>The default value is based on the nitrogen concentration.</p>
                <p>
                  If you have the raw data from near infra-red reflectance
                  spectroscopy (NIRS) analysis, use the following equation:
                </p>
                <p>
                  holo-cellulose (%) = % neutral detergent fiber (NDF) – (%
                  lignin + % ash)
                </p>
              </Help>
              {!cell && <Required />}
            </Stack>
            :
          </Box>
          <Myslider
            id="cell"
            min={20}
            max={70}
            step={0.1}
            disabled={isSatelliteMode}
          />
          <Box
            mt={2}
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            <Stack direction="row" alignItems="center">
              <CustomInputText>Lignin (%)</CustomInputText>
              <Help>
                <p>
                  Structural lignin concentration based on lab results. This
                  represents the most recalcitrant C constituents in plant
                  materials.
                </p>
                <p>The default value is based on the nitrogen concentration.</p>
              </Help>
              {!lign && <Required />}
            </Stack>
            :
          </Box>
          <Myslider
            id="lign"
            min={1}
            max={10}
            step={0.1}
            disabled={isSatelliteMode}
          />
        </Box>
        {!barebone && (
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
            <NavButton onClick={() => navigate('/covercrop')}>BACK</NavButton>
            <NavButton
              onClick={() => navigate('/cashcrop')}
              disabled={!N || !carb || !cell || !lign}
            >
              NEXT
            </NavButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}; // CoverCropSecond
CoverCropSecond.showInMenu = false;

export default CoverCropSecond;
