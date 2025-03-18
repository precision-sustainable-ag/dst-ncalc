import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { useAuth0 } from '@auth0/auth0-react';
import { PSADropdown, PSATextField } from 'shared-react-components/src';
import {
  Box, Grid, Typography, useMediaQuery,
} from '@mui/material';
import Help from '../../shared/Help';
import { set, get } from '../../store/redux-autosetters';
import { historyStates } from '../../store/inits';
import { setAuthToken } from '../../utils/authToken';
import { loadHistory } from '../../utils/userHistory';
import { resetState } from '../../store/Store';

const HistorySelect = () => {
  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const dispatch = useDispatch();

  const field = useSelector(get.field);
  const { historyState, userHistoryList } = useSelector(get.user);

  const [fieldName, setFieldName] = useState(field);
  // eslint-disable-next-line no-nested-ternary
  const [selectedField, setSelectedField] = useState(field === '' ? '' : isAuthenticated ? `history-${field}` : `ncalc-${field}`);

  // get all fields from localStorage
  const myFields = Object.keys(localStorage).filter((key) => key.startsWith('ncalc-'));

  // Check if field name exists in user history
  const isFieldNameExisted = () => {
    if (historyState === historyStates.imported) return false;
    const result = userHistoryList.find((history) => history.label === 'history-'.concat(fieldName));
    return result !== undefined;
  };

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

  // reset history when fieldname is changed
  useEffect(() => {
    setFieldName(field);
    if (field === '' || selectedField === '') return;
    if (!userHistoryList.find((item) => item.label === `history-${field}`) && !myFields.find((item) => item === `ncalc-${field}`)) {
      setSelectedField('');
      dispatch(resetState());
      dispatch(set.field(field));
    }
  }, [field]);

  const handleDropdown = async (e) => {
    const fieldStr = e.target.value;
    setSelectedField(fieldStr);
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
      } catch (err) {
        console.log(key, err.message);
      }
    });
    dispatch(set.lwc(historyObj.lwc)); // avoid calculation
    dispatch(set.user.alertMessage('Loaded selections.'));
    dispatch(set.user.alertSeverity('success'));
    dispatch(set.user.showAlert(true));
  };

  /// ///// JSX RENDER ///// ////
  return (
    <Box
      sx={{
        marginTop: 3,
        padding: 4,
        borderRadius: 2,
        boxShadow: 5,
        textAlign: 'center',
      }}
    >
      <Typography mb={2}>
        Would you like to save your selection history? Simply give it a name, and your selections will be stored after you&apos;ve made all your
        selections.
      </Typography>
      <Grid container spacing="1rem">
        <Grid item xs={12} sm={6} display="flex" justifyContent={matchesMd ? 'center' : 'flex-end'} alignItems="center">
          <Typography>
            Name your field:
            <Help />
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} display="flex" justifyContent="flex-start" alignItems="center">
          <PSATextField
            label="Name your Field (optional)"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            error={isFieldNameExisted()}
            helperText={isFieldNameExisted() ? 'Field name existed!' : null}
            onBlur={() => {
              if (!isFieldNameExisted()) dispatch(set.field(fieldName));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isFieldNameExisted()) dispatch(set.field(fieldName));
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} display="flex" justifyContent={matchesMd ? 'center' : 'flex-end'} alignItems="center">
          <Typography mb={2}>Retrieve your previous selections here:</Typography>
        </Grid>
        <Grid item xs={12} sm={6} display="flex" justifyContent="flex-start" alignItems="center">
          <PSADropdown
            label="Histories"
            items={[
              ...(isAuthenticated
                ? [
                  { label: 'User History', isHeader: true },
                  ...userHistoryList.map((history) => ({
                    value: history.label,
                    label: history.label.replace('history-', ''),
                  })),
                ]
                : [
                  { label: 'My fields', isHeader: true },
                  ...myFields.map((fld) => ({
                    value: fld,
                    label: fld.replace('ncalc-', ''),
                  })),
                ]),
            ]}
            SelectProps={{
              value: selectedField,
              onChange: handleDropdown,
              'data-test': 'dropdown-fields',
              sx: { '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, .45)' } },
            }}
            formSx={{ minWidth: 200 }}
            menuSx={{
              fontWeight: 'bold',
              color: 'white',
              backgroundColor: 'green',
              opacity: 1,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default HistorySelect;
