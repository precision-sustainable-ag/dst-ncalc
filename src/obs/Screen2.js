import {
  Input,
  RadioGroup,
  Radio,
  FormControlLabel,
} from '@material-ui/core';

const Screen2 = ({ps, parms}) => (
  <>
    <table>
      <tbody>
        <tr>
          <td>
            Is this a high organic matter soil?<br/>
            <small>(High organic matter soils are usually those that have been managed using conservation tillage with cover crops or organically for at least three years.)</small>
          </td>
          <td>
            <RadioGroup 
              value={parms.highOM}
            >
              <FormControlLabel value="Yes" control={<Radio id="highOM" />} label="Yes" />
              <FormControlLabel value="No"  control={<Radio id="highOM" />} label="No" />
            </RadioGroup>            
          </td>
        </tr>

        <tr>
          <td>
            Cover crop residue will be
          </td>
          <td>
            <RadioGroup 
              value={parms.nutrient}
            >
              <FormControlLabel value="Incorporated"         control={<Radio id="nutrient" />} label="Incorporated" />
              <FormControlLabel value="Left on the surface"  control={<Radio id="nutrient" />} label="Left on the surface" />
            </RadioGroup>            
          </td>
        </tr>

        <tr>
          <td>
            Dry cover crop biomass
          </td>
          <td>
            <Input
              {...ps('biomass')}
            />
            lbs/A
          </td>
        </tr>
      </tbody>
    </table>

    <table>
      <tbody>
        <tr>
          <td>
            Nitrogen in cover crop
          </td>
          <td>
            <Input
              {...ps('N')}
             />
             0.3-5.0%
          </td>
        </tr>

        <tr>
          <td>
            Carbohydrates in cover crop
          </td>
          <td>
            <Input
              {...ps('carb')}
            />
            0-100%
          </td>
        </tr>

        <tr>
          <td>
            Cellulose in cover crop
          </td>
          <td>
            <Input
              {...ps('cellulose')}
            />
            0-100%
          </td>
        </tr>

        <tr>
          <td>
            Lignin in cover crop
          </td>
          <td>
            <Input
              {...ps('lignin')}
            />
            0-100%
          </td>
        </tr>

        <tr>
          <td>
            Litter Water Content
          </td>
          <td>
            <Input
              {...ps('lwc')}
             />
          </td>
        </tr>

        <tr>
          <td>
            InitialFOMN
          </td>
          <td>
            <Input
              {...ps('InitialFOMN')}
             />
          </td>
        </tr>

        <tr>
          <td colSpan="2" className="center">
            <small>Carbohydrates + Cellulose + Lignin should equal 100%</small>
          </td>
        </tr>
      </tbody>
    </table>
  </>
) // Screen2

export default Screen2;