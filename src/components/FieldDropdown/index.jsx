/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable no-console */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { useFetchSampleBiomass } from '../../hooks/useFetchStatic';
import { downloadOutputCSV } from '../../hooks/helpers';
import { set, get } from '../../store/redux-autosetters';
import { PSADropdown } from 'shared-react-components/src';

const examples = {};

// TODO: component for the fields list at the right top corner of the page
const FieldDropdown = () => {
  /// ///// VARIABLES ///// ////
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const PSA = useSelector(get.PSA);
  const field = useSelector(get.field);
  const model = useSelector(get.model);
  const dates = useSelector(get.dates);
  const [downloadCSVFailed, setDownloadCSVFailed] = useState(false);

  const myFields = Object.keys(localStorage).filter((key) => key.startsWith('ncalc-'));

  useFetchSampleBiomass();

  /// ///// FUNCTIONS ///// ////
  const changePSA = (e) => {
    const PSAval = examples[e.target.value];

    Object.keys(PSAval).forEach((key) => {
      try {
        dispatch(set[key](PSAval[key]));
      } catch (ee) {
        console.log(ee);
        console.log(key);
      }
    });
  }; // changePSA

  const loadField = (fieldVal) => {
    if (fieldVal === 'Example: Grass') {
      dispatch(set.mapPolygon([]));
      dispatch(set.biomassTaskResults(null));
      dispatch(set.edited(true));
      dispatch(set.activeExample(fieldVal));
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
    } else if (fieldVal === 'Example: Legume') {
      dispatch(set.mapPolygon([]));
      dispatch(set.biomassTaskResults(null));
      dispatch(set.edited(true));
      dispatch(set.activeExample(fieldVal));
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
    } else if (fieldVal === 'Download data') {
      if (model && dates) {
        downloadOutputCSV(model, dates);
      } else {
        setDownloadCSVFailed(true);
      }
    } else {
      const newFieldVal = 'ncalc-'.concat(fieldVal);
      const inputs = JSON.parse(localStorage[newFieldVal]);
      Object.keys(inputs).forEach((key) => {
        try {
          if (/Date/.test(key)) {
            const date = moment(inputs[key]).format('yyyy-MM-DD');
            dispatch(set[key](date));
          } else {
            dispatch(set[key](inputs[key]));
          }
        } catch (e) {
          console.log(key, e.message);
        }
      });
      dispatch(set.lwc(inputs.lwc)); // avoid calculation
    }
  };

  const handleDropdown = (e) => {
    const fieldStr = e.target.value;
    if (fieldStr === 'placeholder') {
      dispatch(set.field(''));
      return;
    }
    if (fieldStr === 'Clear previous runs') {
      if (window.confirm('Clear all previous runs?')) {
        localStorage.clear();
        navigate('home');
      }
    } else {
      loadField(fieldStr);
    }
  };

  /// ///// JSX RENDER ///// ////
  return (
    <div className="Init desktop">
      <PSADropdown
        label={PSA ? "examples" : ""}
        items={
          PSA
            ? [
              {
                label: 'Examples',
                isHeader: true,
              },
              ...Object.keys(examples)
                .filter((site) => examples[site].category === 'PSA')
                .sort()
                .map((site) => ({ value: site, label: site })),
            ]
            : [
              {
                label: 'My fields',
                isHeader: true,
              },
              { value: '', label: '' },
              ...myFields.map((fld) => ({
                value: fld.replace('ncalc-', ''),
                label: fld.replace('ncalc-', ''),
              })),
              {
                label: 'Example data',
                isHeader: true,
              },
              { value: '', label: '' },
              { value: 'Example: Grass', label: 'Example: Grass' },
              { value: 'Example: Legume', label: 'Example: Legume' },
              (pathname.includes('output') || myFields.length) && (
                {
                  label: 'Utilities',
                  isHeader: true,
                },
                { value: '', label: '' },
                { value: 'Download data', label: 'Download data' }),
              ...(myFields.length ? [{ value: 'Clear previous runs', label: 'Clear previous runs' }] : []),
            ]
        }
        SelectProps={{
          value: field,
          onChange: PSA ? changePSA : handleDropdown,
          'data-test': 'dropdown-fields',
        }}
        formSx={{ minWidth: 200 }}
        menuSx={{ fontWeight: "bold", color: "white", backgroundColor: "green", }}
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
            <DialogContentText id="alert-dialog-description">
              Download of CSV Failed. Please try again.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDownloadCSVFailed(false)} autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default FieldDropdown;
