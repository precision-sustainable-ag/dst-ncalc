/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Autocomplete from '@mui/material/Autocomplete';
import { PSATextField } from 'shared-react-components/src';
import { get, set } from '../../store/Store';

const CoverCropsInput = ({ isSatelliteMode }) => {
  const dispatch = useDispatch();
  const species = useSelector(get.species);
  const coverCrop = useSelector(get.coverCrop);

  const [value, setValue] = useState(isSatelliteMode ? (coverCrop.length === 0 ? null : coverCrop[0]) : coverCrop);
  const [displayValue, setDisplayValue] = useState(isSatelliteMode ? (coverCrop.length === 0 ? '' : coverCrop[0]) : coverCrop);

  const getCoverCropSpeciesGroup = (crop) => {
    if (!species) return null;
    if (species.brassica.includes(crop)) { return 'brassica'; }
    if (species.broadleaf.includes(crop)) { return 'broadleaf'; }
    if (species.grass.includes(crop)) { return 'grass'; }
    if (species.legume.includes(crop)) { return 'legume'; }
    return 'ERROR';
  };

  return (
    <Autocomplete
      placeholder={isSatelliteMode ? 'Select a cover crop' : 'Select one or more cover crops'}
      autoFocus
      multiple={!isSatelliteMode}
      groupBy={(option) => {
        let out;
        if (species.brassica.includes(option)) {
          out = 'Brassica';
        } else if (species.broadleaf.includes(option)) {
          out = 'Broadleaf';
        } else if (species.grass.includes(option)) {
          out = 'Grass';
        } else if (species.legume.includes(option)) {
          out = 'Legume';
        } else {
          out = 'ERROR';
        }
        return out;
      }}
      options={species ? [...species.grass, ...species.legume, ...species.brassica, ...species.broadleaf] : []}
      renderInput={(params) => <PSATextField {...params} label={isSatelliteMode ? 'Select a cover crop' : 'Select one or more cover crops'} />}
      value={value}
      onChange={(e, val) => {
        setValue(val);
        if (!isSatelliteMode) {
          dispatch(set.coverCrop(val));
          return;
        }
        dispatch(set.coverCrop(val === null ? [] : [val]));
        dispatch(set.coverCropGrowthStage(null));
        const group = getCoverCropSpeciesGroup(val);
        dispatch(set.coverCropSpecieGroup(group));
      }}
      inputValue={displayValue}
      onInputChange={(e, val) => { setDisplayValue(val); }}
    />
  );
}; // CoverCropsInput

export default CoverCropsInput;
