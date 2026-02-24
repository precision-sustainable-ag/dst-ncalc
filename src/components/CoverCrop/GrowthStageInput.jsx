/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Autocomplete from '@mui/material/Autocomplete';
import { PSATextField } from 'shared-react-components/src';
import { get, set } from '../../store/Store';

// This component will only display on satellite mode
const GrowthStageInput = () => {
  const dispatch = useDispatch();
  const plantGrowthStages = useSelector(get.plantGrowthStages);
  // const coverCropSpecieGroup = useSelector(get.coverCropSpecieGroup);
  const coverCropGrowthStage = useSelector(get.coverCropGrowthStage);
  const coverCrop = useSelector(get.coverCrop);

  const handleGrowthStageChange = (species, growthStage) => {
    const updatedGrowthStages = {...(coverCropGrowthStage || {}) };
    if (growthStage === null) {
      delete updatedGrowthStages[species];
    } else {
      updatedGrowthStages[species] = growthStage;
    }
    dispatch(set.coverCropGrowthStage(updatedGrowthStages));
  };

  return (
    Array.isArray(coverCrop) && coverCrop.length > 0 && (
      coverCrop.map((species, _) => {
        if (!species || species === 'ERROR') return null;

        const options = plantGrowthStages?.[species] || [];
        const value = coverCropGrowthStage?.[species] || null;

        return (
          <Autocomplete
            placeholder={`Select a cover crop Growth Stage for ${species}`}
            options={options}
            value={value}
            renderInput={(params) => <PSATextField {...params} label={`Select a cover crop growing stage for ${species}`} />}
            onChange={(el, va) => handleGrowthStageChange(species, va)}
            sx={{ mt: 2}}
          />
        );
      })
    )
  );
}; // GrowthStageInput

export default GrowthStageInput;
