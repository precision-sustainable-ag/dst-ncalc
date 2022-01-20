import {Input} from './Inputs';
import Icon from '@mui/material/Icon';

const Soil = ({props, parms, setScreen}) => (
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
      <Input type="number" {...props('OM')} autoFocus />

      <br/><br/>

      Bulk Density (g/cm<sup>3</sup>):
      <Icon>
        help
        <p>Soil bulk density in the surface (0-10cm) soil</p>
      </Icon>
      <br/>
      <Input {...props('BD')} />

      <br/><br/>
      Soil Inorganic N (ppm or mg/kg):
      <Icon>
        help
        <p>Soil inorganic nitrogen in the surface (0-10cm) soil</p>
      </Icon>
      <br/>
      <Input {...props('InorganicN')} />
    </div>

    <div className="bn">
      <button onClick={() => setScreen('Location')  }>BACK</button>
      <button onClick={() => setScreen('CoverCrop1')}>NEXT</button>
    </div>
  </div>
) // Soil

export default Soil;