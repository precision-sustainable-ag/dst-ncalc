/* eslint-disable no-unused-vars */
import React from 'react';
import { useSelector } from 'react-redux';
import OutputPath1 from './OutputPath1';
import OutputPath2 from './OutputPath2';
import { get } from '../../store/redux-autosetters';

const Output = () => {
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  return isSatelliteMode ? <OutputPath2 /> : <OutputPath1 />;
};
export default Output;
