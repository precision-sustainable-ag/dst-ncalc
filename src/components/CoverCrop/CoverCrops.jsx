import React from 'react';
import { useSelector } from 'react-redux';
import { get } from '../../store/Store';
import Input from '../../shared/Inputs';

const CoverCrops = ({ isSatelliteMode }) => {
  const species = useSelector(get.species);
  return (
    <Input
      id="coverCrop"
      multiple={!isSatelliteMode}
      autoFocus
      getOptionLabel={(obj) => {
        let label = '';
        console.log('getOptionLabel', obj);
        if (obj && typeof obj === 'object') {
          console.log('getOptionLabel_11', obj);
          label = obj.value;
        } else {
          console.log('getOptionLabel_22', obj);
          label = obj;
        }
        return label;
      }}
      groupBy={
        (option) => {
          let out;
          if (species.Brassica.includes(option)) {
            out = 'Brassica';
          } else if (species.Broadleaf.includes(option)) {
            out = 'Broadleaf';
          } else if (species.Grass.includes(option)) {
            out = 'Grass';
          } else if (species.Legume.includes(option)) {
            out = 'Legume';
          } else {
            out = 'ERROR';
          }
          return out;
        }
      }
      options={[
        ...species.Grass,
        ...species.Legume,
        ...species.Brassica,
        ...species.Broadleaf,
      ]}
      placeholder={isSatelliteMode ? 'Select a cover crop' : 'Select one or more cover crops'}
    />
  );
}; // CoverCrops

export default CoverCrops;
