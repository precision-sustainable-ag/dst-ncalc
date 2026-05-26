/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Autocomplete from '@mui/material/Autocomplete';
import { PSATextField } from 'shared-react-components/src';
import { get, set } from '../../store/Store';

const CoverCropsInput = ({ isSatelliteMode, isPM3DMode }) => {
  const dispatch = useDispatch();
  const species = useSelector(get.species);
  const coverCrop = useSelector(get.coverCrop);
  const coverCropGrowthStage = useSelector(get.coverCropGrowthStage);

  const [value, setValue] = useState(isSatelliteMode ? (coverCrop.length === 0 ? null : coverCrop[0]) : coverCrop);

  const handleCoverCropChange = (newValue) => {
    setValue(newValue);

    // Build species list depending on mode
    const speciesList = isSatelliteMode ? (newValue === null ? [] : [newValue]) : newValue;
    dispatch(set.coverCrop(speciesList));

    // Clean up growth stages for removed species
    const filteredStages = Object.fromEntries(
      Object.entries(coverCropGrowthStage || {}).filter(([s]) => speciesList.includes(s)),
    );
    dispatch(set.coverCropGrowthStage(filteredStages));
  };

  useEffect(() => {
    setValue(isSatelliteMode ? (coverCrop.length === 0 ? null : coverCrop[0]) : coverCrop);
  }, [isSatelliteMode, coverCrop]);

  return (
    <Autocomplete
      placeholder={isSatelliteMode ? 'Select a cover crop' : 'Select one or more cover crops'}
      autoFocus
      multiple={!isSatelliteMode}
      options={species ? [...species] : []}
      renderInput={(params) => <PSATextField {...params} label={isSatelliteMode ? 'Select a cover crop' : 'Select one or more cover crops'} />}
      value={value}
      onChange={(e, val) => handleCoverCropChange(val)}
      readOnly={isPM3DMode}
    />
  );
}; // CoverCropsInput

export default CoverCropsInput;
