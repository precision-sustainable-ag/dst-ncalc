import {Slider} from '@mui/material';
import {Input} from './Inputs'
import {useDispatch, useSelector} from 'react-redux';
import {get, set} from '../store/Store';

const Myslider = ({id, min, max, step=1, autoFocus, onInput}) => {
  const dispatch = useDispatch();
  let val = useSelector(get[id]);

  min = +min;
  max = +max;
  return (
    <div className="slider">
      <Input
        id={id}
        autoComplete="off"
        autoFocus={autoFocus}
        style={{width: '5em'}}
        onInput={onInput}
        variant="standard"
      />
      &nbsp;&nbsp;&nbsp;&nbsp;
      <span className="slider2">
        <span className="tiny">{min}</span>
        <Slider
          value={isFinite(val) ? +(+val).toFixed(step === 1 ? 0 : 1) : 0}
          
          // If we decide to use the slider functionality,
          // uncomment the onChange event, and
          // remove these defs in App.css:
          //   .MuiSlider-thumbColorPrimary
          //   .MuiSlider-root

            onChange={(_, newValue) => {
              if (onInput) {
                onInput();
              }
              dispatch(set[id](+newValue));
            }}
        
          aria-labelledby="input-slider"
          min={min}
          max={max}
          step={step}
          valueLabelDisplay={val <= max ? 'off' : 'off'}
          tabIndex={-1}
        />
        <span className="tiny">{max}</span>
      </span>
    </div>
  )
}

export default Myslider;
