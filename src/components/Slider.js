import {Input, Slider} from '@mui/material';

const Myslider = ({parm, min, max, props, set, parms, step=1, autoFocus}) => {
  return (
    <div className="slider">
      <Input
        {...props(parm)}
        autoComplete="off"
        autoFocus={autoFocus}        
      />
      &nbsp;&nbsp;&nbsp;&nbsp;
      <span className="tiny">{min}</span>
      <Slider
        value={isFinite(parms[parm]) ? +(+parms[parm]).toFixed(step === 1 ? 0 : 1) : 0}
        
        // If we decide to use the slider functionality,
        // uncomment the onChange event, and
        // remove these defs in App.css:
        //   .MuiSlider-thumbColorPrimary
        //   .MuiSlider-root

          onChange={(_, newValue) => {
            set[parm](+newValue);
          }}
       
        aria-labelledby="input-slider"
        min={min}
        max={max}
        step={step}
        valueLabelDisplay={parms[parm] <= max ? 'off' : 'off'}
        tabIndex={-1}
      />
      <span className="tiny">{max}</span>
    </div>
  )
}

export default Myslider;
