/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import { Stack } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
// import LeftSideBar from './subcomponents/LeftSideBar';
import RightSideBar from './subcomponents/RightSideBar';
import { get, set } from '../../store/redux-autosetters';
import useStoreMem from '../../hooks/useStoreMem';
// import { useFetchNitrogenArray } from '../../hooks/useFetchApi';
import { sidebarListData, summaryDataDefaults } from '../../constants';
import { useFetchModel } from '../../hooks/useFetchApi';

const Output = () => {
  const dispatch = useDispatch();
  const summaryData = useSelector(get.summaryData);
  const refs = sidebarListData.map(() => useRef(null));
  const isPM3DMode = useSelector(get.biomassCalcMode) === 'pm3d';
  const selectedField = useSelector(get.selectedField);
  const field = isPM3DMode ? selectedField?.properties?.fieldName : useSelector(get.field);
  const coverCrop = useSelector(get.coverCrop);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);
  const biomass = useSelector(get.biomass);
  const residueN = useSelector(get.residueN);
  const N = useSelector(get.N);
  const carb = useSelector(get.carb);
  const cell = useSelector(get.cell);
  const lign = useSelector(get.lign);
  const unit = useSelector(get.unit);
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const OM = useSelector(get.OM);
  const lwc = useSelector(get.lwc);
  const BD = useSelector(get.BD);
  const InorganicN = useSelector(get.InorganicN);

  // TODO: save the current field to localStorage
  useStoreMem();

  useFetchModel({
    lat, lon, N, OM, BD, unit, coverCropTerminationDate, cashCropPlantingDate, carb, cell, lign, biomass, lwc, InorganicN,
  });

  useEffect(() => {
    const tempSummaryData = JSON.parse(JSON.stringify(summaryData || summaryDataDefaults));
    tempSummaryData['Field name'].value = field;
    tempSummaryData.Species.value = coverCrop;
    tempSummaryData['Termination Date'].value = dayjs(coverCropTerminationDate, 'YYYY-MM-DD').format('MMM DD YYYY');
    tempSummaryData['Dry Biomass'].value = String(biomass).concat(' ').concat(unit);
    tempSummaryData['Residue N Content'].value = String(residueN).concat(' ').concat(unit);
    tempSummaryData.Carbohydrates.value = String(carb).concat(' %');
    tempSummaryData['Holo-cellulose'].value = String(cell).concat(' %');
    tempSummaryData.Lignin.value = String(lign).concat(' %');
    tempSummaryData.Nitrogen.value = String(N).concat(' %');
    dispatch(set.summaryData({ ...tempSummaryData }));
  }, [field, biomass]);

  return (
    <Stack direction="row" justifyContent="center">
      {/* <LeftSideBar sidebarListData={sidebarListData} refs={refs} /> */}
      <RightSideBar sidebarListData={sidebarListData} summaryData={summaryData} refs={refs} />
    </Stack>
  );
};
export default Output;
