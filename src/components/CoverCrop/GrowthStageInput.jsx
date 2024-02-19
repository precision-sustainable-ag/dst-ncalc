/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Autocomplete from '@mui/material/Autocomplete';
import { TextField } from '@mui/material';
import { get, set } from '../../store/Store';

const GrowthStageInput = ({ isSatelliteMode }) => {
  const dispatch = useDispatch();
  const plantGrowthStages = useSelector(get.plantGrowthStages);
  const coverCrop = useSelector(get.coverCrop);
  const coverCropSpecieGroup = useSelector(get.coverCropSpecieGroup);
  const coverCropGrowthStage = useSelector(get.coverCropGrowthStage);
  const [updateGrowthStage, setUpdateGrowthStage] = useState(false);

  useEffect(() => {
    setUpdateGrowthStage(!updateGrowthStage);
  }, [coverCrop]);

  return (
    isSatelliteMode && coverCrop && coverCropSpecieGroup && plantGrowthStages
    && (
      <Autocomplete
        key={updateGrowthStage}
        placeholder="Select a cover crop Growth Stage"
        disablePortal
        id="combo-box-demo"
        options={[
          ...plantGrowthStages[coverCropSpecieGroup],
        ]}
        sx={{ width: '100%' }}
        defaultValue={coverCropGrowthStage}
        renderInput={(params) => <TextField {...params} label="Select a cover crop growing stage" />}
        onChange={(el, va) => {
          dispatch(set.coverCropGrowthStage(va));
        }}
      />
    )
  );
}; // GrowthStageInput

export default GrowthStageInput;
