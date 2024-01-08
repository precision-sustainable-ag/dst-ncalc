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
  const refs = sidebarListData.map(() => React.useRef(null));
  return (
    <Box sx={wrapperStyles}>
      <Stack direction="row" justifyContent="space-between">
        <LeftSideBar sidebarListData={sidebarListData} refs={refs} />
        <RightSideBar sidebarListData={sidebarListData} summaryData={summaryData} refs={refs} />
      </Stack>
    </Box>
  );
};
export default Output;
