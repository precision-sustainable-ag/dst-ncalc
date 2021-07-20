import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

import {
  TextField
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
  'Corn': 4000,
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
  'Soybeans': 2000,
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
    Grass:      ['Barley, Spring', 'Barley, Winter', 'Cereal Rye, Spring', 'Cereal Rye, Winter', 'Corn', 'Millet, Japanese', 'Millet, Pearl', 'Oats', 'Oats, Black', 'Oats, Spring', 'Ryegrass, Annual', 'Ryegrass, Perennial', 'Sorghum', 'Sorghum-sudangrass', 'Sudangrass', 'Teff', 'Triticale, Spring', 'Triticale, Winter', 'Wheat, Spring', 'Wheat, Winter'],
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

const CashCrops = ({sets, parms}) => {
  const crops = [
    'Alfalfa-Establishment',
    'Alfalfa-Maintenance',
    'Annual Flowers',
    'Annual Lespedeza',
    'Apples',
    'Arrowleaf Clover',
    'Asparagus',
    'Athletic Field',
    'Azaleas',
    'Bahia Grass Pasture',
    'Basil',
    'Beets',
    'Bentgrass Golf Greens',
    'Bermuda Golf Greens (Overseeded)',
    'Blackberries',
    'Blueberries',
    'Broccoli, fresh market',
    'Brown Top Millet',
    'Bunch Grapes',
    'Cabbage, fresh market',
    'Camellias',
    'Canola Spring Type',
    'Canola Winter Type',
    'Cantaloupes',
    'Carrots',
    'Cauliflower, fresh market',
    'Centipede Lawn - Establishment',
    'Centipede Lawn - Maintenance',
    'Chives',
    'Christmas Trees - Cedar',
    'Christmas Trees - Pine and Leyland Cypress',
    'Cilantro',
    'Citrus',
    'Coastal Bermuda - Hay',
    'Coastal Bermuda Pasture',
    'Collards, fresh market',
    'Common Bermuda Lawn',
    'Common Bermuda Pasture',
    'Cool Season Grass Mixtures',
    'Corn',
    'Cotton',
    'Crimson Clover',
    'Cucumbers',
    'Dallis Grass Pasture',
    'Dove Fields - Brown Top Millet, Proso, Sesame, and Buckwheat',
    'Dove Fields - Corn or Grain Sorghum',
    'Dove Fields - Peredovic Sunflower',
    'Eggplant',
    'Endive',
    'English Peas',
    'Fall Deer - Alfalfa',
    'Fall Deer - Forage Chicory',
    'Fall Deer Mix - Brassicas',
    'Fall Deer Mix - Cool season annual grasses',
    'Fall Deer Mix - Cool Season Grasses with Clover',
    'Fall Deer Mix - Legumes',
    'Fescue Hay',
    'Fescue Pasture',
    'Fescue-Clover Associations',
    'Field Nursery - Broadleaf Evergreen (production)',
    'Field Nursery - Deciduous Trees & Shrubs (production)',
    'Field Nursery - Deciduous Trees (pre-plant)',
    'Field Nursery - Evergreens (pre-plant)',
    'Field Nursery - Narrow Leaf Evergreen (production)',
    'Field Nursery - Shrubs (pre-plant)',
    'Figs',
    'Forage Chicory',
    'General Ornamental Shrubs',
    'Goldenseal',
    'Golf Fairways',
    'Golf Tees',
    'Grain Sorghum',
    'Grapes (bunch, hybrid)',
    'Grapes (muscadine)',
    'Greenhouse',
    'Greenhouse Tomatoes',
    'Ground Cover',
    'Herbs',
    'Home Vegetable Garden',
    'Hybrid Bermuda Lawn',
    'Hybrid Bermudas - Hay',
    'Hybrid Bermudas - Pasture',
    'Hybrid Millets',
    'Industrial Hemp',
    'Irish Potatoes',
    'Irrigated Corn Silage',
    'Kale, fresh market',
    'Kenaf',
    'Kentucky Bluegrass',
    'Kiwifruit',
    'Lettuce, fresh market',
    'Lima Beans',
    'Lupine',
    'Muscadine',
    'Mustard, fresh market',
    'Nectarines',
    'Okra',
    'Olives',
    'Onions',
    'Orchard Grass Pasture',
    'Ornamental Trees',
    'Parsley',
    'Peaches',
    'Peanuts',
    'Pears',
    'Pecans',
    'Pecans',
    'Pepper (Bell and Pimento)',
    'Pepper Transplants',
    'Perennial Flowers',
    'Perennial Peanuts',
    'Pine Plantation - Establishment',
    'Pine Plantation - Maintenance',
    'Pine Seedling Nursery',
    'Plums',
    'Pole Beans',
    'Pumpkin',
    'Radishes',
    'Raspberries',
    'Rhododendrons',
    'Rhubarb',
    'Roadside Turf - Establishment',
    'Roadside Turf - Maintenance',
    'Roses',
    'Ryegrass for Overseeding Lawns',
    'Seashore Paspalum',
    'Sericea',
    'Shade Trees',
    'Small Grain - Barley',
    'Small Grain - Oats',
    'Small Grain - Rye for Seed Production or Cover Crop',
    'Small Grain - Silage',
    'Small Grain - Wheat',
    'Snap Beans',
    'Sod Production Centipede',
    'Sod Production Hybrid Bermudas',
    'Sod Production St. Augustine',
    'Sod Production Tall Fescue',
    'Sod Production Zoysia',
    'Sorghum Silage',
    'Sorghum Sudan Hybrids',
    'Southern Peas',
    'Soybeans',
    'Spinach, fresh market',
    'Spring Flowering Bulbs',
    'Squash',
    'St. Augustine Lawn',
    'Staked Tomatoes',
    'Strawberries',
    'Subterranean Clover',
    'Sugar Cane',
    'Summer Bulbs',
    'Summer Deer Mix (Grass only)',
    'Summer Deer Mix (Legume only)',
    'Summer Deer Mix (Legumes and Grass)',
    'Summer Perennials Overseeded in Fall',
    'Sunflower',
    'Sweet Corn',
    'Sweet Potatoes',
    'Sweet Sorghum',
    'Switchgrass and other native grasses-Biomass and forage',
    'Switchgrass and other native grasses-Wildlife',
    'Tall Fescue Lawn',
    'Temporary Winter Grazing',
    'Tobacco (Average Pebble Soil)',
    'Tobacco (Low Moisture and Sandy Soils)',
    'Tobacco Plant Bed',
    'Tomato Transplants',
    'Truffles',
    'Turnips, fresh market',
    'Vetch',
    'Watermelon',
    'Wheat - Grain Sorghum Rotation',
    'Wheat - Soybean Rotation',
    'White Clover',
    'Wildlife Plots - Chufa',
    'Wildlife Plots - Temporary Winter Grazing',
    'Wine Grapes',
    'Zoysia Lawn'
  ];

  return (
    <Autocomplete
      value={parms.cashCrop || []}
      options={crops}
      onChange={(event, newValue) => sets.cashCrop(newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          label=""
          zplaceholder="Cash crop"
        />
      )}      
    />    
  );
} // CashCrops

const CoverCrop1 = ({ps, parms, sets, setScreen}) => {
  const max = parms.coverCrop.length ? parms.coverCrop.map(s => maxBiomass[s]).sort((a, b) => b - a)[0] : 15000;

  return (
    <>
      <h1>Tell us about your cover crop</h1>
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

        <p>Dry Biomass (lbs/acre):</p>
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
          Cover crop water content at termination (g water/g dry biomass): 
          <Icon>
            help
            Water content data is default.  Please change if you have real data.
          </Icon>
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

const CoverCrop2 = ({ps, parms, sets, setScreen}) => {
  return (
    <>
      <h1>Tell us about your cover crop quality</h1>
      <div className="inputs">
        <p>Nitrogen (%):</p>
        <Myslider
          parm={'N'}
          min={0}
          max={6}
          ps={ps}
          parms={parms}
          sets={sets}
          step={0.1}
        />

        <p>Carbohydrates (%):</p>
        <Myslider
          parm={'carb'}
          min={20}
          max={70}
          ps={ps}
          parms={parms}
          sets={sets}
          step={0.1}
        />

        <p>Cellulose (%):</p>
        <Myslider
          parm="cell"
          min={20}
          max={70}
          ps={ps}
          parms={parms}
          sets={sets}
          step={0.1}
        />

        <p>Lignin (%):</p>
        <Myslider
          parm="lign"
          min={1}
          max={10}
          ps={ps}
          parms={parms}
          sets={sets}
          step={0.1}
        />

        <p><em>Carbohydrates + Cellulose + Lignin should equal 100%</em></p>
      </div>
  
      <div className="bn">
        <button onClick={() => setScreen('CoverCrop1')}>BACK</button>
        <button onClick={() => setScreen('CoverCrop3')}>NEXT</button>
      </div>
    </>
  )
} // CoverCrop2

const CoverCrop3 = ({ps, parms, sets, setScreen}) => {
  return (
    <>
      <div className="inputs">
        <h1>Tell us about your cash crop</h1>
        <p>Cash Crop:</p>
        <CashCrops sets={sets} parms={parms} />

        <p>Cash crop planting date:</p>
        <DatePicker 
          selected={parms.plantingDate}
          onChange={date => sets.plantingDate(date)}
        />

        {parms.cashCrop === 'Corn' &&
          <>
            <p>Yield Goal (bushels/acre):</p>
            <Myslider
              parm={'yield'}
              min={0}
              max={300}
              ps={ps}
              parms={parms}
              sets={sets}
            />
          </>
        }

        <p>What is your target nitrogen fertilizer rate? (lbs/acre):</p>
        <Myslider
          parm={'targetN'}
          min={0}
          max={300}
          ps={ps}
          parms={parms}
          sets={sets}
        />
      </div>
  
      <div className="bn">
        <button onClick={() => setScreen('CoverCrop2')}>BACK</button>
        <button onClick={() => setScreen('Output2')   }>NEXT</button>
      </div>
    </>
  )
} // CoverCrop3

export {
  CoverCrop1,
  CoverCrop2,
  CoverCrop3,
}