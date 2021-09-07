import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

import {
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@material-ui/core';

import Autocomplete from '@material-ui/lab/Autocomplete';

import Myslider from './slider';

import Icon from '@material-ui/core/Icon';

const maxBiomass = {
  'Alfalfa, Dormant': 5800,
  'Barley, Spring': 3000,
  'Barley, Winter': 5000,
  'Brassica, Forage': 2000,
  'Buckwheat': 3500,
  'Cereal Rye, Spring': 4000,
  'Cereal Rye, Winter': 11200,
  'Clover, Alsike': 1200,
  'Clover, Balansa': 3000,
  'Clover, Berseem': 3000,
  'Clover, Crimson': 8200,
  'Clover, Red': 5000,
  'Clover, White': 2000,
  'Cowpea': 8500,
  'Millet, Foxtail': 4100,
  'Millet, Japanese': 3500,
  'Millet, Pearl': 8000,
  'Mustard': 4000,
  'Oats': 6000,
  'Oats, Black': 9600,
  'Oats, Spring': 4000,
  'Pea, Spring': 2500,
  'Pea, Winter': 5600,
  'Phacelia': 6000,
  'Radish, Forage': 4000,
  'Radish, Oilseed': 3000,
  'Rape, Oilseed, Spring': 2000,
  'Rape, Oilseed, Winter': 2000,
  'Rapeseed, Forage': 2500,
  'Ryegrass, Annual': 9000,
  'Ryegrass, Perennial': 6000,
  'Sorghum': 8000,
  'Sorghum-sudangrass': 8000,
  'Sudangrass': 10000,
  'Sunflower': 5000,
  'Sunn Hemp': 11600,
  'Sweetclover, Yellow': 5000,
  'Teff': 5000,
  'Triticale, Spring': 3000,
  'Triticale, Winter': 7500,
  'Turnip, Forage': 3300,
  'Turnip, Purple Top': 3000,
  'Vetch, Hairy': 6300,
  'Wheat, Spring': 5000,
  'Wheat, Winter': 9400,
};

const CoverCrops = ({sets, parms}) => {
  const species = {
    Brassica:   ['Brassica, Forage', 'Mustard', 'Radish, Forage', 'Radish, Oilseed', 'Rape, Oilseed, Spring', 'Rape, Oilseed, Winter', 'Rapeseed, Forage', 'Turnip, Forage', 'Turnip, Purple Top'],
    Broadleaf:  ['Buckwheat', 'Phacelia', 'Sunflower'],
    Grass:      ['Barley, Spring', 'Barley, Winter', 'Cereal Rye, Spring', 'Cereal Rye, Winter', 'Millet, Japanese', 'Millet, Pearl', 'Oats', 'Oats, Black', 'Oats, Spring', 'Ryegrass, Annual', 'Ryegrass, Perennial', 'Sorghum', 'Sorghum-sudangrass', 'Sudangrass', 'Teff', 'Triticale, Spring', 'Triticale, Winter', 'Wheat, Spring', 'Wheat, Winter'],
    Legume:     ['Alfalfa, Dormant', 'Clover, Alsike', 'Clover, Balansa', 'Clover, Berseem', 'Clover, Crimson', 'Clover, Red', 'Clover, White', 'Cowpea', 'Pea, Spring', 'Pea, Winter', 'Soybeans', 'Sunn Hemp', 'Sweetclover, Yellow', 'Vetch, Hairy']
  };
  
  return (
    <Autocomplete
      multiple
      value={parms.coverCrop || []}
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
      onChange={(event, newValue) => sets.coverCrop(newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          label=""
          placeholder="Cover crop"
        />
      )}      
    />    
  );
} // CoverCrops

const CoverCrop1 = ({ps, parms, sets, setScreen}) => {
  const max = parms.coverCrop.length ? parms.coverCrop.map(s => maxBiomass[s]).sort((a, b) => b - a)[0] : 15000;

  return (
    <>
      <h1>Tell us about your Cover Crop</h1>
      <div className="inputs">
        <p>Cover Crop Species:</p>
        <CoverCrops
          ps={ps}
          sets={sets}
          parms={parms}
        />

        <p>Cover Crop Termination Date:</p>
        <DatePicker 
          selected={parms.killDate}
          onChange={date => sets.killDate(date)}
        />

        <div style={{marginTop: '1.2em', marginBottom: '1.2em'}}>
          Dry Biomass
          <Icon>
            help
            lorem ipsum
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

        <Myslider
          parm={'biomass'}
          min={0}
          max={max}
          ps={ps}
          parms={parms}
          sets={sets}
        />
        
        {parms.biomass > max &&
          <p className="warning">
            This biomass seems too high{parms.coverCrop.length > 1 ? ' for these particular species' : parms.coverCrop.length ? ' for this particular species' : ''}.<br/>
            Please make sure the biomass entered is on a dry matter basis.
          </p>
        }

        <p>
          Cover Crop Water Content at Termination (g water/g dry biomass)
          <Icon>
            help
            Water content data is default.  Please change if you have real data.
          </Icon>
          :
        </p>
        <Myslider
          parm={'lwc'}
          min={0}
          max={7}
          ps={ps}
          parms={parms}
          sets={sets}
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

const CoverCrop2 = ({ps, parms, sets, setScreen, update}) => {
  return (
    <>
      <h1>Tell us about your Cover Crop Quality</h1>
      <div className="inputs">
        <p>
          Nitrogen (%)
          <Icon>
            help
            lorem ipsum
          </Icon>
          :
        </p>
        <Myslider
          parm={'N'}
          min={0}
          max={6}
          ps={ps}
          parms={parms}
          sets={sets}
          step={0.1}
          update={update}
        />
        <p/>
        <hr/>
        {parms.N ? <p style={{color: "gray", fontSize: "15px"}}><em>Data values below are default based on your nitrogen value.  Please change these values if you have the measured data.</em></p> : ''}
        <p>
          Carbohydrates (%)
          <Icon>
            help
            lorem ipsum
          </Icon>
          :
        </p>
        <Myslider
          parm={'carb'}
          min={20}
          max={70}
          ps={ps}
          parms={parms}
          sets={sets}
          step={0.1}
          update={update}
        />

        <p>
          Cellulose (%)
          <Icon>
            help
            lorem ipsum
          </Icon>
          :
        </p>
        <Myslider
          parm="cell"
          min={20}
          max={70}
          ps={ps}
          parms={parms}
          sets={sets}
          step={0.1}
          update={update}
        />

        <p>
          Lignin (%)
          <Icon>
            help
            lorem ipsum
          </Icon>
          :
        </p>
        <Myslider
          parm="lign"
          min={1}
          max={10}
          ps={ps}
          parms={parms}
          sets={sets}
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