/* eslint-disable max-len */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import { Box, Stack } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import LeftSideBar from './subcomponents/LeftSideBar';
import RightSideBar from './subcomponents/RightSideBar';
import { get } from '../../store/redux-autosetters';
import useStoreMem from '../../hooks/useStoreMem';
import { useFetchNitrogenArray } from '../../hooks/useFetchApi';
import { sidebarListDataSatpath, summaryDataDefaults } from '../../constants';

const wrapperStyles = {
  width: '100%',
};

const Index = () => {
  const [summaryData, setSummaryData] = useState(summaryDataDefaults);
  const field = useSelector(get.field);
  const coverCrop = useSelector(get.coverCrop);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const biomass = useSelector(get.biomass);
  const residueC = useSelector(get.residueC);
  const carb = useSelector(get.carb);
  const cell = useSelector(get.cell);
  const lign = useSelector(get.lign);
  const unit = useSelector(get.unit);
  const N = useSelector(get.N);
  const refs = Object.fromEntries(
    sidebarListDataSatpath.map(({ label, key }) => [key, { ref: useRef(null), label, key }]),
  );

  useStoreMem();
  useFetchNitrogenArray();

  useEffect(() => {
    const tempSummaryData = { ...summaryData };
    tempSummaryData['Field name'].value = field || 'not set';
    tempSummaryData.Species.value = (!coverCrop || coverCrop.length === 0) ? 'not set' : coverCrop;
    tempSummaryData['Termination Date'].value = coverCropTerminationDate ? dayjs(coverCropTerminationDate, 'YYYY-MM-DD').format('MMM DD YYYY') : 'not set';
    tempSummaryData['Dry Biomass'].value = biomass ? String(biomass).concat(' ').concat(unit) : 'not set';
    tempSummaryData['Residue N Content'].value = residueC ? String(residueC).concat(' ').concat(unit) : 'not set';
    tempSummaryData.Carbohydrates.value = carb ? String(carb).concat(' %') : 'not set';
    tempSummaryData['Holo-cellulose'].value = cell ? String(cell).concat(' %') : 'not set';
    tempSummaryData.Lignin.value = lign ? String(lign).concat(' %') : 'not set';
    tempSummaryData.Nitrogen.value = N ? String(N).concat(' %') : 'not set';
    setSummaryData({ ...tempSummaryData });
  }, [field, biomass, coverCrop, coverCropTerminationDate, residueC, carb, cell, lign, unit, N]);

  return (
    <Box sx={wrapperStyles} id="box-gf">
      <Stack direction="row" justifyContent="space-between">
        <LeftSideBar sidebarListData={sidebarListDataSatpath} refs={refs} />
        <RightSideBar sidebarListData={sidebarListDataSatpath} summaryData={summaryData} refs={refs} />
      </Stack>
    </Box>
  );
};
export default Index;
