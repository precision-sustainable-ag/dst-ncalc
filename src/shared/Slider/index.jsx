import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { PSATextField, PSASlider } from 'shared-react-components/src';

import { get, set } from '../../store/Store';

import './index.scss';

const Myslider = ({
  id, min, max, step = 1, disabled, marks = false, noTextfield = false,
}) => {
  const dispatch = useDispatch();
  const val = +useSelector(get[id]);
  const [value, setValue] = useState(val);

  min = +min;
  max = +max;

  useEffect(() => {
    setValue(val);
  }, [val]);

  return (
    <div className="slider">
      {!noTextfield && (
      <PSATextField
        variant="standard"
        disabled={disabled}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          dispatch(set[id](e.target.value));
        }}
        sx={{ mt: 0, mb: 2 }}
      />
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <Box
          sx={{
            fontSize: '70%',
            color: 'primary.dark',
            alignContent: 'center',
          }}
          aria-label={`Minimum value: ${min}`}
        >
          <span aria-hidden>{min}</span>
        </Box>
        <PSASlider
          value={Number(value)}
          onChange={(_, newValue) => {
            setValue(newValue);
          }}
          onChangeCommitted={(_, newValue) => {
            dispatch(set[id](newValue));
          }}
          aria-labelledby="input-slider"
          min={min}
          max={max}
          step={step}
          valueLabelDisplay={val <= max ? 'auto' : 'off'}
          disabled={disabled}
          marks={marks}
        />
        <Box
          sx={{
            fontSize: '70%',
            color: 'primary.dark',
            alignContent: 'center',
          }}
          aria-label={`Maximum value: ${max}`}
        >
          <span aria-hidden>{max}</span>
        </Box>
      </div>
    </div>
  );
};

export default Myslider;
