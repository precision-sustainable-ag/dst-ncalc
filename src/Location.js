import GoogleMaps from './GoogleMaps';

import GoogleMapReact from 'google-map-react';

import {
  Input,
  Icon,
} from '@material-ui/core';

const Map = ({sets, parms, ps}) => {
  const mapChange = (e) => {
    sets.lat(+e.lat.toFixed(4));
    sets.lng(+e.lng.toFixed(4));
  } // mapChange

  const Marker = () => (
    <img alt="marker" className="marker" src="marker.png" style={{height: '40px'}} />
  )

  return (
    <>
      <table className="noborder">
        <tbody>
          <tr>
            <td className="noborder" style={{width: '50%'}}>
              <GoogleMaps sets={sets} ps={ps} parms={parms} />
            </td>
            <td className="noborder">
              <div className="MuiFormControl-root MuiTextField-root MuiFormControl-fullWidth">
                <label className="MuiFormLabel-root MuiInputLabel-root MuiInputLabel-formControl MuiInputLabel-animated MuiInputLabel-shrink MuiInputLabel-outlined MuiFormLabel-filled" data-shrink="true" htmlFor="googlemap" id="googlemap-label">
                  Name your Field
                </label>
                <div 
                  style={{height: '3.5em'}}
                  className="MuiInputBase-root MuiOutlinedInput-root MuiAutocomplete-inputRoot MuiInputBase-fullWidth MuiInputBase-formControl MuiInputBase-adornedEnd MuiOutlinedInput-adornedEnd"
                >
                  <Input
                    {...ps('field')}
                    autoComplete="off"
                    disableUnderline={true}
                    style={{width: 'calc(100% - 3em)', height: '100%'}}
                  />
                  <Icon>
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
                  <fieldset aria-hidden="true" className="PrivateNotchedOutline-root-2 MuiOutlinedInput-notchedOutline">
                    <legend className="PrivateNotchedOutline-legendLabelled-4 PrivateNotchedOutline-legendNotched-5">
                      <span>Name your Field</span>
                    </legend>
                  </fieldset>
                </div>
              </div>              
            </td>
          </tr>
        </tbody>
      </table>
      
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
    
    <Map sets={sets} parms={parms} ps={ps} />
    
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