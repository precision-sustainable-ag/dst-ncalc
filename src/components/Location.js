import GoogleMaps from './GoogleMaps';
import GoogleMapReact from 'google-map-react';

import {
  Input,
  // Icon,
  // OutlinedInput,
} from '@mui/material';

const Map = ({set, parms, props}) => {
  const mapChange = (e) => {
    set.lat(+e.lat.toFixed(4));
    set.lng(+e.lng.toFixed(4));

    const latlng = {
      lat: e.lat,
      lng: e.lng,
    };

    Geocoder
      .geocode({ location: latlng })
      .then(response => {
        const results = response.results;
        const location = results[0].formatted_address;
        set.location(location);

        let state = results ? results[0].address_components.filter(obj => obj.types[0] === 'administrative_area_level_1') : '';
        if (state) {
          state = state[0].long_name;
          set.state(state);
        } else {
          set.state('');
        }
      })
      .catch((e) => window.alert('Geocoder failed due to: ' + e));
  } // mapChange

  const Marker = () => (
    <img alt="marker" className="marker" src="marker.png" style={{height: '40px'}} />
  )

  const initGeocoder = ({ maps }) => {
    Geocoder = new maps.Geocoder();
  };

  return (
    <>
      <GoogleMaps set={set} props={props} parms={parms} />
      {
        parms.lat && parms.lng &&
        <div style={{ height: '400px', width: '100%' }} id="GoogleMap">
          <GoogleMapReact
            bootstrapURLKeys={{ key: 'AIzaSyD8U1uYvUozOeQI0LCEB_emU9Fo3wsAylg' }}
            center={{lat: +parms.lat, lng: +parms.lng}}
            zoom={parms.mapZoom}

            onGoogleApiLoaded={initGeocoder}
            
            yesIWantToUseGoogleMapApiInternals
            onClick={mapChange}
            onZoomAnimationEnd={set.mapZoom}
            onMapTypeIdChange={set.mapType}

            onLoad={
              // prevent tabbing through map
              // got to be a better way than setting a timeout
              setTimeout(() => {
                document.querySelectorAll('#GoogleMap *').forEach(item => item.setAttribute('tabindex', -1));
              }, 1000)
            }

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

/*
const Map2 = ({set, parms, props}) => {
  const mapChange = (e) => {
    set.lat(+e.lat.toFixed(4));
    set.lng(+e.lng.toFixed(4));
  } // mapChange

  const Marker = () => (
    <img alt="marker" className="marker" src="marker.png" style={{height: '40px'}} />
  )

  return (
    <>
      <GoogleMaps set={set} props={props} parms={parms} />

      <OutlinedInput
        className="field"
        label="Name your Field"
        notched={true}
        {...props('field')}
        autoComplete="off"
        style={{width: 'calc(50% - 2em)'}}
      />
      <Icon className="moveLeft">
        help
        <p>
          This input is optional.  If you enter a field name, you'll be able to rerun the model on this computer without re-entering your data.
        </p>
        <p>
          Notes:
        </p>
        <ul>
          <li>If you have multiple fields, you'll be able to select them from a drop-down menu in the upper-right.</li>
          <li>Your information is stored on your computer only.  It will not be uploaded to a server.</li>
          <li>If you clear your browser's cache, you'll need to re-enter your data the next time you run the program.</li>
        </ul>
      </Icon>
      
      {
        parms.lat && parms.lng &&
        <div style={{ height: '400px', width: '100%' }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: 'AIzaSyD8U1uYvUozOeQI0LCEB_emU9Fo3wsAylg' }}
            center={{lat: +parms.lat, lng: +parms.lng}}
            zoom={parms.mapZoom}

            yesIWantToUseGoogleMapApiInternals
            onClick={mapChange}
            onZoomAnimationEnd={set.mapZoom}
            onMapTypeIdChange={set.mapType}

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
} // Map2
*/

const Location = ({props, set, parms, setScreen}) => (
  <div>
    <h1>Where is your field located?</h1>
    <p>
      Enter your address or zip code to determine your field's location.<br/>
      You can then zoom in and click to pinpoint it on the map.
    </p>
    
    <Map set={set} parms={parms} props={props} />
    
    <div>
      Latitude:&nbsp;
      <Input {...props('lat')} />
      &nbsp;&nbsp;&nbsp;
      Longitude:&nbsp;
      <Input {...props('lng')} />
    </div>
    <div className="bn">
      <button onClick={() => setScreen('Home')}>BACK</button>
      <button onClick={() => setScreen('Soil')}>NEXT</button>
    </div>
  </div>
) // Location

let Geocoder;

export default Location;