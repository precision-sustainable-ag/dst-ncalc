import React, {useCallback, useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {TextField, Icon, Grid, Typography} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import throttle from 'lodash/throttle';
import parse from 'autosuggest-highlight/parse';
import GoogleMapReact from 'google-map-react';
import {Fullscreen, FullscreenExit} from '@mui/icons-material';

import {Input} from '../Inputs';
import {get, set} from '../../store/Store';

import './styles.scss';

const autocompleteService = {current: null};

const GoogleMaps = ({autoFocus=false, field=false, inputs=true}) => {
  const dispatch = useDispatch();

  const lat = +useSelector(get.lat);
  const lon = +useSelector(get.lon);
  const location = useSelector(get.location);

  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState([]);

  const fetch = React.useMemo(
    () =>
      throttle((request, callback) => {
        autocompleteService.current.getPlacePredictions(request, callback);
      }, 200),
    [],
  );

  const geocode = useCallback((newValue) => {
    setOptions(newValue ? [newValue, ...options] : options);
    if (newValue) {
      dispatch(set.location(newValue.description));
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({
        address: newValue.description,
        region: 'en-US',
      }, (results) => {
        let state = results ? results[0].address_components.filter(obj => obj.types[0] === 'administrative_area_level_1') : '';
        if (state) {
          dispatch(set.state(state[0].long_name));
          dispatch(set.stateAbbreviation(state[0].short_name))
        } else {
          dispatch(set.state(''));
        }
        
        if (results && results[0]) {
          dispatch(set.lat(results[0].geometry.location.lat().toFixed(4)));
          dispatch(set.lon(results[0].geometry.location.lng().toFixed(4)));
        }
      });
    }
  }, [dispatch, options]); // geocode

  React.useEffect(() => {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const selected = document.querySelector('li.Mui-focused');
        if (selected) {
          dispatch(set.location(selected.textContent));
          geocode({description: selected.textContent});
        }
      }
    });
  }, [dispatch, geocode]);

  React.useEffect(() => {
    let active = true;
    if (!autocompleteService.current && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }

    if (!autocompleteService.current) {
      return undefined;
    }

    if (inputValue === '') {
      setOptions([]);
      return;
    } else {
      fetch({input: inputValue}, (results) => {
        if (active) {
          setOptions(results || []);
        }
      });
    }

    return () => {
      active = false;
    };
  }, [location, inputValue, fetch]);

  return (
    <>
      {
        inputs && (
          <Input
            id="location"
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.description)}
            options={options}
            autoComplete
            includeInputInList
            filterSelectedOptions
    
            onChange={(_, newValue) => {geocode(newValue);}}
    
            onInputChange={(_, newInputValue) => {
              setInputValue(newInputValue);
            }}
    
            renderInput={(params) => {
              return (
                <>
                  <TextField
                    {...params}
                    autoFocus={autoFocus}
                    label="Find your Location"
                    style={{width: field ? '50%' : '100%', float: field ? 'left' : ''}}
                  />
                </>
              )
            }}

            renderOption={(props, option) => {
              let matches = [];
              let parts = [];
              if (option.structured_formatting) {
                matches = option.structured_formatting.main_text_matched_substrings;
      
                parts = parse(
                  option.structured_formatting.main_text,
                  matches.map((match) => [match.offset, match.offset + match.length]),
                );
              }
      
              return (
                <Grid container spacing={1} alignItems="center" {...props}>
                  <Grid item>
                    <LocationOnIcon />
                  </Grid>
                  <Grid item xs>
                    {parts.map((part, index) => (
                      <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                        {part.text}
                      </span>
                    ))}
      
                    <Typography variant="body2" color="textSecondary">
                      {option.structured_formatting ? option.structured_formatting.secondary_text : ''}
                    </Typography>
                  </Grid>
                </Grid>
              );
            }}
          />
        )
      }
      
      {
        field &&
        <>
          <Input
            label="Name your Field"
            id="field"
            autoComplete="off"
            style={{width: 'calc(50% - 2em)', height: '3rem'}}
            
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

      {
        inputs && (
          <div style={{margin: '2rem 0 1rem 0'}}>
            If you know your exact coordinates, you can enter them here:
            &nbsp;
            <Input
              id="lat"
              value={lat}
              label="Latitude"
              type="number"
              sx={{margin: 1}}
            />
            <Input
              id="lon"
              value={lon}
              label="Longitude"
              type="number"
              sx={{margin: 1}}
            />
          </div>
        )
      }
    </>
  );
} // GoogleMaps

const Map = ({field=false, autoFocus, inputs=true, id='GoogleMap', mapOptions={}}) => {
  const dispatch = useDispatch();
  const lat = +useSelector(get.lat);
  const lon = +useSelector(get.lon);
  const mapPolygon = useSelector(get.mapPolygon);

  // const [mapType, setMapType] = useState('hybrid');
  const mapType = useSelector(get.mapType);
  const mapZoom = useSelector(get.mapZoom);

  const [, setLoaded] = React.useState(false);

  const mapChange = (e) => {
    dispatch(set.lat(e.lat.toFixed(4)));
    dispatch(set.lon(e.lng.toFixed(4)));

    if (polygon) {
      polygon.setMap(null);
    }

    const latlng = {
      lat: e.lat,
      lng: e.lng,
    };

    Geocoder
      .geocode({location: latlng})
      .then(response => {
        const results = response.results;
        const location = results[0].formatted_address;
        dispatch(set.location(location));

        let state = results ? results[0].address_components.filter(obj => obj.types[0] === 'administrative_area_level_1') : '';
        if (state) {
          state = state[0].long_name;
          dispatch(set.state(state));
        } else {
          dispatch(set.state(''));
        }
      })
      .catch((e) => window.alert('Geocoder failed due to: ' + e));
  } // mapChange

  const initGeocoder = ({map, maps}) => {
    let drawing = false;

    Geocoder = new maps.Geocoder();

    marker = new maps.Marker({
      map,
      icon: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
      draggable: true,
      title: 'Click and hold to drag',
    });

    polygon = new maps.Polygon({
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1,
      strokeWeight: 2,      
    });
    polygon.setMap(map);

    mapPolygon.forEach(point => {
      polygon.getPath().insertAt(0, point)
    });

    document.querySelector('.gm-style')?.addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        if (polygon) {
          polygon.setMap(null);
        }

        if (polyLine) {
          polyLine.setMap(null);
          points = [];
        }

        polyLine = new maps.Polyline({
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1,
          strokeWeight: 2,      
        });
        polyLine.setMap(map);

        map.setOptions({
          draggable: false,
        });
        
        drawing = true;
      }
    });

    const finished = () => {
      if (drawing) {
        drawing = false;

        if (polygon) {
          polygon.setMap(null);
        }

        polygon = new maps.Polygon({
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1,
          strokeWeight: 2,      
        });
        polygon.setMap(map);

        const bounds = new maps.LatLngBounds();

        points.forEach(point => {
          polygon.getPath().insertAt(0, point)
          bounds.extend(point);
        });

        if (points.length) {
          dispatch(set.lat(bounds.getCenter().lat()));
          dispatch(set.lon(bounds.getCenter().lng()));
          dispatch(set.mapPolygon(points));
        }

        polyLine.setMap(null);
        map.setOptions({
          draggable: true,
        });
      }
    }

    document.addEventListener('mouseup', finished);

    maps.event.addListener(map, 'mousemove', (e) => {
      if (drawing) {
        points.push(e.latLng);
        polyLine.getPath().insertAt(0, e.latLng);
      }
    });      
    
    setLoaded(true);
  };

  if (marker) {
    marker.setPosition({lat, lng: lon});
  }
  
  const [fullsize, setFullsize] = useState(false);

  useEffect(() => {
    const kd = ({key}) => {
      if (key === 'Escape') {
        setFullsize(false);
      }
    };

    document.addEventListener('keydown', kd);
    
    return () => {
      document.removeEventListener('keydown', kd);  
    }
  }, []);

  const mapStyle = fullsize 
    ? {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 10000,
    }
    : {
      position: 'relative',
      height: '100%',
    }

  return (
    <div className="Map" id={id}>
      {
        inputs && (
          <>
            <h1>Where is your Field located?</h1>
            <p>
              Enter your address or zip code to determine your field's location.
              You can then zoom in and click to pinpoint it on the map.
            </p>
          </>
        )
      }

      <GoogleMaps field={field} autoFocus={autoFocus} inputs={inputs} />
      {
        lat && lon ? (
          <div style={mapStyle}>
            <span
              className="fullsize"

              onClick={() => {
                setFullsize(!fullsize);
              }}

              title="Toggle fullscreen view"
            >
              {
                fullsize ? <FullscreenExit /> : <Fullscreen />
              }
            </span>

            <GoogleMapReact
              bootstrapURLKeys={{key: 'AIzaSyD8U1uYvUozOeQI0LCEB_emU9Fo3wsAylg', libraries: ['places']}}
              center={{lat: +lat, lng: +lon}}
              zoom={mapOptions.zoom || mapZoom}

              onGoogleApiLoaded={initGeocoder}
              
              yesIWantToUseGoogleMapApiInternals
              onClick={mapChange}
              onZoomAnimationEnd={(zoom) => dispatch(set.mapZoom(zoom))}
              // onMapTypeIdChange={(type)  => setMapType(type)}
              onMapTypeIdChange={(type) => dispatch(set.mapType(type))}

              onLoad={
                // prevent tabbing through map
                // got to be a better way than setting a timeout
                setTimeout(() => {
                  document
                    .querySelectorAll('#GoogleMap *')
                    .forEach(item => {
                      if (item.tagName !== 'INPUT') {
                        item.setAttribute('tabIndex', -1);
                      }
                    });
                }, 1000)
              }

              options={(map) => ({
                mapTypeId: mapType,
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
                ...mapOptions
              })}
            />
          </div>
        )
        : null
      }
    </div>
  );
} // Map

let Geocoder;
let marker;
let polyLine;
let polygon;
let points = [];

export default Map;