/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
import { React, useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  CircularProgress,
} from '@mui/material';
import { PSALoadingSpinner, PSARadioButton } from 'shared-react-components/src';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import Map from '../../../shared/Map/NitrogenMap';
import { get, set } from '../../../store/redux-autosetters';
import NavButton from '../../../shared/Navigate/NavButton';
import { downloadPrescriptionShapefile } from '../../../hooks/useFetchApi';
import { ncalcApiUrl } from '../../../utils/keys';
import buildPdfReportHtml from '../../../utils/pdfUtils';
import { handleError } from '../../../utils/apiError';

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
  const isRCPPReportOnly = useSelector(get.isRCPPReportOnly);
  const nitrogenFetchIsLoading = useSelector(get.nitrogenFetchIsLoading);
  const biomassGeojson = useSelector(get.biomassGeojson);
  const nitrogenTaskResults = useSelector(get.nitrogenTaskResults);
  const summaryData = useSelector(get.summaryData);
  const sidedressFertilizationDate = useSelector(get.sidedressFertilizationDate);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const fertilizers = useSelector(get.fertilizers);
  const fertilizerType = useSelector(get.fertilizerType);
  const inputMode = useSelector(get.inputMode);
  const granularFertilizer = useSelector(get.granularFertilizer);
  const otherGranularFertilizer = useSelector(get.otherGranularFertilizer);
  const liquidFertilizer = useSelector(get.liquidFertilizer);
  const otherLiquidFertilizer = useSelector(get.otherLiquidFertilizer);
  const coverCropGrowthStage = useSelector(get.coverCropGrowthStage);

  const [layer, setLayer] = useState(!isRCPPReportOnly ? 'prescription' : 'credit');

  const [isSaving, setIsSaving] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const handleDownloadClick = () => {
    downloadPrescriptionShapefile(nitrogenTaskResults?.reqN, dispatch);
  };

  const saveAdditionalMetadata = async () => {
    if (!isPM3DMode || !selectedField) return;
    try {
      const token = await getAccessTokenSilently();

      let fertilizerMeta = { type: fertilizerType };

      // Create fertilizer metadata object
      if (fertilizerType === 'granular') {
        const selected = fertilizers.find((f) => f.name === granularFertilizer);
        fertilizerMeta = {
          ...fertilizerMeta,
          name: granularFertilizer === 'Other' ? otherGranularFertilizer.fertilizerName : granularFertilizer,
          n_percent: granularFertilizer === 'Other'
            ? parseFloat(otherGranularFertilizer.NPercent) || 0
            : selected?.n_percent || 0,
        };
      } else if (fertilizerType === 'liquid') {
        const selected = fertilizers.find((f) => f.name === liquidFertilizer);
        fertilizerMeta = {
          ...fertilizerMeta,
          name: liquidFertilizer === 'Other' ? otherLiquidFertilizer.fertilizerName : liquidFertilizer,
          n_percent: liquidFertilizer === 'Other'
            ? parseFloat(otherLiquidFertilizer.NPercent) || 0
            : selected?.n_percent || 0,
          density: liquidFertilizer === 'Other'
            ? parseFloat(otherLiquidFertilizer.density) || 0
            : selected?.density || 0,
        };
      }

      const payload = {
        field_id: selectedField._id,
        sidedress_fertilization_date: sidedressFertilizationDate,
        fertilizer: fertilizerMeta,
        growth_stage: coverCropGrowthStage,
        cc_termination_date: coverCropTerminationDate,
      };

      axios.post(`${API_BASE_URL}/additional-metadata`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) { /* empty */ } finally {
      // dispatch(set.otherGranularFertilizer({ fertilizerName: null, NPercent: null }));
      // dispatch(set.otherLiquidFertilizer({ fertilizerName: null, NPercent: null, density: null }));
      // dispatch(set.granularFertilizer(null));
      // dispatch(set.liquidFertilizer(null));
    }
  };

  const saveFiles = async () => {
    dispatch(set.actionModal({ open: true, type: 'loading', message: 'Saving prescription data...' }));
    try {
      // Save the sidedress date as additional metdata
      saveAdditionalMetadata();
      const fieldId = selectedField._id;
      const token = await getAccessTokenSilently();
      const filesToSave = [
        { file_type: 'prescription', geojson: nitrogenTaskResults?.reqN },
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
      handleError(err, dispatch, '', 'There was an error in saving the prescription data.');
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
      handleError(err, dispatch, 'Failed to check for existing prescription data.');
    } finally {
      setIsSaving(false);
    }
  };

  // Notify the user of the units the prescription will be downloaded in before proceeding.
  const handleDownloadPrescription = () => {
    const unit = inputMode === 'nitrogen' ? 'lb of N/ac' : fertilizerType === 'granular' ? 'lb of product/ac' : 'gal of product/ac';
    dispatch(set.actionModal({
      open: true,
      type: 'confirm',
      title: 'Download Prescription',
      message: `Note: The downloaded prescription rates will be in ${unit}.`,
      confirmText: 'Download',
      cancelText: 'Cancel',
      onConfirm: () => {
        dispatch(set.actionModal({ open: false }));
        handleSaveAndDownload();
      },
    }));
  };

  /**
   * Captures all map layers as images, builds an HTML report and POSTs it to the PDF-generation endpoint.
   */
  const handlePrintPDF = async () => {
    if (isPdfLoading) return;
    setIsPdfLoading(true);
    try {
      const mapCaptures = await mapRef.current?.captureAllLayers();

      if (!mapCaptures?.length) {
        dispatch(set.actionModal({
          open: true,
          type: 'error',
          title: 'PDF Export Error',
          message: 'There was an error generating the PDF. Try again.',
        }));
        return;
      }

      const fieldName = selectedField?.properties?.fieldName ?? 'Field';
      const html = buildPdfReportHtml({ fieldName, mapCaptures, summaryData });

      const { data } = await axios.post(`${PDF_BASE_URL}/generate-pdf`, { html, filename: `prescription-${fieldName}.pdf` });
      window.open(data.fileUrl, '_blank');
    } catch (err) {
      handleError(err, dispatch, '', 'There was an error while generating the PDF.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <Card sx={CardStyles} elevation={8} ref={refVal}>
      <CardContent sx={cardContentStyles}>
        <Typography variant="h5" color="primary" gutterBottom textAlign="center">
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
          <Map layer={layer} setLayer={setLayer} ref={mapRef} />
        </Box>

        <Box
          sx={{
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
              ...(isSatelliteMode || (isPM3DMode && !isRCPPReportOnly) ? [{ label: 'Prescription', value: 'prescription' }] : []),
              { label: 'Nitrogen Credit', value: 'credit' },
              { label: 'Biomass', value: 'biomass' },
              ...(isPM3DMode && !isRCPPReportOnly ? [{ label: 'Treatment', value: 'treatment' }] : []),
              ...(isPM3DMode && !isRCPPReportOnly ? [{ label: 'Target Rate', value: 'spray' }] : []),
            ]}
            selectedValue={layer}
            onChange={(value) => setLayer(value)}
            row
          />
          {(isPM3DMode || isSatelliteMode) && (
            <Stack direction="row" spacing={3}>
              {(isSatelliteMode || (isPM3DMode && !isRCPPReportOnly)) && (
                <NavButton
                  onClick={handleDownloadPrescription}
                  disabled={!nitrogenTaskResults?.reqN || nitrogenFetchIsLoading || isSaving}
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
                  disabled={!nitrogenTaskResults?.reqN || nitrogenFetchIsLoading || isPdfLoading}
                >
                  {isPdfLoading ? <CircularProgress size={24} color="inherit" /> : null}
                  {' '}
                  Print Report
                </NavButton>
              )}
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NitrogenMapWidget;
