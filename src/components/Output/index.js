/* eslint-disable no-console */
import { Box, Stack } from '@mui/material';
import React from 'react';
import LeftSideBar from './subcomponents/LeftSideBar';
import RightSideBar from './subcomponents/RightSideBar';

const wrapperStyles = {
  width: '100%',
};

const summaryData = {
  'Field name': 'Example: Grass',
  Species: 'Rye',
  'Termination Date': 'Mar 21, 2019',
  'Dry Biomass': '5000 lb/ac',
  'Residue N Content': '30 lb/ac',
  Carbohydrates: '33 %',
  'Holo-cellulose': '58 %',
  Lignin: '9 %',
};

const Output = () => {
  console.log('Output');
  return (
    <Box sx={wrapperStyles}>
      <Stack direction="row" justifyContent="space-between">
        <LeftSideBar />
        <RightSideBar summaryData={summaryData} />
      </Stack>
    </Box>
  );
};
export default Output;
