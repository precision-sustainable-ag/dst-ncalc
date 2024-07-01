/* eslint-disable no-nested-ternary */
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
  const field = useSelector(get.field);
  const species = useSelector(get.species);

  useEffect(() => {
    setUpdateGrowthStage(!updateGrowthStage);
    if (species) {
      dispatch(set.coverCropSpecieGroup(
        species.brassica.includes(coverCrop)
          ? 'brassica'
          : species.broadleaf.includes(coverCrop)
            ? 'broadleaf'
            : species.grass.includes(coverCrop)
              ? 'grass'
              : species.legume.includes(coverCrop)
                ? 'legume'
                : 'ERROR',
      ));
    }
  }, [coverCrop, field, dispatch, species]);

  return (
    isSatelliteMode && coverCrop && coverCropSpecieGroup && plantGrowthStages && coverCropSpecieGroup !== 'ERROR'
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
        // defaultValue={coverCropGrowthStage}
        value={coverCropGrowthStage}
        renderInput={(params) => <TextField {...params} label="Select a cover crop growing stage" />}
        onChange={(el, va) => {
          dispatch(set.coverCropGrowthStage(va));
        }}
      />
    )
  );
}; // GrowthStageInput

export default GrowthStageInput;
