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
        }}
      />
      <span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="tiny">{min}</span>
          <PSASlider
            value={Number(value)}
            onChange={(_, newValue) => {
              setValue(newValue);
            }}
            onChangeCommitted={() => { dispatch(set[id](value)); }}
            aria-labelledby="input-slider"
            min={min}
            max={max}
            step={step}
            valueLabelDisplay={val <= max ? 'off' : 'off'}
            tabIndex={-1}
            disabled={disabled}
          />
          <span className="tiny">{max}</span>
        </div>
      </span>
    </div>
  );
};

export default Myslider;
