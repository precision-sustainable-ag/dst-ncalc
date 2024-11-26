import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get, set } from '../../store/Store';
import { PSADropdown } from 'shared-react-components/src';

const CoverCropsInput = ({ isSatelliteMode }) => {
  const dispatch = useDispatch();
  const species = useSelector(get.species);
  const coverCrop = useSelector(get.coverCrop);

  if (!species) {
    return null;
  }

  const handleOnChange = (value) => {
    dispatch(set.coverCrop(value));
    dispatch(set.coverCropGrowthStage(null));
    dispatch(
      set.coverCropSpecieGroup(
        species.brassica.includes(value)
          ? 'brassica'
          : species.broadleaf.includes(value)
          ? 'broadleaf'
          : species.grass.includes(value)
          ? 'grass'
          : species.legume.includes(value)
          ? 'legume'
          : 'ERROR',
      )
    );
  };

  const items = [
    {label: 'Grass', isHeader: true, },
    ...species.grass.map((item) => ({ label: item, value: item, group: 'Grass' })),
    {label: 'Legume', isHeader: true, },
    ...species.legume.map((item) => ({ label: item, value: item, group: 'Legume' })),
    {label: 'Brassica', isHeader: true, },
    ...species.brassica.map((item) => ({ label: item, value: item, group: 'Brassica' })),
    {label: 'Broadleaf', isHeader: true, },
    ...species.broadleaf.map((item) => ({ label: item, value: item, group: 'Broadleaf' })),
  ];

  return isSatelliteMode ? (
    // Satellite Mode: Single selection with PSADropdown
    <PSADropdown
      label="Select a cover crop"
      items={items}
      formSx={{ width: '100%' }}
      SelectProps={{
        value: coverCrop || '',
        onChange: (event) => handleOnChange(event.target.value),
        variant: 'outlined',
        'data-test': 'coverCropDropdown',
      }}
      menuSx={{ fontWeight: "bold", color: "white", backgroundColor: "green", }}
    />
  ) : (
    // Non-Satellite Mode: Multiple selection with PSADropdown
    <PSADropdown
      label="Select one or more cover crops"
      items={items}
      formSx={{ width: '100%' }}
      SelectProps={{
        multiple: true,
        value: coverCrop || [],
        onChange: (event) => handleOnChange(event.target.value),
        variant: 'outlined',
        'data-test': 'coverCropDropdown',
      }}
      menuSx={{ fontWeight: "bold", color: "white", backgroundColor: "green", }}
    />
  );
};

export default CoverCropsInput;
