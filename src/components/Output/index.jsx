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
import { sidebarListData, summaryDataDefaults } from '../../constants';

const wrapperStyles = {
  width: '100%',
};

const Output = () => {
  const [summaryData, setSummaryData] = useState(summaryDataDefaults);
  const refs = sidebarListData.map(() => useRef(null));
  const field = useSelector(get.field);
  const coverCrop = useSelector(get.coverCrop);
  const coverCropTerminationDate = useSelector(get.coverCropTerminationDate);
  const biomass = useSelector(get.biomass);
  const residueC = useSelector(get.residueC);
  const carb = useSelector(get.carb);
  const cell = useSelector(get.cell);
  const lign = useSelector(get.lign);
  const unit = useSelector(get.unit);

  useStoreMem();
  useFetchNitrogenArray();

  useEffect(() => {
    const tempSummaryData = { ...summaryData };
    tempSummaryData['Field name'].value = field;
    tempSummaryData.Species.value = coverCrop;
    tempSummaryData['Termination Date'].value = dayjs(coverCropTerminationDate, 'YYYY-MM-DD').format('MMM DD YYYY');
    tempSummaryData['Dry Biomass'].value = String(biomass).concat(' ').concat(unit);
    tempSummaryData['Residue N Content'].value = String(residueC).concat(' ').concat(unit);
    tempSummaryData.Carbohydrates.value = String(carb).concat(' %');
    tempSummaryData['Holo-cellulose'].value = String(cell).concat(' %');
    tempSummaryData.Lignin.value = String(lign).concat(' %');
    setSummaryData({ ...tempSummaryData });
  }, [field, biomass]);

  return (
    <Box sx={wrapperStyles} id="gfdgdd">
      <Stack direction="row" justifyContent="space-between">
        <LeftSideBar sidebarListData={sidebarListData} refs={refs} />
        <RightSideBar sidebarListData={sidebarListData} summaryData={summaryData} refs={refs} />
      </Stack>
    </Box>
  );
};
export default Output;
