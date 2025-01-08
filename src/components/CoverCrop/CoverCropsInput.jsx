import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Autocomplete from '@mui/material/Autocomplete';
import { PSATextField } from 'shared-react-components/src';
import { get, set } from '../../store/Store';

const CoverCropsInput = ({ isSatelliteMode }) => {
  const dispatch = useDispatch();
  const species = useSelector(get.species);
  const coverCrop = useSelector(get.coverCrop);

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
      value={(isSatelliteMode ? coverCrop[0] : coverCrop) || null}
      renderInput={(params) => <PSATextField {...params} label={isSatelliteMode ? 'Select a cover crop' : 'Select one or more cover crops'} />}
      onChange={(e, val) => {
        // if covercrop is a string(in Autocomplete non multiple mode)
        dispatch(set.coverCrop(typeof val === 'string' ? [val] : val));
        if (!isSatelliteMode) return;
        dispatch(set.coverCropGrowthStage(null));
        const group = getCoverCropSpeciesGroup(val);
        dispatch(set.coverCropSpecieGroup(group));
      }}
    />
  );
}; // CoverCropsInput

export default CoverCropsInput;
