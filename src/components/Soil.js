import {Input} from './Inputs';

const Soil = ({props, parms, setScreen}) => (
  <div>
    <h1>Tell us about your Soil</h1>
    {parms.gotSSURGO ? 
      <p className="note">
        The data below was pulled from the national soil database based on the location entered on the previous screen.<br/>
        You can adjust them if you have lab results.
      </p> :
      ''
    }

    <div className="inputs">
      Organic Matter (%):<br/>
      <Input type="number" {...props('OM')} autoFocus />
      <br/><br/>

      Bulk Density (g/cm<sup>3</sup>):<br/>
      <Input {...props('BD')} />

      <br/><br/>
      Soil Inorganic N (ppm):<br/>
      <Input {...props('InorganicN')} />
    </div>

    <div className="bn">
      <button onClick={() => setScreen('Location')  }>BACK</button>
      <button onClick={() => setScreen('CoverCrop1')}>NEXT</button>
    </div>
  </div>
) // Soil

export default Soil;