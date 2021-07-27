import {
  Input,
} from '@material-ui/core';

const Soil = ({ps, parms, setScreen}) => (
  <div>
    <h1>Tell us about your Soil</h1>
    {parms.gotSSURGO ? <p><em>Data values are default based on your location.  Please change these values if you have the measured data.</em></p> : ''}

    <div className="inputs">
      <p>Organic Matter (%):</p>
      <Input {...ps('OM')} />

      <p>Bulk Density (g/cm<sup>3</sup>):</p>
      <Input {...ps('BD')} />

      <p>Soil Inorganic N (ppm):</p>
      <Input {...ps('InorganicN')} />
    </div>

    <div className="bn">
      <button onClick={() => setScreen('Location')  }>BACK</button>
      <button onClick={() => setScreen('CoverCrop1')}>NEXT</button>
    </div>
  </div>
) // Soil

export default Soil;