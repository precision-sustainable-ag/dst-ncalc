import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PSATextField, PSASlider } from 'shared-react-components/src';

import { get, set } from '../../store/Store';

import './index.scss';

const Myslider = ({
  id, min, max, step = 1, disabled,
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
      <PSATextField
        variant="standard"
        disabled={disabled}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          dispatch(set[id](e.target.value));
        }}
      />
      <span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="tiny" aria-label={`Minimun value: ${min}`}>
            <span aria-hidden>{min}</span>
          </span>
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
            valueLabelDisplay={val <= max ? 'off' : 'off'}
            disabled={disabled}
          />
          <span className="tiny" aria-label={`Maximun value: ${max}`}>
            <span aria-hidden>{max}</span>
          </span>
        </div>
      </span>
    </div>
  );
};

export default Myslider;
