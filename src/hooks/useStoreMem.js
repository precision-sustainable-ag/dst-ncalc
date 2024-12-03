/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { get } from '../store/redux-autosetters';

/** save current field data into localStorage */
const useStoreMem = () => {
  /// //////////////////////////////////////////////
  // Location
  const field = useSelector(get.field);
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const mapPolygon = useSelector(get.mapPolygon);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const coverCropPlantingDate = useSelector(get.coverCropPlantingDate);
  // Soil
  const SSURGO = useSelector(get.SSURGO);
  const OM = useSelector(get.OM);
  const BD = useSelector(get.BD);
  const N = useSelector(get.N);
  const InorganicN = useSelector(get.InorganicN);
  // Cover Crop 1
  const coverCrop = useSelector(get.coverCrop);
  const biomass = useSelector(get.biomass);
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
  const cornN = useSelector(get.cornN);
  const model = useSelector(get.model);
  const unit = useSelector(get.unit);
  const Yield = useSelector(get.yield);
  const nweeks = useSelector(get.nweeks);

  const outputN = useSelector(get.outputN);
  const mockup = useSelector(get.mockup);
  const gotModel = useSelector(get.gotModel);
  const errorModel = useSelector(get.errorModel);
  const errorCorn = useSelector(get.errorCorn);

  const userHistory = {
    lat,
    lon,
    mapPolygon,
    coverCropTerminationDate,
    coverCropPlantingDate,
    //
    SSURGO,
    OM,
    BD,
    N,
    InorganicN,
    //
    coverCrop,
    biomass,
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
    model,
    mockup,
    cornN,
    yield: Yield,
    outputN,
    nweeks,
  };

  // save to localStorage after the model is fetched(should be updated to after model is calculated)
  useEffect(() => {
    if (model) {
      console.log('save history');
      // TODO: what if field don't have a name?
      if (field) {
        if (!field.includes('Example') && !field.includes('Mockup')) {
          try {
            localStorage.setItem('ncalc-'.concat(field), JSON.stringify(userHistory));
          } catch (ee) {
            console.log(ee);
          }
        }
      }
    }
  }, [model]);

  return null;
};

export default useStoreMem;
