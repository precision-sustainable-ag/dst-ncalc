/* eslint-disable no-alert */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Grid, Stack, Typography } from '@mui/material';
import { get, set } from '../../store/Store';

const Datebox = () => {
  /// Local States ///
  const [minPlantingDate, setMinPlantingDate] = useState(null);
  const [maxPlantingDate, setMaxPlantingDate] = useState(null);
  const [minTerminationDate, setMinTerminationDate] = useState(null);
  const [maxTerminationDate, setMaxTerminationDate] = useState(null);
  /// Shared States ///
  const coverCropPlantingDate = useSelector(get.coverCropPlantingDate);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const dispatch = useDispatch();

  useEffect(() => {
    const now = dayjs();
    const minPlantingDateObj = now.subtract(5, 'year');
    const maxPlantingDateObj = now.subtract(0, 'month');
    const minTerminationDateObj = dayjs(coverCropPlantingDate).add(2, 'month');
    const maxTerminationDateObj = dayjs(coverCropPlantingDate).add(12, 'month');
    setMinPlantingDate(minPlantingDateObj.format('YYYY-MM-DD'));
    setMaxPlantingDate(maxPlantingDateObj.format('YYYY-MM-DD'));
    setMinTerminationDate(minTerminationDateObj.format('YYYY-MM-DD'));
    setMaxTerminationDate(maxTerminationDateObj.format('YYYY-MM-DD'));
  }, [coverCropPlantingDate, coverCropTerminationDate]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Stack direction="column" spacing={1} justifyContent="center" alignItems="center">
          <Typography variant="body1" color="text.secondary">Planting Date</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date Selector"
              defaultValue={dayjs(coverCropPlantingDate)}
              minDate={dayjs(minPlantingDate)}
              maxDate={dayjs(maxPlantingDate)}
              value={dayjs(coverCropPlantingDate)}
              onChange={(newValue) => {
                dispatch(set.coverCropPlantingDate(newValue.format('YYYY-MM-DD')));
                return null;
              }}
            />
          </LocalizationProvider>
        </Stack>
      </Grid>
      <Grid item xs={12} md={6}>
        <Stack direction="column" spacing={1} justifyContent="center" alignItems="center">
          <Typography variant="body1" color="text.secondary">Termination Date</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date Selector"
              defaultValue={dayjs(coverCropTerminationDate)}
              minDate={dayjs(minTerminationDate)}
              maxDate={dayjs(maxTerminationDate)}
              value={dayjs(coverCropTerminationDate)}
              onChange={(newValue) => {
                dispatch(set.coverCropTerminationDate(newValue.format('YYYY-MM-DD')));
                return null;
              }}
            />
          </LocalizationProvider>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default Datebox;
