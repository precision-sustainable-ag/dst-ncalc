import {
  Input,
} from '@mui/material';

const Soil = ({props, parms, setScreen}) => (
  <div>
    <h1>Tell us about your Soil</h1>
    {parms.gotSSURGO ? <p className="note">Adjust default values below based on lab results.</p> : ''}

    <div className="inputs">
      <p>Organic Matter (%):</p>
      <Input {...props('OM')} />

      <p>Bulk Density (g/cm<sup>3</sup>):</p>
      <Input {...props('BD')} />

      <p>Soil Inorganic N (ppm):</p>
      <Input {...props('InorganicN')} />
    </div>

    <div className="bn">
      <button onClick={() => setScreen('Location')  }>BACK</button>
      <button onClick={() => setScreen('CoverCrop1')}>NEXT</button>
    </div>
  </div>
) // Soil

export default Soil;