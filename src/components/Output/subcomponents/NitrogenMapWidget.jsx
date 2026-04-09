/* eslint-disable no-underscore-dangle */
/* eslint-disable no-alert */
/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
import { React, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { PSALoadingSpinner, PSARadioButton } from 'shared-react-components/src';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import Map from '../../../shared/Map/NitrogenMap';
import { get } from '../../../store/redux-autosetters';
import NavButton from '../../../shared/Navigate/NavButton';
import ActionModal from '../../../shared/Modal';
import { downloadPrescriptionShapefile } from '../../../hooks/useFetchApi';
import { ncalcApiUrl } from '../../../utils/keys';

/// /// /// STYLES /// /// ///
const CardStyles = {
  borderRadius: 5,
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
};

const cardContentStyles = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

const API_BASE_URL = ncalcApiUrl;

const NitrogenMapWidget = ({ refVal }) => {
  const { getAccessTokenSilently } = useAuth0();
  const dispatch = useDispatch();
  const selectedField = useSelector(get.selectedField);
  const isRCPP = selectedField?.properties?.programName === 'RCPP';
  const isPM3DMode = useSelector(get.biomassCalcMode) === 'pm3d';
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const biomassGeojson = useSelector(get.biomassGeojson);
  const nitrogenFetchIsLoading = useSelector(get.nitrogenFetchIsLoading);
  const nitrogenTaskResults = useSelector(get.nitrogenTaskResults);
  const [layer, setLayer] = useState('prescription');
  const [applyRCPP, setApplyRCPP] = useState(true);

  const [modalConfig, setModalConfig] = useState({ open: false });
  const [isLoading, setIsLoading] = useState(false);
  const closeModal = () => setModalConfig({ open: false });
  const showModal = (config) => setModalConfig({ ...config, open: true });

  const handleDownloadClick = () => {
    downloadPrescriptionShapefile(applyRCPP ? nitrogenTaskResults?.reqN : nitrogenTaskResults?.reqNWithoutTreatment, dispatch);
  };

  const saveFiles = async () => {
    showModal({ type: 'loading', message: 'Saving prescription data...' });
    try {
      const fieldId = selectedField._id;
      const token = await getAccessTokenSilently();
      const filesToSave = [
        { file_type: 'prescription', geojson: applyRCPP ? nitrogenTaskResults?.reqN : nitrogenTaskResults?.reqNWithoutTreatment },
        { file_type: 'biomass', geojson: biomassGeojson },
      ];
      await Promise.all(
        filesToSave.map((file) => axios.post(
          `${API_BASE_URL}/geojson-files`,
          { field_id: fieldId, file_type: file.file_type, geojson: file.geojson },
          { headers: { Authorization: `Bearer ${token}` } },
        )),
      );
      showModal({
        type: 'success',
        title: 'Saved Successfully',
        message: 'Your prescription has been saved and your download will begin shortly.',
      });
      handleDownloadClick();
    } catch (err) {
      const serverMessage = err?.response?.data?.message || err?.response?.data?.error;
      showModal({
        type: 'error',
        title: 'Something Went Wrong',
        message: serverMessage || 'There was an error saving the prescription data.',
      });
    }
  };

  const handleSaveAndDownload = async () => {
    try {
      setIsLoading(true);

      if (isSatelliteMode) {
        handleDownloadClick();
        return;
      }

      const fieldId = selectedField?._id;
      const token = await getAccessTokenSilently();

      const checkRes = await axios.get(`${API_BASE_URL}/geojson-files`, {
        params: { field_id: fieldId, file_type: 'prescription' },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (checkRes.data?.data) {
        showModal({
          type: 'confirm',
          title: 'Overwrite Existing Prescription?',
          message: 'A prescription for this field already exists. Would you like to overwrite it with the current data?',
          confirmText: 'Overwrite',
          cancelText: 'Cancel',
          onConfirm: saveFiles,
        });
      } else {
        await saveFiles();
      }
    } catch (err) {
      showModal({
        type: 'error',
        title: 'Error',
        message: 'Failed to check for existing prescription data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card sx={CardStyles} elevation={8} ref={refVal}>
        <CardContent sx={cardContentStyles}>
          <Typography sx={{ fontSize: 22 }} color="text.secondary" gutterBottom textAlign="center">
            Field Map
          </Typography>
          {nitrogenFetchIsLoading && (
          <Box>
            <Grid
              item
              container
              spacing={1}
              justifyContent="center"
              alignItems="center"
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100px',
              }}
            >
              <PSALoadingSpinner />
            </Grid>
            <Typography variant="h6" fontWeight="bold" gutterBottom textAlign="center">
              Calculating Nitrogen ...
            </Typography>
          </Box>
          )}
          <Box sx={{ height: '90%', width: '100%', marginBottom: 2 }}>
            <Map layer={layer} applyRCPP={applyRCPP} />
          </Box>

          <Box sx={{
            width: '100%',
            p: 2,
            bgcolor: '#f9f9f9',
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
          >
            <PSARadioButton
              options={[
                { label: 'Prescription', value: 'prescription' },
                { label: 'Nitrogen Credit', value: 'credit' },
                { label: 'Biomass', value: 'biomass' },
                ...(isPM3DMode ? [{ label: 'Treatment', value: 'treatment' }] : []),
              ]}
              selectedValue={layer}
              onChange={(value) => setLayer(value)}
              row
            />
            {(isPM3DMode || isSatelliteMode) && (
            <Stack direction="column" alignItems="center" spacing={1}>
              {isRCPP && (
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={applyRCPP}
                    onChange={(e) => setApplyRCPP(e.target.checked)}
                  />
              )}
                label="Apply RCPP Treatment?"
              />
              )}
              <NavButton
                onClick={handleSaveAndDownload}
                disabled={(!nitrogenTaskResults?.reqN && !nitrogenTaskResults?.reqNWithoutTreatment) || nitrogenFetchIsLoading || isLoading}
                sx={{ mt: 2 }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : null}
                {' '}
                Download Prescription
              </NavButton>
            </Stack>
            )}
          </Box>
        </CardContent>
      </Card>
      <ActionModal {...modalConfig} onClose={closeModal} />
    </>
  );
};

export default NitrogenMapWidget;
