/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import React, { useState, useEffect, useMemo } from 'react';
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

  const valueKey = useMemo(() => {
    if (layer === 'biomass') return 'biomass_average';
    if (layer === 'prescription') return applyRCPP ? 'ReqN' : 'ReqNWithoutTreatment';
    if (layer === 'credit') return 'MinNfromFOM';
    return 'category'; // treatment
  }, [layer, applyRCPP]);

  const rasterColors = useMemo(() => {
    if (layer === 'biomass') return biomassRasterColors;
    if (layer === 'treatment') return null;
    return nitrogenRasterColors;
  }, [layer]);

  const unit = useMemo(() => {
    if (layer === 'biomass') return 'lb/ac';
    if (layer === 'prescription') return fertilizerType === 'liquid' ? 'gal/ac' : 'lb/ac';
    if (layer === 'credit') return 'lb/ac';
    return '';
  }, [layer, fertilizerType]);

  const discreteLabels = useMemo(() => {
    if (layer !== 'treatment') return null;
    return {
      1: 'Control',
      2: 'Full',
      3: 'Average',
      4: 'Cap',
      _colors: {
        1: '#ff5286', 2: '#fff83b', 3: '#50ff24', 4: '#3689ff',
      },
    };
  }, [layer]);

  const initRasterObject = useMemo(() => {
    if (layer === 'biomass') return biomassGeojson;
    return nitrogenTaskResults?.reqN;
  }, [layer, biomassGeojson, nitrogenTaskResults?.reqN]);

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
        initRasterObject={initRasterObject}
        valueKey={valueKey}
        rasterColors={rasterColors}
        color_steps={7}
        unit={unit}
        material={layer}
        discreteLabels={discreteLabels}
        mapboxToken={mapboxToken}
      />
    </Paper>
  );
};

export default NitrogenMapComp;
