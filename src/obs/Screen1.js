import GoogleMaps from './GoogleMaps';
import GoogleMapReact from 'google-map-react';

import React from 'react';

import {
  Input,
  NativeSelect,
  Typography,
} from '@material-ui/core';

import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

const Map = ({sets, parms}) => {
  const mapChange = (e) => {
    sets.lat(+e.lat.toFixed(4));
    sets.lng(+e.lng.toFixed(4));
  } // mapChange

  const Marker = () => (
    <img alt="marker" className="marker" src="marker.png" style={{height: "40px"}} />
  )

  return (
    <>
      <GoogleMaps sets={sets} />
      {
        parms.lat && parms.lng &&
        <div style={{ height: '400px', width: '1000px' }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: 'AIzaSyD8U1uYvUozOeQI0LCEB_emU9Fo3wsAylg' }}
            center={{lat: +parms.lat, lng: +parms.lng}}
            zoom={parms.mapZoom}

            yesIWantToUseGoogleMapApiInternals
            onClick={mapChange}
            onZoomAnimationEnd={sets.mapZoom}
            onMapTypeIdChange={sets.mapType}

            options={(map) => ({
              mapTypeId: parms.mapType,
              fullscreenControl: false,
              scaleControl: true,
              mapTypeControl: true,
              mapTypeControlOptions: {
                style: map.MapTypeControlStyle.HORIZONTAL_BAR,
                mapTypeIds: [
                  'roadmap',
                  'satellite',
                  'hybrid',
                  'terrain'
                ]
              },
            })}
          >
            <Marker lat={+parms.lat} lng={+parms.lng} />
          </GoogleMapReact>
        </div>
      }
    </>
  );
} // Map

const Screen1 = ({ps, sets, parms}) => {
  const CoverCrop = () => (
    <>
      <NativeSelect
        {...ps('crop')}
      >
        {/* Grains */}
        {'Barley|Black oat|Cereal Rye|Millet|Pearl millet|German millet|Foxtail millet|Proso millet|Oat|Ryegrass|Sorghum/Sudangrass|Sorghum|Triticale|Wheat'
          .split('|')
          .map(s => <option value={s} key={s}>{s}</option>)
        }

        {/* Legumes */}
        {'Alfalfa|Berseem clover|Common vetch|Hairy vetch|Crimson clover|Red clover|Balansa clover|Subterranea|Cowpea|Austria pea|Field peas (Iron & Clay)|Sunn hemp|Soybean|Lupine|Pigeon pea|White clover'
          .split('|')
          .map(s => <option value={s} key={s}>{s}</option>)
        }

        {/* Broadleaves */}
        {'Radish|Mustard|Turnip|Canola|Rape|Buckwheat'
          .split('|')
          .map(s => <option value={s} key={s}>{s}</option>)
        }
      </NativeSelect>
      <br />
      Other: 
      <Input
        {...ps('coverCropOther')}
      />
    </>
  ) // CoverCrop

  return (
    <>
      <p>
        If you need instructions, click the <strong>Instructions</strong> tab above.
      </p>
      <p>
        Please answer the questions below and click "Next Page" when complete.
      </p>

      <table>
        <tbody>
          <tr>
            <td>
              Please enter your name
            </td>
            <td>
              <Input
                {...ps('name')}
              />
            </td>
          </tr>

          <tr>
            <td>
              Please enter the field name
            </td>
            <td>
              <Input
                {...ps('field')}
              />
            </td>
          </tr>

          <tr>
            <td>
              Enter the sample ID
            </td>
            <td>
              <Input
                {...ps('sample')}
              />
            </td>
          </tr>

          <tr>
            <td colSpan="2">
              <Typography variant="h5">
                Where is your field located?
              </Typography>
              <Typography variant="body2">
                Enter your address or zip code to determine your location.  You can then zoom in and click to pinpoint it.
              </Typography>
              
              <Map sets={sets} parms={parms} />
              
              Latitude:&nbsp;
              <Input {...ps('lat')} />
              &nbsp;&nbsp;&nbsp;
              Longitude:&nbsp;
              <Input {...ps('lng')} />
            </td>
          </tr>

          <tr>
            <td>
            </td>
          </tr>

          <tr className="hidden">
            <td>
              What is the CASH crop?
            </td>
            <td>
              <select id="cashCrop" data-test="007 Sweet Sorghum" data-placeholder="Search for a crop">
                <option></option>
              </select>
            </td>
          </tr>

          <tr>
            <td>
              What is your target nitrogen fertilizer rate?
              <div className="cropSheet hidden">
                (If unknown, see crop recommendation sheet for your cash crop <a target="cropSheet" className="cropSheet" href=".">here</a>.)
              </div>
            </td>
            <td>
              <Input
                {...ps('targetN')}
              /> lbs N/acre
              <div id="NRate"></div>
            </td>
          </tr>

          <tr>
            <td>
              What is the planting date of the cash crop?
            </td>
            <td>
              <DatePicker 
                selected={parms.plantingDate}
                onChange={date => sets.plantingDate(date)}
              />
            </td>
          </tr>
          <tr>
            <td>
              What is the COVER CROP?
            </td>
            <td>
              <CoverCrop />
            </td>
          </tr>

          <tr>
            <td>
              When was the cover crop killed or incorporated?
            </td>
            <td>
              <DatePicker 
                selected={parms.coverCropDate}
                onChange={date => sets.coverCropDate(date)}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
} // Screen1

Screen1.description = 'LOCATION';

export default Screen1;