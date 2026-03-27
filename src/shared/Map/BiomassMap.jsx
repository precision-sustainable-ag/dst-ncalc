/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
// import mapboxgl from 'mapbox-gl';
import { useSelector, useDispatch } from 'react-redux';
import { PSAReduxMap } from 'shared-react-components/src';
import { Paper } from '@mui/material';
// import { NcalcMap } from './mock/ncalc-map';
import { get, set } from '../../store/Store';
import { mapboxToken } from '../../utils/keys';

// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
// mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;
// import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker';

// const biomassRasterColors = ['red', 'orange', 'lime', 'green', 'white'];
// const nitrogenRasterColors = ['red', 'orange', 'magenta', 'lime', 'green', 'white'];
// const nitrogenRasterColors = ['cyan', 'brown', 'white'];

const BiomassMapComp = ({ variant }) => {
  const [address, setAddress] = useState({});
  const [zoom, setZoom] = useState(13);
  const dispatch = useDispatch();
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  // const biomassGeojson = useSelector(get.biomassGeojson);
  const mapAddress = useSelector(get.mapAddress);
  const mapPolygon = useSelector(get.mapPolygon);
  // const unit = useSelector(get.unit);
  const [features, setFeatures] = useState(mapPolygon);
  const [latLon, setLatLon] = useState([lat, lon]);

  const updateProperties = (properties) => {
    setAddress(properties?.address);
    setZoom(properties?.zoom);
    setFeatures(properties?.features);
    setLatLon([properties?.lat, properties?.lon]);
  };

  useEffect(() => {
    if (!features?.[0]?.geometry?.coordinates) return;

    let coords = features[0].geometry.coordinates[0];

    const ringArea = (ring) => {
      let area = 0;
      for (let i = 0, len = ring.length - 1; i < len; i++) {
        const [x1, y1] = ring[i];
        const [x2, y2] = ring[i + 1];
        area += (x2 - x1) * (y2 + y1);
      }
      return area;
    };

    if (ringArea(coords) > 0) {
      coords = [...coords].reverse();
    }

    const newFeatures = [{
      ...features[0],
      geometry: {
        ...features[0].geometry,
        coordinates: [coords],
      },
    }];
    dispatch(set.mapPolygon(newFeatures));
  }, [features]);

  useEffect(() => {
    if (address.address) {
      dispatch(set.mapAddress(address.address));
    }
  }, [address]);

  useEffect(() => {
    dispatch(set.lat(latLon[0]));
    dispatch(set.lon(latLon[1]));
    dispatch(set.updateSSURGO(true));
  }, [latLon[0], latLon[1]]);

  useEffect(() => {
    if (zoom) dispatch(set.mapZoom(zoom));
  }, [zoom]);

  return (
    <Paper>
      <PSAReduxMap
        setProperties={updateProperties}
        initWidth="100%"
        initHeight="380px"
        initLat={lat}
        initLon={lon}
        initStartZoom={zoom}
        initFeatures={mapPolygon}
        initAddress={mapAddress}
        hasSearchBar
        hasClear
        hasMarker
        hasMarkerPopup
        hasMarkerMovable
        hasNavigation
        hasFullScreen
        hasGeolocate
        hasDrawing
        // hasFindField
        scrollZoom
        dragRotate
        dragPan
        keyboard
        doubleClickZoom={false}
        touchZoomRotate
        // initRasterObject={biomassGeojson}
        // rasterColors={biomassRasterColors}
        // unit={unit}
        // material={variant}
        mapboxToken={mapboxToken}
      />
    </Paper>
  );
};

export default BiomassMapComp;
