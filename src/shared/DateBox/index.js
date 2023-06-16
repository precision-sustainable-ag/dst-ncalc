/* eslint-disable no-alert */
/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import './styles.scss';

const DateBox = ({ date, dateSetter }) => {
  // const biomassPlantDate = useSelector(get.biomassPlantDate);
  const dispatch = useDispatch();
  const handleDataChange = (newValue) => {
    const now = dayjs();
    const diff = now.diff(newValue, 'month', true);
    if (diff > 12) {
      alert('the start plant date can not be older than a year');
    } else if (diff < 0) {
      alert('the start plant date can not be in future');
    } else {
      dispatch(dateSetter(newValue.format('YYYY-MM-DD')));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Controlled picker"
        defaultValue={dayjs(date)}
        value={dayjs(date)}
        onChange={handleDataChange}
      />
    </LocalizationProvider>
  );
};

export default DateBox;
