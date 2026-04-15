/* eslint-disable no-underscore-dangle */
/* eslint-disable no-alert */
/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
import { React, useState, useRef } from 'react';
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
import { get, set } from '../../../store/redux-autosetters';
import NavButton from '../../../shared/Navigate/NavButton';
import ActionModal from '../../../shared/Modal';
import { downloadPrescriptionShapefile } from '../../../hooks/useFetchApi';
import { ncalcApiUrl } from '../../../utils/keys';
import buildPdfReportHtml from '../../../utils/pdfUtils';

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
const PDF_BASE_URL = 'https://pdf.covercrop-data.org/api';

const NitrogenMapWidget = ({ refVal }) => {
  const { getAccessTokenSilently } = useAuth0();
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  const isPM3DMode = useSelector(get.biomassCalcMode) === 'pm3d';
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const selectedField = useSelector(get.selectedField);
  const isRCPP = selectedField?.properties?.programName === 'RCPP';
  const nitrogenFetchIsLoading = useSelector(get.nitrogenFetchIsLoading);
  const biomassGeojson = useSelector(get.biomassGeojson);
  const nitrogenTaskResults = useSelector(get.nitrogenTaskResults);
  const summaryData = useSelector(get.summaryData);

  const [layer, setLayer] = useState('prescription');
  const [applyRCPP, setApplyRCPP] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const handleDownloadClick = () => {
    downloadPrescriptionShapefile(applyRCPP ? nitrogenTaskResults?.reqN : nitrogenTaskResults?.reqNWithoutTreatment, dispatch);
  };

  const saveFiles = async () => {
    dispatch(set.actionModal({ open: true, type: 'loading', message: 'Saving prescription data...' }));
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
      dispatch(set.actionModal({
        open: true,
        type: 'success',
        title: 'Saved Successfully',
        message: 'Your prescription has been saved and your download will begin shortly.',
      }));
      handleDownloadClick();
    } catch (err) {
      const serverMessage = err?.response?.data?.message || err?.response?.data?.error;
      dispatch(set.actionModal({
        open: true,
        type: 'error',
        title: 'Something Went Wrong',
        message: serverMessage || 'There was an error saving the prescription data.',
      }));
    }
  };

  const handleSaveAndDownload = async () => {
    try {
      setIsSaving(true);

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
        dispatch(set.actionModal({
          open: true,
          type: 'confirm',
          title: 'Overwrite Existing Prescription?',
          message: 'A prescription for this field already exists. Would you like to overwrite it with the current data?',
          confirmText: 'Overwrite',
          cancelText: 'Cancel',
          onConfirm: saveFiles,
        }));
      } else {
        await saveFiles();
      }
    } catch (err) {
      dispatch(set.actionModal({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to check for existing prescription data.',
      }));
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Captures all map layers as images, builds an HTML report and POSTs it to the PDF-generation endpoint.
   */
  const handlePrintPDF = async () => {
    if (isPdfLoading) return;
    setIsPdfLoading(true);
    try {
      const mapCaptures = await mapRef.current?.captureAllLayers({ applyRCPP });

      if (!mapCaptures?.length) {
        alert('Map not ready for capture.');
        return;
      }

      const fieldName = selectedField?.properties?.fieldName ?? 'Field';
      const html = buildPdfReportHtml({ fieldName, mapCaptures, summaryData });

      const { data } = await axios.post(`${PDF_BASE_URL}/generate-pdf`, { html, filename: `prescription-${fieldName}.pdf` });
      window.open(data.fileUrl, '_blank');
    } catch (err) {
      dispatch(set.actionModal({
        open: true,
        type: 'error',
        title: 'PDF Export Error',
        message: err?.response?.data?.error || 'There was an error generating the PDF.',
      }));
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
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
          <Map layer={layer} setLayer={setLayer} applyRCPP={applyRCPP} ref={mapRef} />
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
            <Stack direction="row" spacing={3}>
              {isPM3DMode && (
                <NavButton
                  onClick={handleSaveAndDownload}
                  disabled={(!nitrogenTaskResults?.reqN && !nitrogenTaskResults?.reqNWithoutTreatment) || nitrogenFetchIsLoading || isSaving}
                  sx={{ mt: 2 }}
                >
                  {isSaving ? <CircularProgress size={24} color="inherit" /> : null}
                  {' '}
                  Download Prescription
                </NavButton>
              )}
              {isPM3DMode && (
                <NavButton
                  onClick={handlePrintPDF}
                  disabled={(!nitrogenTaskResults?.reqN && !nitrogenTaskResults?.reqNWithoutTreatment) || nitrogenFetchIsLoading || isPdfLoading}
                >
                  {isPdfLoading ? <CircularProgress size={24} color="inherit" /> : null}
                  {' '}
                  Print Report
                </NavButton>
              )}
            </Stack>
          </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NitrogenMapWidget;
