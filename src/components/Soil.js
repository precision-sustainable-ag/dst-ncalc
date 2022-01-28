import {Input} from './Inputs';
import Icon from '@mui/material/Icon';

import Myslider from './Slider';

const Soil = ({props, parms, setScreen, set}) => (
  <div>
    <h1>Tell us about your Soil</h1>
    {parms.gotSSURGO ? 
      <>
        <p className="note">
          The data below was pulled from NRCS' Soil Survey Geographic database (SSURGO) based on your field's latitude/longitude coordinates.
        </p>
        <p className="note">
          You can adjust them if you have lab results.
        </p>
      </>
      :
      ''
    }

    <div className="inputs">
      Organic Matter (%):
      <Icon>
        help
        <p>Soil organic matter in the surface (0-10cm) soil</p>
      </Icon>
      <br/>
      <Myslider
        parm={'OM'}
        min={0.1}
        max={5}
        step={0.1}
        props={props}
        parms={parms}
        set={set}
      />

      <br/><br/>

      Bulk Density (g/cm<sup>3</sup>):
      <Icon>
        help
        <p>Soil bulk density in the surface (0-10cm) soil</p>
      </Icon>
      <br/>
      <Myslider
        parm={'BD'}
        min={0.8}
        max={1.8}
        step={0.1}
        props={props}
        parms={parms}
        set={set}
      />

      <br/><br/>
      Soil Inorganic N (ppm or mg/kg):
      <Icon>
        help
        <p>Soil inorganic nitrogen in the surface (0-10cm) soil</p>
      </Icon>
      <br/>
      <Myslider
        parm={'InorganicN'}
        min={0}
        max={25}
        props={props}
        parms={parms}
        set={set}
      />
    </div>

    <div className="bn">
      <button onClick={() => setScreen('Location')  }>BACK</button>
      <button onClick={() => setScreen('CoverCrop1')}>NEXT</button>
    </div>
  </div>
) // Soil

export default Soil;