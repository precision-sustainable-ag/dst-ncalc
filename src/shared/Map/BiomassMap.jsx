/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
// import mapboxgl from 'mapbox-gl';
import { useSelector, useDispatch } from 'react-redux';
import { NcalcMap } from 'shared-react-components/src';
import { Paper } from '@mui/material';
// import { NcalcMap } from './mock/ncalc-map';
import { get, set } from '../../store/Store';
import { mapboxToken } from '../../utils/keys';

// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
// mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;
// import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker';

let removedShapes = new Set();
const biomassRasterColors = ['red', 'orange', 'lime', 'green', 'white'];
// const nitrogenRasterColors = ['red', 'orange', 'magenta', 'lime', 'green', 'white'];
// const nitrogenRasterColors = ['cyan', 'brown', 'white'];

const BiomassMapComp = ({ variant }) => {
  const [address, setAddress] = useState({});
  const [zoom, setZoom] = useState(13);
  const dispatch = useDispatch();
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const biomassTaskResults = useSelector(get.biomassTaskResults);
  const mapAddress = useSelector(get.mapAddress);
  const mapPolygon = useSelector(get.mapPolygon);
  const unit = useSelector(get.unit);
  const [features, setFeatures] = useState(mapPolygon);
  const [drawEvent, setDrawEvent] = useState({});

  // mapAddress
  useEffect(() => {
    if (drawEvent.mode === 'delete') {
      removedShapes = removedShapes.add(drawEvent.e.features[0].id);
    }
    const ids = new Set(mapPolygon.map((d) => d.id));
    const merged = [...mapPolygon.filter((d) => !removedShapes.has(d.id)), ...features.filter((d) => !ids.has(d.id) && !removedShapes.has(d.id))];
    dispatch(set.mapPolygon(merged));
  }, [drawEvent]);

  useEffect(() => {
    // FIXME: the mapType seems not being used except for the map itself
    // dispatch(set.mapType('satellite'));
    if (address.latitude && address.longitude && (address.latitude !== lat || address.longitude !== lon)) {
      dispatch(set.lat(address.latitude));
      dispatch(set.lon(address.longitude));
      if (address.address) {
        dispatch(set.mapAddress(address.address));
      }
      dispatch(set.updateSSURGO(true));
      dispatch(set.mapZoom(zoom));
    }
  }, [address]);

  return (
    <Paper>
      <NcalcMap
        setAddress={setAddress}
        setFeatures={setFeatures}
        setZoom={setZoom}
        setMap={() => {}}
        onDraw={setDrawEvent}
        initRasterObject={biomassTaskResults}
        initFeatures={mapPolygon}
        unit={unit}
        material={variant}
        rasterColors={biomassRasterColors}
        initWidth="100%"
        initHeight="380px"
        initAddress={mapAddress}
        initLon={lon}
        initLat={lat}
        initStartZoom={zoom}
        initMinZoom={5}
        initMaxZoom={16}
        hasSearchBar
        hasMarker
        hasNavigation
        hasCoordBar
        hasDrawing
        hasGeolocate
        hasFullScreen
        hasMarkerPopup
        hasMarkerMovable
        scrollZoom
        dragRotate
        dragPan
        keyboard
        doubleClickZoom={false}
        touchZoomRotate
        mapboxToken={mapboxToken}
      />
    </Paper>
  );
};

export default BiomassMapComp;
