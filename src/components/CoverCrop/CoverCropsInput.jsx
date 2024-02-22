/* eslint-disable no-nested-ternary */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Autocomplete from '@mui/material/Autocomplete';
import { TextField } from '@mui/material';
import { get, set } from '../../store/Store';
import Input from '../../shared/Inputs';

const CoverCropsInput = ({ isSatelliteMode }) => {
  const dispatch = useDispatch();
  const species = useSelector(get.species);
  const coverCrop = useSelector(get.coverCrop);

  if (!species) {
    return null;
  }

  return (
    isSatelliteMode
      ? (
        <Autocomplete
          placeholder="Select a cover crop"
          disablePortal
          id="combo-box-demo"
          autoFocus
          groupBy={
            (option) => {
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
            }
          }
          options={[
            ...species.grass,
            ...species.legume,
            ...species.brassica,
            ...species.broadleaf,
          ]}
          sx={{ width: '100%' }}
          // defaultValue={coverCrop ? coverCrop : ''}
          value={coverCrop}
          renderInput={(params) => <TextField {...params} label="Select a cover crop" />}
          onChange={(el, va) => {
            dispatch(set.coverCrop(va));
            dispatch(set.coverCropGrowthStage(null));
            if (species) {
              dispatch(set.coverCropSpecieGroup(
                species.brassica.includes(va)
                  ? 'brassica'
                  : species.broadleaf.includes(va)
                    ? 'broadleaf'
                    : species.grass.includes(va)
                      ? 'grass'
                      : species.legume.includes(va)
                        ? 'legume'
                        : 'ERROR',
              ));
            }
          }}
        />
      )
      : (
        <Input
          id="coverCrop"
          multiple
          autoFocus
          groupBy={
            (option) => {
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
            }
          }
          options={[
            ...species.grass,
            ...species.legume,
            ...species.brassica,
            ...species.broadleaf,
          ]}
          placeholder="Select one or more cover crops"
        />
      )
  );
}; // CoverCropsInput

export default CoverCropsInput;
