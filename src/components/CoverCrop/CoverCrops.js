import React from 'react';
import { useSelector } from 'react-redux';
import { get } from '../../store/Store';
import Input from '../../shared/Inputs';

const CoverCrops = () => {
  const species = useSelector(get.species);
  return (
    <Input
      multiple
      id="coverCrop"
      autoFocus
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
      placeholder="Select one or more cover crops"
    />
  );
}; // CoverCrops

export default CoverCrops;
