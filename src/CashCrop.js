import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

import {
  TextField,
} from '@material-ui/core';

import Myslider from './slider';

import Autocomplete from '@material-ui/lab/Autocomplete';

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

const CashCrop = ({ps, parms, sets, setScreen}) => {
  return (
    <>
      <div className="inputs">
        <h1>Tell us about your Cash Crop</h1>
        <p>Cash Crop:</p>
        <CashCrops sets={sets} parms={parms} />

        <p>Cash crop planting date:</p>
        <DatePicker 
          selected={parms.plantingDate}
          onChange={date => sets.plantingDate(date)}
        />

        {parms.cashCrop === 'Corn' &&
          <>
            <p>Yield Goal (bu/ac):</p>
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

        <p>What is your target nitrogen fertilizer rate? ({parms.unit}):</p>
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
        <button onClick={() => setScreen('Output')    }>NEXT</button>
      </div>
    </>
  )
} // CashCrop
  
export default CashCrop;