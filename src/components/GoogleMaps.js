import React from 'react';
import {TextField, Autocomplete, OutlinedInput, Icon} from '@mui/material';
import {Input} from './Inputs';
import throttle from 'lodash/throttle';
import GoogleMapReact from 'google-map-react';

const autocompleteService = { current: null };

const GoogleMaps = ({props, parms, set, autoFocus=false, field=false}) => {
  const [location, setValue] = React.useState(parms.location, null);
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState([]);

  const fetch = React.useMemo(
    () =>
      throttle((request, callback) => {
        autocompleteService.current.getPlacePredictions(request, callback);
      }, 200),
    [],
  );

  React.useEffect(() => {
    let active = true;

    if (!autocompleteService.current && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }

    if (!autocompleteService.current) {
      return undefined;
    }

    if (inputValue === '') {
      setOptions(location ? [location] : []);
      return undefined;
    }

    fetch({ input: inputValue }, (results) => {
      if (active) {
        let newOptions = [];

        if (location) {
          newOptions = [location];
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [location, inputValue, fetch]);

  return (
    <>
      <Autocomplete
        {...props('location')}
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.description)}
        options={options}
        autoComplete
        includeInputInList
        filterSelectedOptions
        autoFocus={autoFocus}  // not working

        // getOptionSelected={(option, value) => option.id === value.id}  // avoids warning, per https://stackoverflow.com/a/65347275/3903374, but prevents re-entry of data
        
        onChange={(_, newValue) => {
          setOptions(newValue ? [newValue, ...options] : options);
          if (newValue) {
            set.location(newValue.description);
            setValue(newValue.description);
            const geocoder = new window.google.maps.Geocoder();

            geocoder.geocode({
              address: newValue.description,
              region: 'en-US',
            }, (results, status) => {
              let state = results ? results[0].address_components.filter(obj => obj.types[0] === 'administrative_area_level_1') : '';
              if (state) {
                state = state[0].long_name;
                set.state(state);
              } else {
                set.state('');
              }
              
              if (results && results[0]) {
                set.lat(results[0].geometry.location.lat().toFixed(4));
                set.lon(results[0].geometry.location.lng().toFixed(4));
              }
            });
          }
        }}

        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}

        renderInput={(params) => (
          <>
            <TextField
              {...params}
              label="Find your Location"
              variant="outlined" 
              style={{width: field ? '50%' : '100%', float: field ? 'left' : ''}}
            />
          </>
        )}
      />
      
      {
        field &&
        <>
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
        </>
      }

      <div>
        <small>
          If you know your exact coordinates, you can enter them here:
          &nbsp;
          Latitude:&nbsp;
          <Input {...props('lat')} inputProps={{ tabIndex: -1 }} style={{width: '6em', fontSize: 14}} />
          &nbsp;&nbsp;&nbsp;
          Longitude:&nbsp;
          <Input {...props('lon')} inputProps={{ tabIndex: -1 }} style={{width: '6em', fontSize: 14}}/>
        </small>
      </div>
    </>
  );
}

const Map = ({set, parms, props, field=false}) => {
  const mapChange = (e) => {
    set.lat(+e.lat.toFixed(4));
    set.lon(+e.lng.toFixed(4));

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
      <GoogleMaps set={set} props={props} parms={parms} field={field} />

      {
        parms.lat && parms.lon &&
        <div style={{ height: '400px', width: '100%' }} id="GoogleMap">
          <GoogleMapReact
            bootstrapURLKeys={{ key: 'AIzaSyD8U1uYvUozOeQI0LCEB_emU9Fo3wsAylg' }}
            center={{lat: +parms.lat, lng: +parms.lon}}
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
            <Marker lat={+parms.lat} lng={+parms.lon} />
          </GoogleMapReact>
        </div>
      }
    </>
  );
} // Map

let Geocoder;

export default Map;