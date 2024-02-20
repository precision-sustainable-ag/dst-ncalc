/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
// import mapboxgl from 'mapbox-gl';
import { useSelector, useDispatch } from 'react-redux';
import { NcalcMap } from '@psa/dst.ui.ncalc-map';
import { Paper } from '@mui/material';
// import { NcalcMap } from './mock/ncalc-map';
import { get, set } from '../../store/Store';

// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
// mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;
// import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker';

let removedShapes = new Set();

const MapComp = ({ variant }) => {
  const [address, setAddress] = useState({});
  const [zoom, setZoom] = useState(null);
  const dispatch = useDispatch();
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const biomassTaskResults = useSelector(get.biomassTaskResults);
  const nitrogenTaskResults = useSelector(get.nitrogenTaskResults);
  const mapAddress = useSelector(get.mapAddress);
  const mapZoom = useSelector(get.mapZoom);
  const mapPolygon = useSelector(get.mapPolygon);
  const [features, setFeatures] = useState(mapPolygon);
  const [drawEvent, setDrawEvent] = useState({});

  // mapAddress
  useEffect(() => {
    if (drawEvent.mode === 'delete') {
      removedShapes = removedShapes.add(drawEvent.e.features[0].id);
    }
    const ids = new Set(mapPolygon.map((d) => d.id));
    const merged = [
      ...mapPolygon.filter((d) => !removedShapes.has(d.id)),
      ...features.filter((d) => !ids.has(d.id) && !removedShapes.has(d.id)),
    ];
    dispatch(set.mapPolygon(merged));
  }, [drawEvent]);

  useEffect(() => {
    dispatch(set.mapType('satellite'));
    if (address.latitude && address.latitude !== lat) {
      dispatch(set.lat(address.latitude));
      dispatch(set.updateSSURGO(true));
    }
    if (address.longitude && address.longitude !== lon) {
      dispatch(set.lon(address.longitude));
      dispatch(set.updateSSURGO(true));
    }
    if (address.address) {
      dispatch(set.mapAddress(address.address));
      // dispatch(set.updateSSURGO(true));
    }
  }, [address.latitude, address.longitude, address.address]);

  useEffect(() => {
    if (zoom) dispatch(set.mapZoom(zoom));
  }, [zoom]);

  return (
    <Paper>
      <NcalcMap
        setAddress={setAddress}
        setFeatures={setFeatures}
        setZoom={setZoom}
        setMap={() => { }}
        onDraw={setDrawEvent}
        initRasterObject={variant === 'biomass' ? biomassTaskResults : nitrogenTaskResults}
        initFeatures={mapPolygon}
        initWidth="100%"
        initHeight="380px"
        initAddress={mapAddress}
        initLon={lon}
        initLat={lat}
        initStartZoom={mapZoom}
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
      />
    </Paper>
  );
};

export default MapComp;
