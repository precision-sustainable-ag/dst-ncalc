/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useSelector, useDispatch } from 'react-redux';
import { NcalcMap } from '@psa/dst.ui.ncalc-map';
import { Paper } from '@mui/material';
// import { NcalcMap } from './mock/ncalc-map';
import { get, set } from '../../store/Store';

import './styles.scss';
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

let removedShapes = new Set();

const MapComp = () => {
  const [address, setAddress] = useState({});
  const [zoom, setZoom] = useState(null);
  const dispatch = useDispatch();
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const biomassTaskResults = useSelector(get.biomassTaskResults);
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
    }
    if (address.longitude && address.longitude !== lon) {
      dispatch(set.lon(address.longitude));
    }
    if (address.address) dispatch(set.mapAddress(address.address));
  }, [address.latitude, address.longitude, address.address]);

  useEffect(() => {
    if (zoom) dispatch(set.mapZoom(zoom));
  }, [zoom]);

  console.log('biomassTaskResults', biomassTaskResults);
  console.log('mapPolygon', mapPolygon);

  return (
    <Paper>
      <NcalcMap
        setAddress={setAddress}
        setFeatures={setFeatures}
        setZoom={setZoom}
        setMap={() => { }}
        onDraw={setDrawEvent}
        initRasterObject={biomassTaskResults}
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
