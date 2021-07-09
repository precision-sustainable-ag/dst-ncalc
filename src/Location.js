import GoogleMaps from './GoogleMaps';

import GoogleMapReact from 'google-map-react';

import React from 'react';

import {
  Input,
} from '@material-ui/core';

import 'react-datepicker/dist/react-datepicker.css';

const Map = ({sets, parms}) => {
  const mapChange = (e) => {
    sets.lat(+e.lat.toFixed(4));
    sets.lng(+e.lng.toFixed(4));
  } // mapChange

  const Marker = () => (
    <img alt="marker" className="marker" src="marker.png" style={{height: '40px'}} />
  )

  return (
    <>
      <GoogleMaps sets={sets} />
      {
        parms.lat && parms.lng &&
        <div style={{ height: '400px', width: '100%' }}>
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

const Location = ({ps, sets, parms, setScreen}) => (
  <div>
    <h1>Where is your field located?</h1>
    <p>
      Enter your address or zip code to determine your field's location.<br/>
      You can then zoom in and click to pinpoint it on the map.
    </p>
    
    <Map sets={sets} parms={parms} />
    
    <div>
      Latitude:&nbsp;
      <Input {...ps('lat')} />
      &nbsp;&nbsp;&nbsp;
      Longitude:&nbsp;
      <Input {...ps('lng')} />
    </div>
    <div className="bn">
      <button onClick={() => setScreen('Home')}>BACK</button>
      <button onClick={() => setScreen('Soil')}>NEXT</button>
    </div>
  </div>
) // Location

export default Location;