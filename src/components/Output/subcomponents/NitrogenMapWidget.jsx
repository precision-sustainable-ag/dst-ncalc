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
import Map from '../../../shared/Map/NitrogenMap';
import { get, set } from '../../../store/redux-autosetters';
import NavButton from '../../../shared/Navigate/NavButton';
import buildPdfReportHtml from '../../../utils/pdfUtils';
import { handleError } from '../../../utils/apiError';
import DownloadPrescriptionDialog from './DownloadPrescriptionDialog';

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

const PDF_BASE_URL = 'https://pdf.covercrop-data.org/api';

const NitrogenMapWidget = ({ refVal }) => {
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  const isPM3DMode = useSelector(get.biomassCalcMode) === 'pm3d';
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const selectedField = useSelector(get.selectedField);
  const isRCPPReportOnly = useSelector(get.isRCPPReportOnly);
  const nitrogenFetchIsLoading = useSelector(get.nitrogenFetchIsLoading);
  const nitrogenTaskResults = useSelector(get.nitrogenTaskResults);
  const summaryData = useSelector(get.summaryData);

  const [layer, setLayer] = useState(!isRCPPReportOnly ? 'prescription' : 'credit');

  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);

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

      const pdfTitle = 'Nitrogen Prescription Maps';
      const fieldName = selectedField?.properties?.fieldName ?? 'Field';
      const html = buildPdfReportHtml({
        pdfTitle, fieldName, mapCaptures, summaryData,
      });

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
              ...(isSatelliteMode || (isPM3DMode && !isRCPPReportOnly) ? [{ label: 'Target Rate', value: 'spray' }] : []),
            ]}
            selectedValue={layer}
            onChange={(value) => setLayer(value)}
            row
          />
          {(isPM3DMode || isSatelliteMode) && (
            <Stack direction="row" spacing={3}>
              {(isSatelliteMode || (isPM3DMode && !isRCPPReportOnly)) && (
                <NavButton
                  onClick={() => setDownloadDialogOpen(true)}
                  disabled={!nitrogenTaskResults?.reqN || nitrogenFetchIsLoading || downloadDialogOpen}
                >
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

      <DownloadPrescriptionDialog
        open={downloadDialogOpen}
        onClose={() => setDownloadDialogOpen(false)}
      />
    </Card>
  );
};

export default NitrogenMapWidget;
