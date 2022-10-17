import {Radio, RadioGroup, FormControlLabel} from '@mui/material';

import {Input} from '../shared/Inputs';

import Myslider from '../shared/Slider';

import Icon from '@mui/material/Icon';
import {useDispatch, useSelector} from 'react-redux';
import {get, set} from '../store/Store';
import {Link} from 'react-router-dom';

const CoverCrops = () => {
  const species = useSelector(get.species);
  return (
    <Input
      multiple

      id="coverCrop"

      autoFocus

      groupBy={
        (option) => species.Brassica.includes(option)  ? 'Brassica' :
                    species.Broadleaf.includes(option) ? 'Broadleaf' :
                    species.Grass.includes(option)     ? 'Grass' :
                    species.Legume.includes(option)    ? 'Legume' :
                                                         'ERROR'
      }

      options={[
        ...species.Grass,
        ...species.Legume,
        ...species.Brassica,
        ...species.Broadleaf,
      ]}

      placeholder="Select one or more cover crops"
    />
  );
} // CoverCrops

const CoverCrop1 = () => {
  const dispatch = useDispatch();
  const maxBiomass = useSelector(get.maxBiomass);
  const coverCrop = useSelector(get.coverCrop);
  const max = coverCrop.length ? coverCrop.map(s => maxBiomass[s]).sort((a, b) => b - a)[0] || 15000 : 15000;
  const freshMax = max * 4 || 30000;
  const biomass = useSelector(get.biomass);
  const unit = useSelector(get.unit);
  const freshBiomass = useSelector(get.freshBiomass);
  const species = useSelector(get.species);

  if (!species.Grass) {
    return '';
  }

  return (
    <>
      <h1>Tell us about your Cover Crop</h1>
      <div className="inputs">
        <p>Cover Crop Species:</p>
        <CoverCrops />

        <p>Cover Crop Termination Date:</p>
        <Input type="date" id="killDate" />

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
              control={<Radio id="unit" checked={unit === 'lb/ac'}/>}
              onChange={() => dispatch(set.unit('lb/ac'))}
              label="lb/ac"
            />
            <FormControlLabel
              value="kg/ha"
              control={<Radio id="unit" checked={unit === 'kg/ha'} />}
              onChange={() => dispatch(set.unit('kg/ha'))}
              label="kg/ha"
            />
          </RadioGroup>
        </div>

        <Myslider
          id="biomass"
          min={0}
          max={max}
        />
        
        {+biomass > +max &&
          <p className="warning">
            This biomass seems too high{coverCrop.length > 1 ? ' for these particular species' : coverCrop.length ? ' for this particular species' : ''}.<br/>
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
          id="freshBiomass"
          min={0}
          max={freshMax}
        />
        
        {+freshBiomass > +freshMax &&
          <p className="warning">
            This biomass seems too high{coverCrop.length > 1 ? ' for these particular species' : coverCrop.length ? ' for this particular species' : ''}.<br/>
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
          id="lwc"
          min={0}
          max={10}
          step={0.1}
        />
      </div>
  
      <div className="bn">
        <Link className="link" to={'/soil'}       >BACK</Link>
        <Link className="link" to={'/covercrop2'} >NEXT</Link>
      </div>
    </>
  )
} // CoverCrop1

const CoverCrop2 = () => {
  const N = useSelector(get.N);

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
          id="N"
          min={0}
          max={6}
          step={0.1}
        />
        <p/>
        <hr/>
        {N ? <p className="note">Adjust default values below based on lab results.</p> : ''}
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
          id="carb"
          min={20}
          max={70}
          step={0.1}
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
          id="cell"
          min={20}
          max={70}
          step={0.1}
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
          id="lign"
          min={1}
          max={10}
          step={0.1}
        />
      </div>
  
      <div className="bn">
        <Link className="link" to={'/covercrop'}>BACK</Link>
        <Link className="link" to={'/cashcrop'} >NEXT</Link>
      </div>
    </>
  )
} // CoverCrop2

CoverCrop1.desc = 'Cover Crop';
CoverCrop2.showInMenu = false;

export {
  CoverCrop1,
  CoverCrop2,
}