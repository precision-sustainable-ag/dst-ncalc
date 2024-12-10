/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Autocomplete from '@mui/material/Autocomplete';
import { TextField } from '@mui/material';
import { get, set } from '../../store/Store';

// This component will only display on satellite mode
const GrowthStageInput = () => {
  const dispatch = useDispatch();
  const plantGrowthStages = useSelector(get.plantGrowthStages);
  const coverCropSpecieGroup = useSelector(get.coverCropSpecieGroup);
  const coverCropGrowthStage = useSelector(get.coverCropGrowthStage);

  const options = (coverCropSpecieGroup && coverCropSpecieGroup !== 'ERROR') ? plantGrowthStages[coverCropSpecieGroup] : [];

  return (
    <Autocomplete
      placeholder="Select a cover crop Growth Stage"
      options={options}
      value={coverCropGrowthStage}
      renderInput={(params) => <TextField {...params} label="Select a cover crop growing stage" />}
      onChange={(el, va) => {
        dispatch(set.coverCropGrowthStage(va));
      }}
    />
  );
}; // GrowthStageInput

export default GrowthStageInput;
