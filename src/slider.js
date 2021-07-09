import {Input, Slider} from '@material-ui/core';

const Myslider = ({parm, min, max, ps, sets, parms}) => (
  <div className="slider">
    <Input {...ps(parm)} />
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="tiny">{min}</span>
    <Slider
      value={+parms[parm]}
      onChange={(_, newValue) => sets[parm](+newValue)}
      aria-labelledby="input-slider"
      min={min}
      max={max}
      marks={
        [
          {
            value: 1
          },
          {
            value: 3
          },
          {
            value: 5
          },
          {
            value: 7
          },
        ]
      }
      // marks={true}
      // step={1}
      // valueLabelDisplay="on"
    />
    <span className="tiny">{max}</span>
  </div>
);

export default Myslider;