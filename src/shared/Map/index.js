import React, { useState, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
// import { NcalcMap } from '@psa/dst.ui.ncalc-map';
import { useSelector, useDispatch } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import { get, set } from '../../store/Store';
import './styles.scss';
import { NcalcMap } from './mock/ncalc-map';
// import sampleBiomassData from './mock/response_2.json';
// import sampleBiomassData from './mock/response_1682931266838.json';
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

// console.log('sampleBiomassData', sampleBiomassData);

// const val = JSON.parse(sampleBiomassData.task_result.replace(/\bNaN\b/g, 'null'));
// // console.log('sampleBiomassData.task_result', sampleBiomassData);
// console.log('val', val);
// const initRaster = { data_array: val.data_array, bbox: val.bbox };
// console.log('initRaster', initRaster);

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

  // console.log('sampleBiomassData', sampleBiomassData);
  // console.log('data_array', sampleBiomassData.data_array[0].length);

  return (
    <div className="map">
      <NcalcMap
        setAddress={setAddress}
        setFeatures={setFeatures}
        setZoom={setZoom}
        setMap={() => { }}
        onDraw={setDrawEvent}
        initRasterObject={biomassTaskResults}
        // initRasterObject={sampleBiomassData}
        initFeatures={mapPolygon}
        initWidth="100%"
        initHeight="450px"
        initAddress={mapAddress}
        initLon={-76.9144}
        initLat={39.0208}
        // initLon={-101.6504}
        // initLat={41.05208}
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
    </div>
  );
};

export default MapComp;
