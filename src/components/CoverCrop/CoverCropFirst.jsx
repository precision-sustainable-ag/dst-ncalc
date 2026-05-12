/* eslint-disable consistent-return */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PSARadioButton, PSATextField } from 'shared-react-components/src';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import { Grid, LinearProgress, useMediaQuery } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { get, set } from '../../store/Store';
import CoverCropsInput from './CoverCropsInput';
import GrowthStageInput from './GrowthStageInput';
import Myslider from '../../shared/Slider';
import Help from '../../shared/Help';
import BiomassData from '../../shared/BiomassData';
import Required from '../../shared/Required';
import NavigateBar from '../../shared/Navigate';
import { ncalcApiUrl } from '../../utils/keys';

const UGA_LINK = 'https://extension.uga.edu/publications/detail.html?number=C1077';

const API_BASE_URL = ncalcApiUrl;

const CoverCropFirst = () => {
  const { getAccessTokenSilently } = useAuth0();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const maxBiomass = useSelector(get.maxBiomass);
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const isPM3DMode = useSelector(get.biomassCalcMode) === 'pm3d';
  const coverCrop = useSelector(get.coverCrop);
  // eslint-disable-next-line no-nested-ternary
  const max = isSatelliteMode
    ? maxBiomass[coverCrop]
    : coverCrop && coverCrop.length && Array.isArray(coverCrop)
      ? coverCrop.map((s) => maxBiomass[s]).sort((a, b) => b - a)[0] || 15000
      : 15000;
  const freshMax = max * 4 || 30000;
  const biomass = useSelector(get.biomass);
  const unit = useSelector(get.unit);
  const freshBiomass = useSelector(get.freshBiomass);
  const biomassTotalValue = useSelector(get.biomassTotalValue);
  // const mapPolygon = useSelector(get.mapPolygon);
  // const [open, setOpen] = useState(true);
  const [biomassNotExist, setBiomassNotExist] = useState(!isSatelliteMode ? false : !biomassTotalValue);
  const coverCropGrowthStage = useSelector(get.coverCropGrowthStage);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const lwc = useSelector(get.lwc);
  const [disableNextButton, setDisableNextButton] = useState(true);
  const [terminationDate, setTerminationDate] = useState(coverCropTerminationDate);
  const biomassFetchIsLoading = useSelector(get.biomassFetchIsLoading);
  const selectedField = useSelector(get.selectedField);
  const isRCPPReportOnly = useSelector(get.isRCPPReportOnly);
  const [isLoading, setIsLoading] = useState(false);

  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  /// Desc: Fetch the plant factors
  // useFetchPlantFactors();

  /// Desc: Set the warning text
  let warningText;
  if (coverCrop && coverCrop.length > 1) {
    warningText = ' for these particular species';
  } else if (coverCrop && coverCrop.length) {
    warningText = ' for this particular species';
  } else {
    warningText = '';
  }

  /// Desc: Set the disableNextButton state
  useEffect(() => {
    if (isSatelliteMode || isPM3DMode) {
      const allStagesSelected = Array.isArray(coverCrop) && coverCrop.length > 0
        && coverCrop.every((species) => coverCropGrowthStage?.[species] && coverCropGrowthStage[species] !== '');

      setDisableNextButton((isSatelliteMode && !biomassTotalValue) || !coverCrop || coverCrop.length === 0 || !allStagesSelected);
    } else {
      setDisableNextButton(!biomass || coverCrop.length === 0 || !coverCropTerminationDate || !lwc);
    }
  }, [isSatelliteMode, isPM3DMode, biomass, coverCrop, coverCropGrowthStage, coverCropTerminationDate, lwc, biomassTotalValue]);

  const syncFieldData = async () => {
    if (!isPM3DMode || !selectedField) return;

    const originalCoverCrops = selectedField.properties?.coverCrop || [];
    const originalTerminationDate = selectedField.properties?.coverCropTerminationDate;

    const cropsChanged = JSON.stringify(originalCoverCrops) !== JSON.stringify(coverCrop);
    const dateChanged = originalTerminationDate !== coverCropTerminationDate;

    if (cropsChanged || dateChanged) {
      setIsLoading(true);
      try {
        const token = await getAccessTokenSilently();

        const payload = {
          programName: selectedField.properties.programName,
          groupName: selectedField.properties.groupName,
          growerName: selectedField.properties.growerName,
          farmName: selectedField.properties.farmName,
          fieldName: selectedField.properties.fieldName,
          geometry: selectedField.geometry,
          coverCrop,
          coverCropTerminationDate,
          cashCrop: selectedField.properties.cashCrop,
          cashCropPlantingDate: selectedField.properties.cashCropPlantingDate,
          cashCropHarvestingDate: selectedField.properties.cashCropHarvestingDate,
          coverCropPlantingDate: selectedField.properties.coverCropPlantingDate,
        };

        await axios.put(`${API_BASE_URL}/fields`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const updatedField = {
          ...selectedField,
          properties: {
            ...selectedField.properties,
            coverCrop,
            coverCropTerminationDate,
          },
        };
        dispatch(set.selectedField(updatedField));
      } catch (err) {
        dispatch(set.user.showAlert(true));
        dispatch(set.user.alertMessage('Failed to update field data. Try again.'));
        return false;
      } finally {
        setIsLoading(false);
      }
    }
    return true;
  };

  return (
    <Grid container justifyContent="center">
      <Grid
        item
        xs={12}
        md={10}
        sx={{
          marginTop: '1rem',
          padding: `2rem ${matchesMd ? '1rem' : '4rem'}`,
          boxShadow: 5,
          borderRadius: 5,
          opacity: 0.9,
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Stack direction="column" spacing="2rem" width="100%" maxWidth="600px">

          <Typography variant="h4" align="center" color="primary">Tell us about your Cover Crop</Typography>

          <Stack gap={1}>
            <Stack direction="row" alignItems="center">
              <Typography variant="inputLabel">Cover Crop Species</Typography>
              {(!coverCrop || coverCrop.length === 0) && <Required />}
            </Stack>
            <CoverCropsInput isSatelliteMode={isSatelliteMode} />
          </Stack>

          {(isSatelliteMode || isPM3DMode) && coverCrop && (
            <Stack gap={1}>
              <Stack direction="row" alignItems="center">
                <Typography variant="inputLabel">Cover Crop Growth Stage</Typography>
                {(!coverCropGrowthStage || Object.keys(coverCropGrowthStage).length !== coverCrop.length) && <Required />}
              </Stack>
              <GrowthStageInput isSatelliteMode={isSatelliteMode} />
            </Stack>
          )}

          {isSatelliteMode && (
            <>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="inputLabel">Biomass Unit</Typography>
                <PSARadioButton
                  options={[
                    { label: 'lb/ac', value: 'lb/ac' },
                    { label: 'kg/ha', value: 'kg/ha' },
                  ]}
                  selectedValue={unit}
                  onChange={(value) => dispatch(set.unit(value))}
                  row
                  aria-label="position"
                  name="position"
                />
                <BiomassData minified={false} />
              </Stack>
              {biomassFetchIsLoading && <LinearProgress />}
            </>
          )}

          {!isSatelliteMode && (
            <Stack gap={1}>
              <Stack direction="row" alignItems="center">
                <Typography variant="inputLabel">Cover Crop Termination Date</Typography>
                {!coverCropTerminationDate && <Required />}
              </Stack>
              <PSATextField
                type="date"
                value={terminationDate}
                onChange={(e) => {
                  setTerminationDate(e.target.value);
                  dispatch(set.coverCropTerminationDate(e.target.value));
                }}
                sx={{ mt: 0, width: '100%', '& .MuiInputBase-root': { padding: 1 } }}
              />
            </Stack>
          )}

          {!isPM3DMode && !isSatelliteMode && (
            <>
              <Stack gap={1}>
                <Stack direction="row" alignItems="center">
                  <Typography variant="inputLabel">Dry Biomass</Typography>
                  <Help ariaLabel="The amount of cover crop biomass on a dry weight basis.">
                    <p>The amount of cover crop biomass on a dry weight basis.</p>
                    <p>
                      For details on cover crop biomass sampling and taking a representative sub-sample for quality analysis, please refer to
                      <a tabIndex="-1" target="_blank" rel="noreferrer" href={UGA_LINK}>
                        here
                      </a>
                      .
                    </p>
                  </Help>
                  {!biomass && <Required />}
                </Stack>

                <PSARadioButton
                  options={[
                    { label: 'lb/ac', value: 'lb/ac' },
                    { label: 'kg/ha', value: 'kg/ha' },
                  ]}
                  selectedValue={unit}
                  onChange={(value) => dispatch(set.unit(value))}
                  row
                  aria-label="position"
                  name="position"
                />

                <Myslider id="biomass" min={0} max={max} />

                {+biomass > +max && (
                  <p className="warning">
                    This biomass seems too high
                    {warningText}
                    .
                    <br />
                    Please make sure the biomass entered is on a dry matter basis.
                  </p>
                )}
                {+freshBiomass > +freshMax && (
                  <p className="warning">
                    This biomass seems too high
                    {warningText}
                    .
                    <br />
                    Please make sure the biomass entered is on a fresh matter basis.
                  </p>
                )}
              </Stack>

              <Stack gap={1}>
                <Stack direction="row" alignItems="center">
                  <Typography variant="inputLabel">Cover Crop Water Content at Termination (g water/g dry biomass)</Typography>
                  <Help ariaLabel="Use the following calculation to adjust default values: Cover Crop Water Content
                   = (Total fresh weight - Total dry weight)/(Total dry weight)"
                  >
                    <p>Use the following calculation to adjust default values:</p>
                    <p>Cover Crop Water Content = (Total fresh weight - Total dry weight)/(Total dry weight)</p>
                  </Help>
                  {!lwc && <Required />}
                </Stack>
                <Myslider id="lwc" min={0} max={10} step={0.1} />
              </Stack>
            </>
          )}
        </Stack>

        <NavigateBar
          next="next"
          nextOnClick={async () => {
            if (isSatelliteMode) {
              dispatch(set.activeStep(5));
              navigate('/fertilizer');
            } else if (isPM3DMode) {
              const isSuccess = await syncFieldData();
              if (isSuccess) {
                if (isRCPPReportOnly) {
                  dispatch(set.activeStep(6));
                  navigate('/output');
                } else {
                  dispatch(set.activeStep(5));
                  navigate('/fertilizer');
                }
              }
            } else navigate('/covercrop2');
          }}
          nextDisabled={disableNextButton || isLoading}
          back="back"
          backOnClick={() => {
            if (isSatelliteMode) {
              dispatch(set.activeStep(2));
              navigate('/location');
            } else if (isPM3DMode) {
              dispatch(set.activeStep(1));
              navigate('/upload');
            } else {
              dispatch(set.activeStep(3));
              navigate('/soil');
            }
          }}
        />

        <Snackbar
          open={biomassNotExist}
          TransitionComponent={Slide}
          autoHideDuration={5000}
          onClose={() => {
            setBiomassNotExist(false);
          }}
        >
          <Alert
            onClose={() => {
              setBiomassNotExist(false);
            }}
            severity="warning"
            variant="filled"
            sx={{ width: '100%' }}
          >
            <Typography variant="subtitle1">Biomass value need to be calculated first</Typography>
          </Alert>
        </Snackbar>
      </Grid>
    </Grid>

  );
}; // CoverCropFirst
CoverCropFirst.desc = 'Cover Crop';

export default CoverCropFirst;
