/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable no-console */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { PSAButton, PSADropdown } from 'shared-react-components/src';
import { useFetchSampleBiomass } from '../../hooks/useFetchStatic';
import { downloadOutputCSV } from '../../hooks/helpers';
import { set, get } from '../../store/redux-autosetters';
import { historyStates } from '../../store/inits';

// TODO: component for the fields list at the right top corner of the page
const FieldDropdown = () => {
  /// ///// VARIABLES ///// ////
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const model = useSelector(get.model);
  const dates = useSelector(get.dates);
  const [downloadCSVFailed, setDownloadCSVFailed] = useState(false);
  const [selectedField, setSelectedField] = useState('');

  // get all fields from localStorage
  const myFields = Object.keys(localStorage).filter((key) => key.startsWith('ncalc-'));

  // TODO: Load static data from examples here
  useFetchSampleBiomass();

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
      dispatch(set.lat(32.865389));
      dispatch(set.lon(-82.258361));
      dispatch(set.location('Example'));
      dispatch(set.field('Example: Grass'));
      dispatch(set.OM(0.75));
      dispatch(set.BD(1.62));
      dispatch(set.InorganicN(10));
      dispatch(set.coverCrop(['cereal rye']));
      dispatch(set.coverCropGrowthStage('stemming'));
      dispatch(set.coverCropPlantingDate('2018-09-01'));
      dispatch(set.coverCropTerminationDate('2019-03-21'));
      dispatch(set.cashCropPlantingDate('2019-04-01'));
      dispatch(set.biomass(5000));
      dispatch(set.lwc(1.486));
      dispatch(set.N(0.6));
      dispatch(set.carb(33.45));
      dispatch(set.cell(57.81));
      dispatch(set.lign(8.74));
      dispatch(set.cashCrop('Corn'));
      dispatch(set.yield(150));
      dispatch(set.targetN(150));
      dispatch(set.user.historyState(historyStates.imported));
    } else if (fieldStr === 'Example: Legume') {
      // navigate('location');
      dispatch(set.mapPolygon([]));
      dispatch(set.biomassTaskResults(null));
      dispatch(set.edited(true));
      dispatch(set.activeExample(fieldStr));
      dispatch(set.lat(32.865389));
      dispatch(set.lon(-82.258361));
      dispatch(set.location('Example'));
      dispatch(set.field('Example: Legume'));
      dispatch(set.OM(0.75));
      dispatch(set.BD(1.62));
      dispatch(set.InorganicN(10));
      dispatch(set.coverCrop('clover, crimson'));
      dispatch(set.coverCropGrowthStage('stemming'));
      dispatch(set.coverCropPlantingDate('2018-10-01'));
      dispatch(set.coverCropTerminationDate('2019-04-27'));
      dispatch(set.cashCropPlantingDate('2019-05-15'));
      dispatch(set.biomass(3500));
      dispatch(set.lwc(7.4));
      dispatch(set.N(3.5));
      dispatch(set.carb(56.18));
      dispatch(set.cell(36.74));
      dispatch(set.lign(7.08));
      dispatch(set.cashCrop('Corn'));
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

  /// ///// JSX RENDER ///// ////
  return (
    <div className="Init desktop">
      <PSADropdown
        label="Examples and utilities"
        items={
          [
            { label: 'Example data', isHeader: true },
            { value: 'Example: Grass', label: 'Example: Grass' },
            { value: 'Example: Legume', label: 'Example: Legume' },
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
          ]
        }
        SelectProps={{
          value: selectedField,
          onChange: handleDropdown,
          'data-test': 'dropdown-fields',
        }}
        formSx={{ minWidth: 200 }}
        menuSx={{
          fontWeight: 'bold', color: 'white', backgroundColor: 'green', opacity: 1,
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
