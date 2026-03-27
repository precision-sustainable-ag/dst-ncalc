/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Autocomplete from '@mui/material/Autocomplete';
import { PSATextField } from 'shared-react-components/src';
import { get, set } from '../../store/Store';

const GrowthStageInput = () => {
  const dispatch = useDispatch();
  const plantGrowthStages = useSelector(get.plantGrowthStages);
  // const coverCropSpecieGroup = useSelector(get.coverCropSpecieGroup);
  const coverCropGrowthStage = useSelector(get.coverCropGrowthStage);
  const coverCrop = useSelector(get.coverCrop);

  useEffect(() => {
    if (!plantGrowthStages || !coverCropGrowthStage) return;

    let needsUpdate = false;
    const updatedGrowthStages = { ...coverCropGrowthStage };

    Object.keys(updatedGrowthStages).forEach((species) => {
      const currentVal = updatedGrowthStages[species];
      const validOptions = plantGrowthStages[species] || [];

      if (!coverCrop.includes(species) || !validOptions.includes(currentVal)) {
        delete updatedGrowthStages[species];
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      dispatch(set.coverCropGrowthStage(updatedGrowthStages));
    }
  }, [plantGrowthStages, coverCrop]);

  const handleGrowthStageChange = (species, growthStage) => {
    const updatedGrowthStages = { ...(coverCropGrowthStage || {}) };
    if (growthStage === null) {
      delete updatedGrowthStages[species];
    } else {
      updatedGrowthStages[species] = growthStage;
    }
    dispatch(set.coverCropGrowthStage(updatedGrowthStages));
  };

  return (
    Array.isArray(coverCrop) && coverCrop.length > 0 && (
      coverCrop.map((species) => {
        if (!species || species === 'ERROR') return null;

        const options = plantGrowthStages?.[species] || [];
        const value = coverCropGrowthStage?.[species] || null;

        return (
          <Autocomplete
            key={species}
            placeholder={`Select a cover crop Growth Stage for ${species}`}
            options={options}
            value={value}
            renderInput={(params) => <PSATextField {...params} label={`Select a cover crop growing stage for ${species}`} />}
            onChange={(el, va) => handleGrowthStageChange(species, va)}
            sx={{ mt: 2 }}
          />
        );
      })
    )
  );
}; // GrowthStageInput

export default GrowthStageInput;
