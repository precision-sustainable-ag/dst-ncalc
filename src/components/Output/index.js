/* eslint-disable no-console */
import { Box, Stack } from '@mui/material';
import React from 'react';
import LeftSideBar from './subcomponents/LeftSideBar';
import RightSideBar from './subcomponents/RightSideBar';

const wrapperStyles = {
  width: '100%',
};

const summaryData = {
  'Field name': {
    value: 'Example: Grass',
    desc: `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. 
    Aenean commodo ligula eget dolor. Aenean massa. Cum sociis 
    natoque penatibus et magnis dis parturient montes, nascetur 
    ridiculus mus. Donec quam felis, ultricies nec, pellentesque 
    eu, pretium quis, sem. Nulla consequat massa quis enim. Donec 
    pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. 
    In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. 
    Nullam dictum felis eu pede mollis pretium. 
    Integer tincidunt. Cras dapibus. Vivamus elementum `,
  },
  Species: {
    value: 'Rye',
    desc: `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. 
  Aenean commodo ligula eget dolor. Aenean massa. Cum sociis 
  natoque penatibus et magnis dis parturient montes, nascetur 
  ridiculus mus. Donec quam felis, ultricies nec, pellentesque 
  eu, pretium quis, sem. Nulla consequat massa quis enim. Donec 
  pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. 
  In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. 
  Nullam dictum felis eu pede mollis pretium. 
  Integer tincidunt. Cras dapibus. Vivamus elementum `,
  },
  'Termination Date': {
    value: 'Mar 21, 2019',
    desc: `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. 
    Aenean commodo ligula eget dolor. Aenean massa. Cum sociis 
    natoque penatibus et magnis dis parturient montes, nascetur 
    ridiculus mus. Donec quam felis, ultricies nec, pellentesque 
    eu, pretium quis, sem. Nulla consequat massa quis enim. Donec 
    pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. 
    In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. 
    Nullam dictum felis eu pede mollis pretium. 
    Integer tincidunt. Cras dapibus. Vivamus elementum `,
  },
  'Dry Biomass': {
    value: '5000 lb/ac',
    desc: `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. 
    Aenean commodo ligula eget dolor. Aenean massa. Cum sociis 
    natoque penatibus et magnis dis parturient montes, nascetur 
    ridiculus mus. Donec quam felis, ultricies nec, pellentesque 
    eu, pretium quis, sem. Nulla consequat massa quis enim. Donec 
    pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. 
    In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. 
    Nullam dictum felis eu pede mollis pretium. 
    Integer tincidunt. Cras dapibus. Vivamus elementum `,
  },
  'Residue N Content': {
    value: '30 lb/ac',
    desc: `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. 
    Aenean commodo ligula eget dolor. Aenean massa. Cum sociis 
    natoque penatibus et magnis dis parturient montes, nascetur 
    ridiculus mus. Donec quam felis, ultricies nec, pellentesque 
    eu, pretium quis, sem. Nulla consequat massa quis enim. Donec 
    pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. 
    In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. 
    Nullam dictum felis eu pede mollis pretium. 
    Integer tincidunt. Cras dapibus. Vivamus elementum `,
  },
  Carbohydrates: {
    value: '33 %',
    desc: `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. 
    Aenean commodo ligula eget dolor. Aenean massa. Cum sociis 
    natoque penatibus et magnis dis parturient montes, nascetur 
    ridiculus mus. Donec quam felis, ultricies nec, pellentesque 
    eu, pretium quis, sem. Nulla consequat massa quis enim. Donec 
    pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. 
    In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. 
    Nullam dictum felis eu pede mollis pretium. 
    Integer tincidunt. Cras dapibus. Vivamus elementum `,
  },
  'Holo-cellulose': {
    value: '58 %',
    desc: `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. 
    Aenean commodo ligula eget dolor. Aenean massa. Cum sociis 
    natoque penatibus et magnis dis parturient montes, nascetur 
    ridiculus mus. Donec quam felis, ultricies nec, pellentesque 
    eu, pretium quis, sem. Nulla consequat massa quis enim. Donec 
    pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. 
    In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. 
    Nullam dictum felis eu pede mollis pretium. 
    Integer tincidunt. Cras dapibus. Vivamus elementum `,
  },
  Lignin: {
    value: '9 %',
    desc: `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. 
    Aenean commodo ligula eget dolor. Aenean massa. Cum sociis 
    natoque penatibus et magnis dis parturient montes, nascetur 
    ridiculus mus. Donec quam felis, ultricies nec, pellentesque 
    eu, pretium quis, sem. Nulla consequat massa quis enim. Donec 
    pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. 
    In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. 
    Nullam dictum felis eu pede mollis pretium. 
    Integer tincidunt. Cras dapibus. Vivamus elementum `,
  },
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
