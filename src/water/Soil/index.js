import Icon from '@mui/material/Icon';
import {useSelector} from 'react-redux';
import {get} from '../../store/Store';

import Myslider from '../../shared/Slider';
import {Link} from 'react-router-dom';

const Soil = () => {
  const gotSSURGO = useSelector(get.gotSSURGO);
  const SSURGO = useSelector(get.SSURGO);

  if (!gotSSURGO) {
    return '';
  }

  console.log(SSURGO);

  const depth = {};
  SSURGO.forEach(data => {
    console.log(data);
    depth[`${data.hzdept_r} - ${data.hzdepb_r} cm`] = {
      sand: (+data.sandtotal_r).toFixed(1),
      silt: (+data.silttotal_r).toFixed(1),
      clay: (+data.claytotal_r).toFixed(1),
      om:   (+data.om_r).toFixed(2),
      bd:   data.dbthirdbar_r,
      th33:  data.wthirdbar_r,
      th1500: data.wfifteenbar_r      
    }
  });  

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

      <table>
        <thead>
          <tr style={{background: 'darkgreen', color: 'white', verticalAlign: 'bottom'}}>
            <th>Soil depth</th>
            <th>Sand<br/>(%)</th>
            <th>Silt<br/>(%)</th>
            <th>Clay<br/>(%)</th>
            <th>Organic matter<br/>(%)</th>
            <th>Bulk density<br/>(g/cm3)</th>
            <th>Drained upper limit<br/>(%)</th>
            <th>Crop lower limit<br/>(%)</th>
            <th>Soil inorganic N<br/>(ppm or mg/kg)</th>
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(depth).sort((a, b) => parseInt(a) - parseInt(b)).map(d => {
              return (
                <tr
                  key={d}
                  style={{textAlign: 'right'}}
                >
                  <td style={{textAlign: 'left', whiteSpace: 'nowrap'}}>{d}</td>
                  <td>{depth[d].sand}</td>
                  <td>{depth[d].silt}</td>
                  <td>{depth[d].clay}</td>
                  <td>{depth[d].om}</td>
                  <td>{depth[d].bd}</td>
                  <td>{depth[d].th33}</td>
                  <td>{depth[d].th1500}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>

      <div className="bn">
        <Link className="link" to={'/location'} >BACK</Link>
        <Link className="link" to={'/covercrop'}>NEXT</Link>
      </div>
    </div>
  );  
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