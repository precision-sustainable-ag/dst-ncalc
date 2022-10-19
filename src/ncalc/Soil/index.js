import Icon from '@mui/material/Icon';
import {useSelector} from 'react-redux';
import {get} from '../../store/Store';

import Myslider from '../../shared/Slider';
import {Link} from 'react-router-dom';

const Soil = () => {
  const gotSSURGO = useSelector(get.gotSSURGO);

  return (
    <div>
      <h1>Tell us about your Soil</h1>
      {gotSSURGO ? 
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
          id="OM"
          min={0.1}
          max={5}
          step={0.1}
        />

        <br/><br/>

        Bulk Density (g/cm<sup>3</sup>):
        <Icon>
          help
          <p>Soil bulk density in the surface (0-10cm) soil</p>
        </Icon>
        <br/>
        <Myslider
          id="BD"
          min={0.8}
          max={1.8}
          step={0.1}
        />

        <br/><br/>
        Soil Inorganic N (ppm or mg/kg):
        <Icon>
          help
          <p>Soil inorganic nitrogen in the surface (0-10cm) soil</p>
        </Icon>
        <br/>
        <Myslider
          id="InorganicN"
          min={0}
          max={25}
        />
      </div>

      <div className="bn">
        <Link className="link" to={'/location'} >BACK</Link>
        <Link className="link" to={'/covercrop'}>NEXT</Link>
      </div>
    </div>
  )
} // Soil

export default Soil;