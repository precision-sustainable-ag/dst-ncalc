/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { get, set } from '../store/Store';

const WEATHER_API_URL = 'https://weather.covercrop-data.org';

/// Desc: useFetchHLS
/// ..............................................................................
/// ..............................................................................
//
const useFetchHLS = () => {
  const [endDate, setEndDate] = useState(null);
  const [cornData, setCornData] = useState(null);
  const dispatch = useDispatch();
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);

  useEffect(() => {
    const end = moment(cashCropPlantingDate)
      .add(110, 'days')
      .add(1, 'hour')
      .format('yyyy-MM-DD');
    setEndDate(end);
    // dispatch(set.cornN([]));
    dispatch(set.errorCorn(false));
    // eslint-disable-next-line max-len
    const url = `${WEATHER_API_URL}/hourly?lat=${lat}&lon=${lon}&start=${moment(
      cashCropPlantingDate,
    ).format(
      'yyyy-MM-DD',
    )}&end=${endDate}&attributes=air_temperature&options=predicted`;
    axios
      .get(url)
      .then(({ data }) => {
        if (data && data instanceof Array) {
          dispatch(set.cornN(data));
          setCornData(data);
        } else {
          dispatch(set.errorCorn(true));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [cashCropPlantingDate, endDate]);
  return cornData;
}; // useFetchHLS

export default useFetchHLS;
