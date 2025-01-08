/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { useAuth0 } from '@auth0/auth0-react';
import { PSAButton, PSADropdown } from 'shared-react-components/src';
import { useFetchSampleBiomass } from '../../hooks/useFetchStatic';
import { downloadOutputCSV } from '../../hooks/helpers';
import { set, get } from '../../store/redux-autosetters';
import { historyStates } from '../../store/inits';
import { setAuthToken } from '../../utils/authToken';
import { loadHistory } from '../../utils/userHistory';

const examples = {};

// TODO: component for the fields list at the right top corner of the page
const FieldDropdown = () => {
  /// ///// VARIABLES ///// ////
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  // TODO: PSA is always false currently in prod and devs
  // In Home page: if (window.location.toString().includes('PSA'))dispatch(set.PSA(true));
  const PSA = useSelector(get.PSA);
  const userHistoryList = useSelector(get.user.userHistoryList);

  const model = useSelector(get.model);
  const dates = useSelector(get.dates);
  const [downloadCSVFailed, setDownloadCSVFailed] = useState(false);
  const [selectedField, setSelectedField] = useState('');

  // get all fields from localStorage
  const myFields = Object.keys(localStorage).filter((key) => key.startsWith('ncalc-'));

  // TODO: Load static data from examples here
  useFetchSampleBiomass();

  // fetch user history list
  useEffect(() => {
    const fetchUserData = async () => {
      const token = await getAccessTokenSilently();
      setAuthToken(token);
      // get new user histories here
      loadHistory()
        .then((res) => {
          dispatch(set.user.userHistoryList(res));
        })
        .catch((err) => {
          console.error(err);
        });
    };
    if (isAuthenticated) fetchUserData();
  }, [isAuthenticated, getAccessTokenSilently]);

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

  const handleDropdown = async (e) => {
    const fieldStr = e.target.value;
    console.log('fieldStr', fieldStr);
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
    } else {
      // Load field from localStorage & user history
      let historyObj;
      if (fieldStr.startsWith('ncalc-')) {
        historyObj = JSON.parse(localStorage[fieldStr]);
      }
      if (fieldStr.startsWith('history-')) {
        const history = await loadHistory(fieldStr);
        historyObj = history.json.history;
        // FIXME: need to resolve history with same name problem
        const selectedHistory = userHistoryList.find((historyItem) => historyItem.label === fieldStr);
        // set user history name and state
        dispatch(set.user.selectedHistory(selectedHistory));
      }
      dispatch(set.user.historyState(historyStates.imported));
      Object.keys(historyObj).forEach((key) => {
        try {
          if (/Date/.test(key)) {
            const date = moment(historyObj[key]).format('yyyy-MM-DD');
            dispatch(set[key](date));
          } else {
            dispatch(set[key](historyObj[key]));
          }
        } catch (err) { console.log(key, err.message); }
      });
      dispatch(set.lwc(historyObj.lwc)); // avoid calculation
    }
  };

  /// ///// JSX RENDER ///// ////
  return (
    <div className="Init desktop">
      <PSADropdown
        label={PSA ? 'examples' : ''}
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
              ...(isAuthenticated
                ? [
                  { label: 'User History', isHeader: true },
                  ...userHistoryList.map((history) => ({
                    value: history.label,
                    label: history.label.replace('history-', ''),
                  }))]
                : [
                  { label: 'My fields', isHeader: true },
                  ...myFields.map((fld) => ({
                    value: fld,
                    label: fld.replace('ncalc-', ''),
                  })),
                ]
              ),
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
          onChange: PSA ? changePSA : handleDropdown,
          'data-test': 'dropdown-fields',
        }}
        formSx={{ minWidth: 200 }}
        menuSx={{ fontWeight: 'bold', color: 'white', backgroundColor: 'green' }}
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
