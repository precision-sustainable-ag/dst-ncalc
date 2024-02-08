/* eslint-disable import/prefer-default-export */
/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get, set } from '../store/Store';

const POLYGON_FILE_NAME = 'sample_polygon.json';
const BIOMASS_FILE_NAME = 'sample_biomass_result.json';
const CROPNAMES_FILE_NAME = 'crops.json';

/// Desc: useFetchSampleBiomass
/// ..............................................................................
/// ..............................................................................
//
const useFetchSampleBiomass = () => {
  const dispatch = useDispatch();
  const [polygon, setPolygon] = useState(null);
  const [biomass, setBiomass] = useState(null);
  const biomassCalcMode = useSelector(get.biomassCalcMode);
  const activeExample = useSelector(get.activeExample);
  // const biomassTaskResults = useSelector(get.biomassTaskResults);

  useEffect(() => {
    const HEADERS = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    // fetch sample polygon if example is active
    if (activeExample) {
      fetch(POLYGON_FILE_NAME, { HEADERS })
        .then((response) => response.json())
        .then((jsonObj) => {
          dispatch(set.mapPolygon(jsonObj));
          setPolygon(jsonObj);
          return null;
        });
      if (biomassCalcMode === 'satellite') {
        fetch(BIOMASS_FILE_NAME, { HEADERS })
          .then((response) => response.json())
          .then((jsonObj) => {
            dispatch(set.biomassTaskResults(jsonObj));
            setBiomass(jsonObj);
            return null;
          });
      }
      if (biomassCalcMode === 'sampled') {
        dispatch(set.biomassTaskResults(null));
        setBiomass(null);
      }
    }
  }, [biomassCalcMode, activeExample]);

  return [polygon, biomass];
};

/// Desc: useFetchCropNames
/// ..............................................................................
/// ..............................................................................
//
const useFetchCropNames = () => {
  const dispatch = useDispatch();
  const [cropNames, setCropNames] = useState(null);

  useEffect(() => {
    const HEADERS = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    // fetch sample polygon if example is active
    fetch(CROPNAMES_FILE_NAME, { HEADERS })
      .then((response) => response.json())
      .then((jsonObj) => {
        console.log('jsonObj', jsonObj);
        dispatch(set.cropNames(jsonObj));
        setCropNames(jsonObj);
        return null;
      });
  }, []);

  return cropNames;
};
export { useFetchSampleBiomass, useFetchCropNames };
