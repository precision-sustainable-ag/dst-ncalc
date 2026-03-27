/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
// import mapboxgl from 'mapbox-gl';
import { useSelector, useDispatch } from 'react-redux';
import { PSAReduxMap } from 'shared-react-components/src';
import { Paper } from '@mui/material';
import { bbox } from '@turf/turf';
import { get, set } from '../../store/Store';
import { mapboxToken } from '../../utils/keys';

// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
// mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;
// import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker';

const biomassRasterColors = ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#a6d96a', '#1a9850'];
const nitrogenRasterColors = ['#762a83', '#af8dc3', '#e7d4e8', '#d9f0d3', '#7fbf7b', '#1b7837'];

const NitrogenMapComp = ({ layer = 'prescription', applyRCPP = true }) => {
  const [address, setAddress] = useState({});
  const dispatch = useDispatch();
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const biomassGeojson = useSelector(get.biomassGeojson);
  const nitrogenTaskResults = useSelector(get.nitrogenTaskResults);
  const mapAddress = useSelector(get.mapAddress);
  const mapZoom = useSelector(get.mapZoom);
  const mapPolygon = useSelector(get.mapPolygon);
  // const unit = useSelector(get.unit);
  const fertilizerType = useSelector(get.fertilizerType);
  const [features, setFeatures] = useState(mapPolygon);
  const [zoom, setZoom] = useState(null);
  const [latLon, setLatLon] = useState([lat, lon]);
  const [bounds, setBounds] = useState(null);

  const updateProperties = (properties) => {
    setAddress(properties?.address);
    setZoom(properties?.zoom);
    setFeatures(properties?.features);
    setLatLon([properties?.lat, properties?.lon]);
  };

  useEffect(() => {
    dispatch(set.mapPolygon(features));
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

  useEffect(() => {
    if (!biomassGeojson) return;
    const newBounds = bbox(biomassGeojson);
    setBounds(newBounds);
  }, [biomassGeojson]);

  return (
    <Paper>
      <PSAReduxMap
        setProperties={updateProperties}
        initWidth="100%"
        initHeight="380px"
        initLat={lat}
        initLon={lon}
        initStartZoom={mapZoom}
        initFeatures={mapPolygon}
        initAddress={mapAddress}
        initBounds={bounds}
        hasSearchBar
        // hasMarker
        // hasMarkerPopup
        hasMarkerMovable
        hasNavigation
        hasFullScreen
        hasGeolocate
        hasDrawing
        scrollZoom
        dragRotate
        dragPan
        keyboard
        doubleClickZoom={false}
        touchZoomRotate
        initRasterObject={
          (layer === 'biomass'
            ? biomassGeojson
            : layer === 'prescription'
              ? applyRCPP
                ? nitrogenTaskResults?.reqN
                : nitrogenTaskResults?.reqNWithoutTreatment
              : nitrogenTaskResults?.minN) || {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: { value: 0 },
              },
            ],
          }
        }
        rasterColors={layer === 'biomass' ? biomassRasterColors : nitrogenRasterColors}
        color_steps={7}
        unit={layer === 'biomass' ? 'lb/ac' : layer === 'prescription' ? (fertilizerType === 'liquid' ? 'gal/ac' : 'lb/ac') : 'lb/ac'}
        material=""
        mapboxToken={mapboxToken}
      />
    </Paper>
  );
};

export default NitrogenMapComp;
