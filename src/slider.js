import {Input, Slider} from '@material-ui/core';

const Myslider = ({parm, min, max, ps, sets, parms, step=1}) => {
  return (
    <div className="slider">
      <Input {...ps(parm)} />
      &nbsp;&nbsp;&nbsp;&nbsp;
      <span className="tiny">{min}</span>
      <Slider
        value={isFinite(parms[parm]) ? +(+parms[parm]).toFixed(step === 1 ? 0 : 1) : 0}
        onChange={(_, newValue) => sets[parm](+newValue)}
        aria-labelledby="input-slider"
        min={min}
        max={max}
        step={step}
        valueLabelDisplay={parms[parm] <= max ? 'on' : 'off'}
      />
      <span className="tiny">{max}</span>
    </div>
  )
}

export default Myslider;