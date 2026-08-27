/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useState, useEffect, useMemo, useRef, useImperativeHandle, forwardRef,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PSAReduxMap } from 'shared-react-components/src';
import { Paper } from '@mui/material';
import { bbox } from '@turf/turf';
import { get, set } from '../../store/Store';
import { mapboxToken } from '../../utils/keys';
import { fitAndWaitForIdle, extractLegend } from '../../utils/mapCaptureUtils';
import { geometryToFeatureCollection } from '../../utils/geojsonUtils';

const biomassRasterColors = ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#a6d96a', '#1a9850'];
const prescriptionRasterColors = ['#762a83', '#af8dc3', '#e7d4e8', '#d9f0d3', '#7fbf7b', '#1b7837'];
// const creditRasterColors = ['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8'];
// const sprayMapRasterColors = ['#8B4513', '#D2691E', '#F4A460', '#90EE90', '#228B22', '#006400'];

const NitrogenMapComp = forwardRef(({ layer = 'prescription', setLayer }, ref) => {
  const [address, setAddress] = useState({});
  const dispatch = useDispatch();
  const isPM3DMode = useSelector(get.biomassCalcMode) === 'pm3d';
  const isRCPPReportOnly = useSelector(get.isRCPPReportOnly);
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const biomassGeojson = useSelector(get.biomassGeojson);
  const nitrogenTaskResults = useSelector(get.nitrogenTaskResults);
  const nitrogenSprayMap = useSelector(get.nitrogenSprayMap);
  const mapAddress = useSelector(get.mapAddress);
  const mapZoom = useSelector(get.mapZoom);
  const mapPolygon = useSelector(get.mapPolygon);
  const inputMode = useSelector(get.inputMode);
  const fertilizerType = useSelector(get.fertilizerType);
  const nitrogenSprayMapProperty = useSelector(get.nitrogenSprayMapProperty);
  const hasFixedNRate = useSelector(get.hasFixedNRate);
  const multiplier = useSelector(get.multiplier);
  const targetN = useSelector(get.targetN);
  const selectedField = useSelector(get.selectedField);
  const [features, setFeatures] = useState(mapPolygon);
  const [zoom, setZoom] = useState(null);
  const [latLon, setLatLon] = useState([lat, lon]);
  const [bounds, setBounds] = useState(null);

  const mapInstanceRef = useRef(null);
  // const mapContainerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    /**
     * Iterates through all map layers, switches the rendered data for each andcaptures a screenshot
     */
    captureAllLayers: async () => {
      const mapInstance = mapInstanceRef.current;
      if (!mapInstance) return [];

      const layers = [
        ...(isPM3DMode && !isRCPPReportOnly ? [{ value: 'prescription', label: 'Prescription' }] : []),
        { value: 'credit', label: 'Nitrogen Credit' },
        { value: 'biomass', label: 'Biomass' },
        ...(isPM3DMode && !isRCPPReportOnly ? [{ value: 'treatment', label: 'Treatment' }] : []),
        ...(isPM3DMode && !isRCPPReportOnly ? [{ value: 'spray', label: 'Target Rate' }] : []),
      ];

      return layers.reduce(async (prevPromise, { value, label }) => {
        const mapCaptures = await prevPromise;

        setLayer(value);
        await new Promise((resolve) => { setTimeout(resolve, 200); });
        mapInstance.triggerRepaint();
        await fitAndWaitForIdle(mapInstance, bounds);

        const mapImage = mapInstance.getCanvas().toDataURL('image/png');
        // RasterLegend component is rendered outside the map div, hence `parentElement` to access it
        const { legendTitle, legendItems } = extractLegend(mapInstanceRef.current.getContainer().parentElement);

        return [...mapCaptures, {
          label, mapImage, legendItems, legendTitle,
        }];
      }, Promise.resolve([]));
    },
  }));

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
    if (layer === 'prescription') return 'ReqN';
    if (layer === 'credit') return 'MinNfromFOM';
    if (layer === 'spray') return hasFixedNRate === 'fixed' ? 'targetN' : nitrogenSprayMapProperty;
    return 'category'; // treatment
  }, [layer, hasFixedNRate, nitrogenSprayMapProperty]);

  const rasterColors = useMemo(() => {
    if (layer === 'prescription') return prescriptionRasterColors;
    if (layer === 'treatment') return null;
    return biomassRasterColors;
  }, [layer]);

  const unit = useMemo(() => {
    if (layer === 'biomass') return 'lb/ac';
    if (layer === 'prescription') return fertilizerType === 'liquid' ? 'lb of N/ac' : 'lb of N/ac';
    if (layer === 'credit') return 'lb of N/ac';
    if (layer === 'spray') return inputMode === 'nitrogen' ? 'lb of N/ac' : fertilizerType === 'liquid' ? 'gal of product/ac' : 'lb of product/ac';
    return '';
  }, [layer, fertilizerType, inputMode]);

  const secondaryUnit = useMemo(() => {
    if (layer === 'prescription' || layer === 'credit') {
      return fertilizerType === 'liquid' ? 'gal of product/ac' : 'lb of product/ac';
    }
    if (layer === 'spray') return inputMode === 'nitrogen' ? fertilizerType === 'liquid' ? 'gal of product/ac' : 'lb of product/ac' : 'lb of N/ac';
    return '';
  }, [layer, fertilizerType, inputMode]);

  const secondaryUnitMultiplier = useMemo(() => {
    if (layer === 'prescription' || layer === 'credit') return 1 / multiplier;
    if (layer === 'spray') return inputMode === 'nitrogen' ? 1 / multiplier : multiplier;
    return '';
  }, [layer, fertilizerType, inputMode]);

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
    if (layer === 'spray') {
      // Build a map for fixed rate from the field geometry with a constant target rate.
      if (hasFixedNRate === 'fixed') {
        return geometryToFeatureCollection(selectedField?.geometry, { targetN: Number(targetN) });
      }
      return nitrogenSprayMap;
    }
    return nitrogenTaskResults?.reqN;
  }, [layer, hasFixedNRate, selectedField, targetN, biomassGeojson, nitrogenTaskResults?.reqN, nitrogenSprayMap]);

  return (
    <Paper>
      <PSAReduxMap
        setMap={(mapInstance) => { mapInstanceRef.current = mapInstance; }}
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
        material={layer.charAt(0).toUpperCase() + layer.slice(1)}
        discreteLabels={discreteLabels}
        secondaryUnit={secondaryUnit}
        secondaryUnitMultiplier={secondaryUnitMultiplier}
        mapboxToken={mapboxToken}
      />
    </Paper>
  );
});

export default NitrogenMapComp;
