/* eslint-disable object-shorthand */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { get, set } from '../store/Store';

const NITROGEN_SURFACE_API_URL = 'https://api.covercrop-ncalc.org/surface';

/// Desc: useFetchNitrogen
/// ..............................................................................
/// ..............................................................................
//
const useFetchNitrogen = () => {
  // const [endDate, setEndDate] = useState(null);
  const [resData, setResData] = useState(null);
  const [arrayDim, setArrayDim] = useState(null);
  const dispatch = useDispatch();
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const bd = useSelector(get.BD);
  const n = useSelector(get.N);
  const lwc = useSelector(get.lwc);
  const carb = useSelector(get.carb);
  const lign = useSelector(get.lign);
  const cell = useSelector(get.cell);
  const biomassTaskResults = useSelector(get.biomassTaskResults);
  const nitrogenTaskResults = useSelector(get.nitrogenTaskResults);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);

  useEffect(() => {
    console.log('useFetchNitrogen biomassTaskResults: ', biomassTaskResults);
    console.log('useFetchNitrogen nitrogenTaskResults: ', nitrogenTaskResults);
    const end = moment(cashCropPlantingDate)
      .add(110, 'days')
      .add(1, 'hour');
    // setEndDate(end);
    if (biomassTaskResults && biomassTaskResults.data_array && biomassTaskResults.data_array.length > 0) {
      setArrayDim([biomassTaskResults.data_array.length, biomassTaskResults.data_array[0].length]);
    } else {
      return null;
    }
    const url = `${NITROGEN_SURFACE_API_URL}`;
    const payload = {
      lat: lat,
      lon: lon,
      bd: bd,
      dul: 0.27,
      ad: 0.14,
      start: moment(cashCropPlantingDate).format('yyyy-MM-DD'),
      end: end.format('yyyy-MM-DD'),
      biomass: biomassTaskResults.data_array.flat(1),
      n: n,
      lwc: lwc,
      carb: carb,
      cell: cell,
      lign: lign,
      output: 'json',
      simple: 'true',
      nonly: 'true',
    };
    const headers = {
      'Content-Type': 'application/json',
    };
    axios
      .post(url, payload, { headers: headers })
      .then(({ data }) => {
        if (data && data instanceof Array) {
          console.log('useFetchNitrogen data: ', data);
          // dispatch(set.cornN(data));
          setResData(data);
        } else {
          dispatch(set.errorCorn(true));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [cashCropPlantingDate, biomassTaskResults, n, lwc, carb, cell, lign, bd, lat, lon]);
  return resData;
}; // useFetchNitrogen

export default useFetchNitrogen;
