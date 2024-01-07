/* eslint-disable no-console */
import { Box, Stack } from '@mui/material';
import React from 'react';
import LeftSideBar from './subcomponents/LeftSideBar';
import RightSideBar from './subcomponents/RightSideBar';

const wrapperStyles = {
  backgroundColor: 'lightBlue',
  width: '100%',
};

const Output = () => {
  console.log('Output');
  return (
    <Box sx={wrapperStyles}>
      <Stack direction="row" justifyContent="space-between">
        <LeftSideBar />
        <RightSideBar />
      </Stack>
    </Box>
  );
};
export default Output;
