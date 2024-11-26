/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get, set } from '../../store/Store';
import { PSADropdown } from 'shared-react-components/src';

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

  const growthStageOptions = 
  plantGrowthStages && 
  plantGrowthStages[coverCropSpecieGroup] 
    ? plantGrowthStages[coverCropSpecieGroup].map(stage => ({
        label: stage,
        value: stage,
      }))
    : []

  return (
    isSatelliteMode && coverCrop && coverCropSpecieGroup && plantGrowthStages && coverCropSpecieGroup !== 'ERROR' && (
      <PSADropdown
        label="Select a cover crop growth stage"
        items={growthStageOptions}
        formSx={{ width: '100%' }}
        SelectProps={{
          value: coverCropGrowthStage,
          onChange: (e) => dispatch(set.coverCropGrowthStage(e.target.value)),
          variant: 'outlined',
        }}
      />
    )
  );
};

export default GrowthStageInput;
