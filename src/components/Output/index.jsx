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

const wrapperStyles = {
  width: '100%',
};

const summaryDataDefaults = {
  'Field name': {
    value: 'not set',
    desc: `Name of the field 
          (e.g., “North Field”)`,
  },
  Species: {
    value: ['not set'],
    desc: `list of species in
           the cover crop mix`,
  },
  'Termination Date': {
    value: 'not set',
    desc: `Date when the 
          cover crop was terminated`,
  },
  'Dry Biomass': {
    value: 'not set',
    desc: `The amount of cover crop biomass
           on a dry weight basis`,
  },
  'Residue N Content': {
    value: 'not set',
    desc: `residue Nitrogen content 
            on a dry weight basis`,
  },
  Carbohydrates: {
    value: 'not set',
    desc: `Non-structural labile carbohydrate concentration 
          based on lab results. This represents the most readily
          decomposable C constituents in plant materials.
          The default value is based on the nitrogen concentration.
          If you have the raw data from near infra-red reflectance 
          spectroscopy (NIRS) analysis, use the following equation:
          carbohydrates 
          (%) = % crude protein (CP) + % fat + % non-fibrous carbohydrates (NFC)`,
  },
  'Holo-cellulose': {
    value: 'not set',
    desc: `Structural holo-cellulose (i.e., both cellulose and hemi-cellulose) 
          concentration based on lab results. This represents the moderately 
          decomposable C constituents in plant materials. The default value 
          is based on the nitrogen concentration. If you have the raw data 
          from near infra-red reflectance spectroscopy (NIRS) analysis, use the following equation:
          holo-cellulose (%) = % neutral detergent fiber (NDF) – (% lignin + % ash)`,
  },
  Lignin: {
    value: 'not set',
    desc: `Structural lignin concentration based on lab results. 
          This represents the most recalcitrant C constituents in 
          plant materials. The default value is based on the 
          nitrogen concentration.`,
  },
};

const sidebarListData = [
  {
    label: 'Summary',
    key: 'sidebar-nav-1',
    startPos: 0,
    endPos: 100,
  },
  {
    label: 'Nitrogen Released',
    key: 'sidebar-nav-2',
    startPos: 100,
    endPos: 200,
  },
  {
    label: 'Residue Remaining',
    key: 'sidebar-nav-3',
    startPos: 200,
    endPos: 300,
  },
  {
    label: 'Map Visualization',
    key: 'sidebar-nav-4',
    startPos: 300,
    endPos: 400,
  },
];

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
