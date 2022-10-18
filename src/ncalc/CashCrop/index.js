import Myslider from '../../shared/Slider';

import {Input} from '../../shared/Inputs';

import Icon from '@mui/material/Icon';
import {useSelector} from 'react-redux';
import {get} from '../../store/Store';
import {Link} from 'react-router-dom';

const CashCrops = () => {
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
/*
  const PiedNRate = {
    'Asparagus' : 55,
    'Bahia Grass Pasture' : 125,
    'Basil' : 100,
    'Beets' : 100,
    'Broccoli, fresh market' : 165,
    'Brown Top Millet' : 60,
    'Cabbage, fresh market' : 165,
    'Canola Spring Type' : 160,
    'Canola Winter Type' : 155,
    'Cantaloupes' : 100,
    'Carrots' : 100,
    'Cauliflower, fresh market' : 165,
    'Chives' : 90,
    'Cilantro' : 100,
    'Coastal Bermuda - Hay' : 300,
    'Coastal Bermuda Pasture' : 200,
    'Collards, fresh market' : 165,
    'Common Bermuda Pasture' : 125,
    'Corn' : 150,
    'Cotton' : 90,
    'Cucumbers' : 100,
    'Dallis Grass Pasture' : 125,
    'Dove Fields - Brown Top Millet, Proso, Sesame, and Buckwheat' : 60,
    'Dove Fields - Corn or Grain Sorghum' : 100,
    'Dove Fields - Peredovic Sunflower' : 80,
    'Eggplant' : 138,
    'Endive' : 200,
    'English Peas' : 62,
    'Fall Deer - Forage Chicory' : 125,
    'Fall Deer Mix - Brassicas' : 80,
    'Fall Deer Mix - Cool Season Grasses with Clover' : 50,
    'Fescue Hay' : 150,
    'Fescue Pasture' : 75,
    'Field Nursery - Broadleaf Evergreen (production)' : 115,
    'Field Nursery - Deciduous Trees & Shrubs (production)' : 245,
    'Field Nursery - Deciduous Trees (pre-plant)' : 50,
    'Field Nursery - Evergreens (pre-plant)' : 50,
    'Field Nursery - Narrow Leaf Evergreen (production)' : 198,
    'Field Nursery - Shrubs (pre-plant)' : 50,
    'Figs (commercial)' : 100,
    'Forage Chicory' : 180,
    'Grain Sorghum' : 80,
    'Hybrid Bermudas - Hay' : 300,
    'Hybrid Bermudas - Pasture' : 200,
    'Hybrid Millets' : 210,
    'Irish Potatoes' : 135,
    'Kale, fresh market' : 165,
    'Kenaf' : 175,
    'Lettuce, fresh market' : 100,
    'Lima Beans' : 70,
    'Mustard, fresh market' : 165,
    'Okra' : 112,
    'Olives' : 90,
    'Onions (green bunching)' : 110,
    'Onions (mature and dry)' : 120,
    'Onions (plantbed)' : 105,
    'Orchard Grass Pasture' : 75,
    'Parsley' : 120,
    'Pepper (Bell and Pimento)' : 125,
    'Pepper Transplants' : 50,
    'Pole Beans' : 105,
    'Pumpkin' : 100,
    'Radishes' : 90,
    'Rhubarb' : 90,
    'Roadside Turf - Establishment' : 120,
    'Roadside Turf - Maintenance' : 60,
    'Small Grain - Barley' : 80,
    'Small Grain - Oats' : 80,
    'Small Grain - Rye for Seed Production or Cover Crop' : 50,
    'Small Grain - Silage' : 140,
    'Small Grain - Wheat' : 90,
    'Snap Beans' : 70,
    'Sod Production Centipede' : 165,
    'Sod Production Hybrid Bermudas' : 270,
    'Sod Production St. Augustine' : 240,
    'Sod Production Tall Fescue' : 112,
    'Sod Production Zoysia' : 240,
    'Sorghum Silage' : 150,
    'Sorghum Sudan Hybrids' : 210,
    'Southern Peas' : 50,
    'Spinach, fresh market' : 165,
    'Squash' : 100,
    'Staked Tomatoes' : 125,
    'Sugar Cane' : 80,
    'Summer Deer Mix (Grass only)' : 60,
    'Summer Deer Mix (Legumes and Grass)' : 30,
    'Sunflower' : 80,
    'Sweet Corn' : 175,
    'Sweet Potatoes' : 65,
    'Sweet Sorghum' : 80,
    'Switchgrass and other native grasses-Biomass and forage' : 62,
    'Switchgrass and other native grasses-Wildlife' : 62,
    'Temporary Winter Grazing' : 125,
    'Tobacco (Average Pebble Soil)' : 50,
    'Tobacco (Low Moisture and Sandy Soils)' : 60,
    'Tomato Transplants' : 50,
    'Truffles' : 40,
    'Turnips, fresh market' : 165,
    'Watermelon' : 100,
    'Wheat - Soybean Rotation' : 90,
    'Wildlife Plots - Chufa' : 40,
  }
*/
  return (
    <Input
      id="cashCrop"

      options={crops}

      autoFocus

      // onChange={(event, newValue) => {
      //   dispatch(set.targetN(PiedNRate[newValue] || 0));
      //   dispatch(set.cashCrop(newValue));
      // }}

      placeholder="Select a cash crop"
    />
  );
} // CashCrops

const CashCrop = () => {
  const unit = useSelector(get.unit);
  const cashCrop = useSelector(get.cashCrop);

  return (
    <>
      <h1>Tell us about your Cash Crop</h1>
      <div className="inputs">
        <p>Cash Crop:</p>
        <CashCrops />

        <p>Cash Crop Planting Date:</p>
        <Input type="date" id="plantingDate" />

        {cashCrop === 'Corn' &&
          <>
            <p>Yield Goal (bu/ac):</p>
            <Myslider
              id="yield"
              min={0}
              max={300}
            />
          </>
        }

        <p>
          What is your Target Nitrogen Fertilizer Rate? ({unit}):
          <Icon>
            help
            Please specify the target N rate for your region.
          </Icon>
        </p>

        <Myslider
          id="targetN"
          min={0}
          max={300}
        />
      </div>
  
      <div className="bn">
        <Link className="link" to={'/covercrop2'} >BACK</Link>
        <Link className="link" to={'/output'}     >NEXT</Link>
      </div>
    </>
  )
} // CashCrop
  
CashCrop.desc = 'Cash Crop';

export default CashCrop;