import {
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';

import {Autocomplete, Input} from './Inputs';

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

      placeholder="Select one or more cover crops"
    />
  );
} // CoverCrops

const CoverCrop1 = ({props, parms, set, setScreen}) => {
  const max = parms.coverCrop.length ? parms.coverCrop.map(s => parms.maxBiomass[s]).sort((a, b) => b - a)[0] || 15000 : 15000;
  const freshMax = max * 4 || 30000;

  return (
    <>
      <h1>Tell us about your Cover Crop</h1>
      <div className="inputs">
        <p>Cover Crop Species:</p>
        <CoverCrops
          props={props}
          parms={parms}
        />

        <p>Cover Crop Termination Date:</p>
        <Input type="date" {...props('killDate')} />

        <p/>
        <div>
          Dry Biomass
          <Icon>
            help
            <p>The amount of cover crop biomass on a dry weight basis.</p>
            <p>For details on cover crop biomass sampling and taking a representative sub-sample for quality analysis, please refer to <a tabIndex="-1" target="_blank" rel="noreferrer" href="https://extension.uga.edu/publications/detail.html?number=C1077">here</a>.</p>
          </Icon>
          :

          <RadioGroup row aria-label="position" name="position" style={{display: 'inline-block', marginLeft: '1em'}}>
            <FormControlLabel
              value="lb/ac"
              control={<Radio id="unit" checked={parms.unit === 'lb/ac'}/>}
              onChange={() => set.unit('lb/ac')}
              label="lb/ac"
            />
            <FormControlLabel
              value="kg/ha"
              control={<Radio id="unit" checked={parms.unit === 'kg/ha'} />}
              onChange={() => set.unit('kg/ha')}
              label="kg/ha"
            />
          </RadioGroup>
        </div>

        <Myslider
          parm={'biomass'}
          min={0}
          max={max}
          props={props}
          parms={parms}
          set={set}
        />
        
        {+parms.biomass > +max &&
          <p className="warning">
            This biomass seems too high{parms.coverCrop.length > 1 ? ' for these particular species' : parms.coverCrop.length ? ' for this particular species' : ''}.<br/>
            Please make sure the biomass entered is on a dry matter basis.
          </p>
        }

        <br/>
        <div>
          Fresh Biomass
          <Icon>
            help
            <p>The amount of cover crop biomass on a wet weight basis.</p>
            <p>For details on cover crop biomass sampling and taking a representative sub-sample for quality analysis, please refer to <a tabIndex="-1" target="_blank" rel="noreferrer" href="https://extension.uga.edu/publications/detail.html?number=C1077">here</a>.</p>
          </Icon>
        </div>

        <Myslider
          parm={'freshBiomass'}
          min={0}
          max={freshMax}
          props={props}
          parms={parms}
          set={set}
        />
        
        {+parms.freshBiomass > +freshMax &&
          <p className="warning">
            This biomass seems too high{parms.coverCrop.length > 1 ? ' for these particular species' : parms.coverCrop.length ? ' for this particular species' : ''}.<br/>
            Please make sure the biomass entered is on a fresh matter basis.
          </p>
        }

        <div style={{marginTop: "2rem"}}>
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
          autoFocus
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
          onInput={() => set.edited(true)}
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
          onInput={() => set.edited(true)}
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
          onInput={() => set.edited(true)}
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