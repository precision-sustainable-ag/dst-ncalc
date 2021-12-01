import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

import {
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';

import {Autocomplete} from './Inputs';

import Myslider from './Slider';

import Icon from '@mui/material/Icon';

const CoverCrops = ({props, parms}) => {
  return (
    <Autocomplete
      multiple
      {...props('coverCrop')}

      groupBy={
        (option) => parms.species.Brassica.includes(option)  ? 'Brassica' :
                    parms.species.Broadleaf.includes(option) ? 'Broadleaf' :
                    parms.species.Grass.includes(option)     ? 'Grass' :
                    parms.species.Legume.includes(option)    ? 'Legume' :
                                                               'ERROR'
      }
      options={[
        ...parms.species.Grass,
        ...parms.species.Legume,
        ...parms.species.Brassica,
        ...parms.species.Broadleaf,
      ]}
    />    
  );
} // CoverCrops

const CoverCrop1 = ({props, parms, set, setScreen}) => {
  const max = parms.coverCrop.length ? parms.coverCrop.map(s => parms.maxBiomass[s]).sort((a, b) => b - a)[0] : 15000;

  return (
    <>
      <h1>Tell us about your Cover Crop</h1>
      <div className="inputs">
        <p>Cover Crop Species:</p>
        <CoverCrops
          props={props}
          set={set}
          parms={parms}
        />

        <p>Cover Crop Termination Date:</p>
        <DatePicker 
          selected={parms.killDate}
          onChange={date => set.killDate(date)}
        />

        <p/>
        <div>
          Dry Biomass
          <Icon>
            help
            <p>The amount of cover crop biomass on a dry weight basis. For taking a representative biomass sample for your field:</p>
            <ol>
              <li>Select multiple small areas that best represent mixture composition and biomass in your field.</li>
              <li>Collect all aboveground material using sickle/scissor/clipper from specified areas. Use quadrant for broadcasted and aerial-seeded cover crops or a measuring stick for drill-seeded cover crops.</li>
              <li>Record fresh weight of cover crop subsample in pounds (lb).</li>
              <li>Repeat step 2-3 for each subsample. Sum up all fresh weights (lb).</li>
              <li>Record the total number of cover crop subsamples harvested.</li>
              <li>Record quadrant size (ft<sup>2</sup>) or number and length of drill-lines harvested and drill spacing.</li>
              <li>Combine all cover crop subsamples together into one sample.</li>
              <li>Drying:
                <ul>
                  <li>
                    Sun dry method:
                    <ul>
                      <li>Spread all cover crops sampled out in a thin layer on a clean trap. </li>
                      <li>Sun dry cover crops for several days, turning it frequently, until it is crunchy. </li>
                      <li>Record total dry weight (lb).</li>
                    </ul>
                  </li>
                  <li>
                    Microwave dry method:
                    <ul>
                      <li>Take 3.5 ounces (100 g) of fresh material and spread out in a thin layer in a plate. </li>
                      <li>Heat at small intervals and reweigh until you reach a constant weight. </li>
                      <li>Record the final dry weight of subsample and determine moisture content (%) using the following equation.</li>
                      <li>Back calculate total dry weight (lb) using total fresh weight (lb) and moisture content (%).</li>
                    </ul>
                    <table>
                      <tbody>
                        <tr><td></td><td>Broadcasted or aerial-seeded</td><td>Drill-seeded</td></tr>
                        <tr><td>Total area sampled (ft<sup>2</sup>)</td><td>#samples × Quadrant size (ft<sup>2</sup>)</td><td>#samples ×#drill lines × length of drill lines (ft)×drill spacing (ft)</td></tr>
                        <tr><td>Fresh wet weight (lb/ac)</td><td colSpan="2">(Total fresh weight (lb)  )/(Total area sampled (ft<sup>2</sup>)) × 43,560 ft<sup>2</sup>/ac</td></tr>
                        <tr><td>Dry weight (lb/ac)</td><td colSpan="2">(Total dry weight (lb)  )/(Total area sampled (ft<sup>2</sup>))× 43,560 ft<sup>2</sup>/ac</td></tr>
                        <tr><td>Moisture content (%)</td><td colSpan="2">(Total fresh weight (lb)-Total dry weight (lb) )/(Total dry weight (lb))  ×100%</td></tr>
                      </tbody>
                    </table>
                  </li>
                </ul>
              </li>
              <li>Take a representative cover crop subsample and ship it to analytical lab for quality analysis. </li>
            </ol>
            <p>For more details on cover crop biomass sampling and taking a representative sub-sample for quality analysis, please refer <a target="_blank" rel="noreferrer" href="https://extension.uga.edu/publications/detail.html?number=C1077">here</a>.</p>
          </Icon>
          :

          <RadioGroup row aria-label="position" name="position" style={{display: 'inline-block', marginLeft: '1em'}}>
            <FormControlLabel
              value="lb/ac"
              control={<Radio id="unit" checked={parms.unit === 'lb/ac'}/>}
              label="lb/ac"
            />
            <FormControlLabel
              value="kg/ha"
              control={<Radio id="unit" checked={parms.unit === 'kg/ha'} />}
              label="kg/ha"
            />
          </RadioGroup>
        </div>
        <p/>
        <Myslider
          parm={'biomass'}
          min={0}
          max={max}
          props={props}
          parms={parms}
          set={set}
        />
        
        {parms.biomass > max &&
          <p className="warning">
            This biomass seems too high{parms.coverCrop.length > 1 ? ' for these particular species' : parms.coverCrop.length ? ' for this particular species' : ''}.<br/>
            Please make sure the biomass entered is on a dry matter basis.
          </p>
        }

        <div style={{margin: "2rem 0"}}>
          Cover Crop Water Content at Termination (g water/g dry biomass)
          <Icon>
            help
            <p>Use the following calculation to adjust default values:</p>
            <p>Cover Crop Water Content = (Total fresh weight - Total dry weight)/(Total dry weight)</p>
          </Icon>
          :
        </div>
        <Myslider
          parm={'lwc'}
          min={0}
          max={10}
          props={props}
          parms={parms}
          set={set}
          step={0.1}
        />
      </div>
  
      <div className="bn">
        <button onClick={() => setScreen('Soil')}>BACK</button>
        <button onClick={() => setScreen('CoverCrop2')}>NEXT</button>
      </div>
    </>
  )
} // CoverCrop1

const CoverCrop2 = ({props, parms, set, setScreen, update}) => {
  return (
    <>
      <h1>Tell us about your Cover Crop Quality</h1>
      <div className="inputs">
        <p>
          Nitrogen (%)
          <Icon>
            help
            Cover crop nitrogen concentration based on lab results.
          </Icon>
          :
        </p>
        <Myslider
          parm={'N'}
          min={0}
          max={6}
          props={props}
          parms={parms}
          set={set}
          step={0.1}
          update={update}
        />
        <p/>
        <hr/>
        {parms.N ? <p className="note">Adjust default values below based on lab results.</p> : ''}
        <p/>
        <div>
          Carbohydrates (%)
          <Icon>
            help
            <p>Non-structural labile carbohydrate concentration based on lab results. This represents the most readily decomposable C constituents in plant materials.</p>
            <p>The default value is based on the nitrogen concentration.</p>
            <p>If you have the raw data from near infra-red reflectance spectroscopy (NIRS) analysis, use the following equation:</p>
            <p>carbohydrates (%) = % crude protein (CP) + % fat + % non-fibrous carbohydrates (NFC)</p>
          </Icon>
          :
        </div>
        <p/>
        <Myslider
          parm={'carb'}
          min={20}
          max={70}
          props={props}
          parms={parms}
          set={set}
          step={0.1}
          update={update}
        />

        <p/>
        <div>
          Holo-cellulose (%)
          <Icon>
            help
            <p>Structural holo-cellulose (i.e., both cellulose and hemi-cellulose) concentration based on lab results. This represents the moderately decomposable C constituents in plant materials.</p>
            <p>The default value is based on the nitrogen concentration.</p>
            <p>If you have the raw data from near infra-red reflectance spectroscopy (NIRS) analysis, use the following equation:</p>
            <p>holo-cellulose (%) = % neutral detergent fiber (NDF) – (% lignin + % ash)</p>
          </Icon>
          :
        </div>
        <p/>
        <Myslider
          parm="cell"
          min={20}
          max={70}
          props={props}
          parms={parms}
          set={set}
          step={0.1}
          update={update}
        />

        <p/>
        <div>
          Lignin (%)
          <Icon>
            help
            <p>Structural lignin concentration based on lab results. This represents the most recalcitrant C constituents in plant materials.</p>
            <p>The default value is based on the nitrogen concentration.</p>
          </Icon>
          :
        </div>
        <p/>
        <Myslider
          parm="lign"
          min={1}
          max={10}
          props={props}
          parms={parms}
          set={set}
          step={0.1}
          update={update}
        />
      </div>
  
      <div className="bn">
        <button onClick={() => setScreen('CoverCrop1')}>BACK</button>
        <button onClick={() => setScreen('CashCrop')}>NEXT</button>
      </div>
    </>
  )
} // CoverCrop2

export {
  CoverCrop1,
  CoverCrop2,
}