import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { useAuth0 } from '@auth0/auth0-react';
import { PSADropdown } from 'shared-react-components/src';
import { set, get } from '../../store/redux-autosetters';
import { historyStates } from '../../store/inits';
import { setAuthToken } from '../../utils/authToken';
import { loadHistory } from '../../utils/userHistory';

const HistoryDropdown = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const dispatch = useDispatch();
  const userHistoryList = useSelector(get.user.userHistoryList);

  const [selectedField, setSelectedField] = useState('');

  // get all fields from localStorage
  const myFields = Object.keys(localStorage).filter((key) => key.startsWith('ncalc-'));

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
    <PSADropdown
      label="Histories"
      items={
          [...(isAuthenticated
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
            ])]
        }
      SelectProps={{
        value: selectedField,
        onChange: handleDropdown,
        'data-test': 'dropdown-fields',
      }}
      formSx={{ minWidth: 200 }}
      menuSx={{ fontWeight: 'bold', color: 'white', backgroundColor: 'green' }}
    />
  );
};

export default HistoryDropdown;
