import {Input, Slider} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {get, sets} from '../store/Store';

const Myslider = ({parm, min, max, props, step=1, autoFocus, onInput}) => {
  props = () => {};

  const dispatch = useDispatch();
  let val = useSelector(get[parm]);

  return (
    <div className="slider">
      <Input
        {...props(parm)}
        id={parm}
        autoComplete="off"
        autoFocus={autoFocus}
        style={{width: '5em'}}
        onInput={onInput}
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

              dispatch(sets[parm](+newValue));
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
