/* eslint-disable no-console */
import React from 'react';
import { useSelector } from 'react-redux';
import { get } from '../store/redux-autosetters';

const useStoreMem = () => {
  /// //////////////////////////////////////////////
  const field = useSelector(get.field);
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const BD = useSelector(get.BD);
  const N = useSelector(get.N);
  const killDate = useSelector(get.coverCropTerminationDate);
  const plantingDate = useSelector(get.coverCropPlantingDate);
  const InorganicN = useSelector(get.InorganicN);
  const cashCrop = useSelector(get.cashCrop);
  const Yield = useSelector(get.yield);
  const outputN = useSelector(get.outputN);
  const nweeks = useSelector(get.nweeks);
  const targetN = useSelector(get.targetN);
  const mockup = useSelector(get.mockup);
  const lwc = useSelector(get.lwc);
  const gotModel = useSelector(get.gotModel);
  const errorModel = useSelector(get.errorModel);
  const errorCorn = useSelector(get.errorCorn);
  const carb = useSelector(get.carb);
  const cell = useSelector(get.cell);
  const lign = useSelector(get.lign);
  const biomass = useSelector(get.biomass);
  const unit = useSelector(get.unit);
  const coverCrop = useSelector(get.coverCrop);

  if (field) {
    if (!/Example: Grass|Example: Legume/.test(field)) {
      try {
        localStorage.setItem(field, JSON.stringify({
          lat,
          lon,
          BD,
          N,
          killDate,
          plantingDate,
          carb,
          cell,
          lign,
          lwc,
          biomass,
          unit,
          InorganicN,
          coverCrop,
          field,
          gotModel,
          errorModel,
          errorCorn,
          // model,
          mockup,
          // cornN,
          cashCrop,
          yield: Yield,
          outputN,
          nweeks,
          targetN,
        }));
      } catch (ee) {
        console.log(ee);
      }
    }
  }
  return null;
};

export default useStoreMem;
