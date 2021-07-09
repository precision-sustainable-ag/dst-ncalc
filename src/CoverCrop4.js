import {
  Input,
  Slider
} from '@material-ui/core';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Myslider = ({desc, parm, min, max, ps, sets, parms}) => (
  <tr>
    <td>{desc}</td>
    <td>
      <table>
        <tbody>
          <tr>
            <td>
              <Input
                {...ps(parm)}
              />
            </td>
            <td>
              <Slider
                value={+parms[parm]}
                onChange={(_, newValue) => sets[parm](+newValue)}
                aria-labelledby="input-slider"
                min={min}
                max={max}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </td>
  </tr>
);

const CoverCrop = ({ps, sets, parms}) => {
  return (  
    <>
      <table className="coverCrop">
        <tbody>
          <tr>
            <td>
              Cover crop species:
            </td>
            <td>
              <select data-placeholder="Select one or more cover crops" multiple>
                <option></option>
                <optgroup label="Grains">
                  <option>Barley</option>
                  <option>Black oat</option>
                  <option>Cereal rye</option>
                  <option>Millet</option>
                  <option>Pearl millet</option>
                  <option>German millet</option>
                  <option>Foxtail millet</option>
                  <option>Proso millet</option>
                  <option>Oat</option>
                  <option>Ryegrass</option>
                  <option>Sorghum/Sudangrass</option>
                  <option>Sorghum</option>
                  <option>Triticale</option>
                  <option>Wheat</option>
                </optgroup>

                <optgroup label="Legumes">
                  <option>Alfalfa</option>
                  <option>Berseem clover</option>
                  <option>Common vetch</option>
                  <option>Hairy vetch</option>
                  <option>Crimson clover</option>
                  <option>Red clover</option>
                  <option>Balansa clover</option>
                  <option>Subterranean clover</option>
                  <option>Cowpea</option>
                  <option>Austrian winter pea</option>
                  <option>Field peas (Iron &amp; Clay)</option>
                  <option>Sunn hemp</option>
                  <option>Soybean</option>
                  <option>Lupine</option>
                  <option>Pigeon pea</option>
                  <option>White clover</option>
                </optgroup>

                <optgroup label="Broadleaves">
                  <option>Radish</option>
                  <option>Mustard</option>
                  <option>Turnip</option>
                  <option>Canola </option>
                  <option>Rape</option>
                  <option>Buckwheat</option>
                </optgroup>
              </select>          
            </td>
          </tr>

          <tr>
            <td>Cover crop kill date:</td>
            <td>
              <DatePicker 
                selected={parms.coverCropDate}
                onChange={date => sets.coverCropDate(date)}
              />
            </td>
          </tr>

          <tr>
            <td>Cash crop planting date:</td>
            <td>
              <DatePicker 
                selected={parms.plantingDate}
                onChange={date => sets.plantingDate(date)}
              />
            </td>
          </tr>

          <tr>
            <th colSpan="2">Cover crop quantity:</th>
          </tr>

          <Myslider
            desc="Dry biomass (lbs/ac)"
            parm={'biomass'}
            min={0}
            max={30000}
            ps={ps}
            parms={parms}
            sets={sets}
          />

          <Myslider
            desc="Water content (g/g)"
            parm={'waterContent'}
            min={0}
            max={1000}
            ps={ps}
            parms={parms}
            sets={sets}
          />

          <tr>
            <th colSpan="2">Cover crop quality:</th>
          </tr>

          <Myslider
            desc="Nitrogen (%)"
            parm={'N'}
            min={0}
            max={6}
            ps={ps}
            parms={parms}
            sets={sets}
          />

          <Myslider
            desc="Carbohydrates (%)"
            parm={'carb'}
            min={20}
            max={70}
            ps={ps}
            parms={parms}
            sets={sets}
          />

          <Myslider
            desc="Cellulose (%)"
            parm="cellulose"
            min={20}
            max={70}
            ps={ps}
            parms={parms}
            sets={sets}
          />

          <Myslider
            desc="Lignin (%)"
            parm="lignin"
            min={1}
            max={10}
            ps={ps}
            parms={parms}
            sets={sets}
          />

          <tr>
            <td colSpan="2" className="center">
              <small>Carbohydrates + Cellulose + Lignin should equal 100%</small>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
} // CoverCrop

export default CoverCrop;