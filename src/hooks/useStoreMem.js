/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { get } from '../store/redux-autosetters';
import { saveHistory } from '../utils/userHistory';
import { historyStates } from '../store/inits';

/** save current field data into localStorage and user history */
const useStoreMem = () => {
  /// //////////////////////////////////////////////
  // Home
  const biomassCalcMode = useSelector(get.biomassCalcMode);
  // Location
  const field = useSelector(get.field);
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const mapPolygon = useSelector(get.mapPolygon);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const coverCropPlantingDate = useSelector(get.coverCropPlantingDate);
  // Soil
  const OM = useSelector(get.OM);
  const BD = useSelector(get.BD);
  const N = useSelector(get.N);
  const InorganicN = useSelector(get.InorganicN);
  // Cover Crop 1
  const coverCrop = useSelector(get.coverCrop);
  const biomass = useSelector(get.biomass);
  const coverCropGrowthStage = useSelector(get.coverCropGrowthStage);
  //    coverCropTerminationDate(included in Location)
  const lwc = useSelector(get.lwc);
  // Cover Crop 2
  //    N(included in Soil)
  const carb = useSelector(get.carb);
  const cell = useSelector(get.cell);
  const lign = useSelector(get.lign);
  // Cash Crop
  const cashCrop = useSelector(get.cashCrop);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);
  const targetN = useSelector(get.targetN);
  // Summary
  //    Releaed Nitrogen
  const unit = useSelector(get.unit);
  const Yield = useSelector(get.yield);
  const nweeks = useSelector(get.nweeks);

  const outputN = useSelector(get.outputN);
  const mockup = useSelector(get.mockup);
  const gotModel = useSelector(get.gotModel);
  const errorModel = useSelector(get.errorModel);
  const errorCorn = useSelector(get.errorCorn);

  const { historyState, selectedHistory, userHistoryList } = useSelector(get.user);
  const { isAuthenticated } = useAuth0();

  const userHistory = {
    biomassCalcMode,
    //
    lat,
    lon,
    mapPolygon,
    coverCropTerminationDate,
    coverCropPlantingDate,
    //
    OM,
    BD,
    N,
    InorganicN,
    //
    coverCrop,
    biomass,
    coverCropGrowthStage,
    lwc,
    //
    carb,
    cell,
    lign,
    //
    cashCrop,
    cashCropPlantingDate,
    targetN,

    gotModel,
    unit,
    field,
    errorModel,
    errorCorn,
    mockup,
    yield: Yield,
    outputN,
    nweeks,
  };

  useEffect(() => {
    if (field && !field.includes('Example') && !field.includes('Mockup')) {
      try {
        localStorage.setItem('ncalc-'.concat(field), JSON.stringify(userHistory));
        if (isAuthenticated) {
          const history = {
            history: userHistory,
          };
          const name = 'history-'.concat(field);
          if (historyState !== historyStates.imported) saveHistory(name, history);
          else saveHistory(name, history, selectedHistory.id);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  return null;
};

export default useStoreMem;
