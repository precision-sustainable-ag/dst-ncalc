/* eslint-disable no-alert */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { get, set } from '../../store/Store';
import './styles.scss';

const DateBox = () => {
  /// Local States ///
  const [minPlantingDate, setMinPlantingDate] = useState(null);
  const [maxPlantingDate, setMaxPlantingDate] = useState(null);
  const [minTerminationDate, setMinTerminationDate] = useState(null);
  const [maxTerminationDate, setMaxTerminationDate] = useState(null);
  /// Shared States ///
  const biomassPlantDate = useSelector(get.biomassPlantDate);
  const biomassTerminationDate = useSelector(get.biomassTerminationDate);
  const dispatch = useDispatch();

  useEffect(() => {
    const now = dayjs();
    const minPlantingDateObj = now.subtract(12, 'month');
    const maxPlantingDateObj = now.subtract(0, 'month');
    const minTerminationDateObj = dayjs(biomassPlantDate).add(1, 'month');
    const maxTerminationDateObj = dayjs(biomassPlantDate).add(12, 'month');
    setMinPlantingDate(minPlantingDateObj.format('YYYY-MM-DD'));
    setMaxPlantingDate(maxPlantingDateObj.format('YYYY-MM-DD'));
    setMinTerminationDate(minTerminationDateObj.format('YYYY-MM-DD'));
    setMaxTerminationDate(maxTerminationDateObj.format('YYYY-MM-DD'));
  }, [biomassPlantDate, biomassTerminationDate]);

  return (
    <div className="wrapper">
      <div className="datebox">
        <div className="biomassItemText">Planting Date</div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date Selector"
            defaultValue={dayjs(biomassPlantDate)}
            minDate={dayjs(minPlantingDate)}
            maxDate={dayjs(maxPlantingDate)}
            value={dayjs(biomassPlantDate)}
            onChange={(newValue) => {
              dispatch(set.biomassPlantDate(newValue.format('YYYY-MM-DD')));
              return null;
            }}
          />
        </LocalizationProvider>
      </div>
      <div className="datebox">
        <div className="biomassItemText">Termination Date</div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date Selector"
            defaultValue={dayjs(biomassTerminationDate)}
            minDate={dayjs(minTerminationDate)}
            maxDate={dayjs(maxTerminationDate)}
            value={dayjs(biomassTerminationDate)}
            onChange={(newValue) => {
              dispatch(set.biomassTerminationDate(newValue.format('YYYY-MM-DD')));
              return null;
            }}
          />
        </LocalizationProvider>
      </div>
    </div>
  );
};

export default DateBox;
