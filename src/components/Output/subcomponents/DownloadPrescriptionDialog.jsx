/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Box,
  Typography,
} from '@mui/material';
import { PSARadioButton } from 'shared-react-components/src';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { get, set } from '../../../store/redux-autosetters';
import Map from '../../../shared/Map/NitrogenMap';
import { downloadPrescriptionShapefile } from '../../../hooks/useFetchApi';
import { ncalcApiUrl } from '../../../utils/keys';
import { handleError } from '../../../utils/apiError';

const API_BASE_URL = ncalcApiUrl;

/**
 * Confirmation dialog shown before downloading a prescription.
 * Previews the target rate and prescription maps and lets the user switch the download units.
 *
 * @param {boolean} open - If the dialog is open.
 * @param {Function} onClose - Function called when the dialog is dismissed/cancelled.
 */
const DownloadPrescriptionDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { getAccessTokenSilently } = useAuth0();

  const inputMode = useSelector(get.inputMode);
  const fertilizerType = useSelector(get.fertilizerType);
  const isPM3DMode = useSelector(get.biomassCalcMode) === 'pm3d';
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const selectedField = useSelector(get.selectedField);
  const nitrogenTaskResults = useSelector(get.nitrogenTaskResults);
  const biomassGeojson = useSelector(get.biomassGeojson);
  const sidedressFertilizationDate = useSelector(get.sidedressFertilizationDate);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const coverCropGrowthStage = useSelector(get.coverCropGrowthStage);
  const fertilizers = useSelector(get.fertilizers);
  const granularFertilizer = useSelector(get.granularFertilizer);
  const otherGranularFertilizer = useSelector(get.otherGranularFertilizer);
  const liquidFertilizer = useSelector(get.liquidFertilizer);
  const otherLiquidFertilizer = useSelector(get.otherLiquidFertilizer);

  const [continueDownload, setContinueDownload] = useState('');
  const [selectedMode, setSelectedMode] = useState(inputMode);

  const productUnit = fertilizerType === 'granular' ? 'lb of product/ac' : 'gal of product/ac';
  const unitLabel = (mode) => (mode === 'nitrogen' ? 'lb of N/ac' : productUnit);

  const downloadMode = continueDownload === 'no' ? selectedMode : inputMode;
  const rateKey = downloadMode === 'nitrogen' ? 'ReqN' : 'ReqN_product';

  // Reset the choices whenever the dialog re-opens.
  useEffect(() => {
    if (open) {
      setContinueDownload('');
      setSelectedMode(inputMode);
    }
  }, [open, inputMode]);

  const downloadShapefile = () => {
    const fieldName = selectedField?.properties?.fieldName ?? '';
    downloadPrescriptionShapefile(nitrogenTaskResults?.reqN, dispatch, fieldName, rateKey);
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
      // Save the sidedress date as additional metadata
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
      downloadShapefile();
    } catch (err) {
      handleError(err, dispatch, '', 'There was an error in saving the prescription data.');
    }
  };

  const saveAndDownload = async () => {
    try {
      if (isSatelliteMode) {
        downloadShapefile();
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
          onConfirm: () => saveFiles(),
        }));
      } else {
        await saveFiles();
      }
    } catch (err) {
      handleError(err, dispatch, 'Failed to check for existing prescription data.');
    }
  };

  const handleConfirmDownload = () => {
    onClose();
    saveAndDownload();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Download Prescription</DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" align="center" sx={{ fontWeight: 600 }} gutterBottom>
                Target Rate
              </Typography>
              <Map layer="spray" setLayer={() => {}} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" align="center" sx={{ fontWeight: 600 }} gutterBottom>
                Prescription
              </Typography>
              <Map layer="prescription" setLayer={() => {}} />
            </Box>
          </Stack>

          <Typography variant="subtitle1" gutterBottom>
            Note: The prescription will be downloaded in
            {' '}
            <strong>{unitLabel(downloadMode)}</strong>
            .
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} gutterBottom>
            Do you want to continue with the download?
          </Typography>

          <Box>
            <PSARadioButton
              options={[
                { label: 'Yes', value: 'yes' },
                { label: 'No, I want to change the units', value: 'no' },
              ]}
              selectedValue={continueDownload}
              onChange={(value) => setContinueDownload(value)}
              row
            />
          </Box>

          {continueDownload === 'no' && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }} gutterBottom>
                Which units would you like the prescription rates exported in?
              </Typography>
              <PSARadioButton
                options={[
                  { label: `Nitrogen (${unitLabel('nitrogen')})`, value: 'nitrogen' },
                  { label: `Fertilizer product (${productUnit})`, value: 'fertilizer' },
                ]}
                selectedValue={selectedMode}
                onChange={(value) => setSelectedMode(value)}
                row
              />
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ pb: 2, px: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirmDownload}
          variant="contained"
          color="primary"
          disabled={!continueDownload}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DownloadPrescriptionDialog;
