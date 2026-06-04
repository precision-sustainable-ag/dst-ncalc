/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { PSAButton, PSADropdown } from 'shared-react-components/src';
import { useFetchSampleBiomass, useFetchSampleNitrogen } from '../../hooks/useFetchStatic';
import { downloadOutputCSV } from '../../hooks/helpers';
import { set, get } from '../../store/redux-autosetters';
import { historyStates } from '../../store/inits';

// TODO: component for the fields list at the right top corner of the page
const FieldDropdown = () => {
  /// ///// VARIABLES ///// ////
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const biomassCalcMode = useSelector(get.biomassCalcMode);
  const model = useSelector(get.model);
  const dates = useSelector(get.dates);
  const [downloadCSVFailed, setDownloadCSVFailed] = useState(false);
  const [selectedField, setSelectedField] = useState('');

  // get all fields from localStorage
  const myFields = Object.keys(localStorage).filter((key) => key.startsWith('ncalc-'));

  // TODO: Load static data from examples here
  useFetchSampleBiomass();
  useFetchSampleNitrogen();

  const handleDropdown = async (e) => {
    const fieldStr = e.target.value;
    setSelectedField(fieldStr);
    if (fieldStr === 'placeholder') {
      // TODO: maybe add functions to clean previous field data
      dispatch(set.field(''));
    } else if (fieldStr === 'Clear previous runs') {
      // eslint-disable-next-line no-alert
      if (window.confirm('Clear all previous runs?')) {
        localStorage.clear();
        navigate('home');
      }
    } else if (fieldStr === 'Example: Grass') {
      // navigate('location');
      dispatch(set.mapPolygon([]));
      dispatch(set.biomassTaskResults(null));
      dispatch(set.edited(true));
      dispatch(set.activeExample(fieldStr));
      dispatch(set.lat(32.8683));
      dispatch(set.lon(-82.2403));
      dispatch(set.location('Example'));
      dispatch(set.field('Example: Grass'));
      dispatch(set.OM(0.75));
      dispatch(set.BD(1.62));
      dispatch(set.InorganicN(10));
      // dispatch(set.plantGrowthStages({ 'Cereal rye': ['2. Stem elongation'] }));
      dispatch(set.coverCrop(['Cereal rye']));
      dispatch(set.coverCropGrowthStage({ 'Cereal rye': 'Jointed' }));
      dispatch(set.coverCropPlantingDate('2024-11-01'));
      dispatch(set.coverCropTerminationDate('2025-05-01'));
      dispatch(set.cashCropPlantingDate('2025-06-01'));
      dispatch(set.biomass(1687));
      dispatch(set.lwc(1.486));
      dispatch(set.N(2.57));
      dispatch(set.carb(57.22));
      dispatch(set.cell(42.4));
      dispatch(set.lign(3.3));
      // dispatch(set.cashCrop('Corn'));
      dispatch(set.yield(150));
      dispatch(set.targetN(150));
      dispatch(set.gridSize(1));
      dispatch(set.multiplier(3.34865146));
      dispatch(set.fertilizerType('liquid'));
      dispatch(set.liquidFertilizer('UAN 28%'));
      dispatch(set.user.historyState(historyStates.imported));
    } else if (fieldStr === 'Example: Legume') {
      // navigate('location');
      dispatch(set.mapPolygon([]));
      dispatch(set.biomassTaskResults(null));
      dispatch(set.edited(true));
      dispatch(set.activeExample(fieldStr));
      dispatch(set.lat(32.8683));
      dispatch(set.lon(-82.2403));
      dispatch(set.location('Example'));
      dispatch(set.field('Example: Legume'));
      dispatch(set.OM(0.75));
      dispatch(set.BD(1.62));
      dispatch(set.InorganicN(10));
      // dispatch(set.plantGrowthStages({ 'Crimson clover': ['2. Flowering'] }));
      dispatch(set.coverCrop(['Crimson clover']));
      dispatch(set.coverCropGrowthStage({ 'Crimson clover': '2. Flowering' }));
      dispatch(set.coverCropPlantingDate('2024-11-01'));
      dispatch(set.coverCropTerminationDate('2025-05-01'));
      dispatch(set.cashCropPlantingDate('2025-06-01'));
      dispatch(set.biomass(3500));
      dispatch(set.lwc(7.4));
      dispatch(set.N(2.72));
      dispatch(set.carb(59.69));
      dispatch(set.cell(34.96));
      dispatch(set.lign(7.99));
      // dispatch(set.cashCrop('Corn'));
      dispatch(set.yield(150));
      dispatch(set.targetN(100));
      dispatch(set.user.historyState(historyStates.imported));
    } else if (fieldStr === 'Download data') {
      if (model && dates) {
        downloadOutputCSV(model, dates);
      } else {
        setDownloadCSVFailed(true);
      }
    }
  };

  // Reset states
  useEffect(() => {
    setSelectedField('');
    dispatch(set.edited(false));
    dispatch(set.activeExample(''));
    dispatch(set.field(''));
    dispatch(set.mapPolygon([]));
    dispatch(set.lat(32.8654));
    dispatch(set.lon(-82.2584));
    dispatch(set.location(''));
    dispatch(set.coverCrop([]));
    dispatch(set.coverCropGrowthStage({}));
    dispatch(set.biomass(''));
    dispatch(set.biomassTaskResults(null));
    dispatch(set.biomassGeojson(null));
    dispatch(set.biomassTotalValue(null));
    dispatch(set.OM(3));
    dispatch(set.BD(1.3));
    dispatch(set.InorganicN(10));
    dispatch(set.lwc(4));
    dispatch(set.N(null));
    dispatch(set.carb(null));
    dispatch(set.cell(null));
    dispatch(set.lign(null));
    dispatch(set.yield(150));
    dispatch(set.targetN(150));
    dispatch(set.nitrogenTaskResults(null));
    dispatch(set.user.historyState(historyStates.none));
  }, [biomassCalcMode, dispatch]);

  /// ///// JSX RENDER ///// ////
  return (
    <div className="Init desktop">
      <PSADropdown
        label="Examples and utilities"
        items={[
          { label: 'Example data', isHeader: true },
          ...(biomassCalcMode === 'sampled' || biomassCalcMode === 'satellite' ? [{ value: 'Example: Grass', label: 'Example: Grass' }] : []),
          ...(biomassCalcMode === 'sampled' ? [{ value: 'Example: Legume', label: 'Example: Legume' }] : []),
          ...(pathname.includes('output') || myFields.length
            ? [
              {
                label: 'Utilities',
                isHeader: true,
              },
              { value: 'Download data', label: 'Download data' },
            ]
            : []),

          ...(myFields.length ? [{ value: 'Clear previous runs', label: 'Clear previous runs' }] : []),
        ]}
        SelectProps={{
          value: selectedField,
          onChange: handleDropdown,
          'data-test': 'dropdown-fields',
        }}
        formSx={{ minWidth: 200 }}
        menuSx={{
          fontWeight: 'bold',
          color: 'white',
          backgroundColor: 'green',
          opacity: 1,
        }}
      />

      {downloadCSVFailed && (
        <Dialog
          open={downloadCSVFailed}
          onClose={() => setDownloadCSVFailed(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Download Failed</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">Download of CSV Failed. Please try again.</DialogContentText>
          </DialogContent>
          <DialogActions>
            <PSAButton buttonType="LightButton" title="Close" onClick={() => setDownloadCSVFailed(false)} autoFocus />
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default FieldDropdown;
