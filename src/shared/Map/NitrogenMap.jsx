/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import React, {
  useState, useEffect, useMemo, useRef, useImperativeHandle, forwardRef,
} from 'react';
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

/**
 * Fit a Mapbox map to `bounds` and resolve only once the camera animation
 * and the subsequent tile/render cycle are both complete.
 */
function fitAndWaitForIdle(mapInstance, bounds) {
  return new Promise((resolve) => {
    const waitForIdle = () => {
      mapInstance.once('idle', resolve);
      mapInstance.triggerRepaint();
    };
    if (!bounds) {
      waitForIdle();
      return;
    }
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      waitForIdle();
    };

    mapInstance.once('moveend', finish);

    mapInstance.fitBounds(
      [[bounds[0], bounds[1]], [bounds[2], bounds[3]]],
      { padding: 40, animate: false },
    );
    setTimeout(finish, 100);
  });
}

/**
 * Extract legend items from the DOM node that wraps the map.
 */
function extractLegend(containerEl) {
  const legendEl = containerEl?.querySelector('[class*="rasterlegend"]');
  const legendTitle = legendEl?.querySelector('span')?.textContent?.trim() ?? '';
  const legendItems = [];

  if (legendEl) {
    legendEl.querySelectorAll('[class*="rasterlegenditem"]').forEach((item) => {
      const color = item.querySelector('[class*="rasterlegendcolor"]')?.style?.backgroundColor;
      const label = item.querySelector('[class*="rasterlegendvalue"]')?.textContent?.trim();
      if (color && label) legendItems.push({ color, label });
    });
  }

  return { legendTitle, legendItems };
}

const NitrogenMapComp = forwardRef(({ layer = 'prescription', setLayer }, ref) => {
  const [address, setAddress] = useState({});
  const dispatch = useDispatch();
  const isPM3DMode = useSelector(get.biomassCalcMode) === 'pm3d';
  const isRCPPReportOnly = useSelector(get.isRCPPReportOnly);
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
    return 'category'; // treatment
  }, [layer]);

  const rasterColors = useMemo(() => {
    if (layer === 'biomass') return biomassRasterColors;
    if (layer === 'treatment') return null;
    return nitrogenRasterColors;
  }, [layer]);

  const unit = useMemo(() => {
    if (layer === 'biomass') return 'lb/ac';
    if (layer === 'prescription') return fertilizerType === 'liquid' ? 'lb of N/ac' : 'lb of N/ac';
    if (layer === 'credit') return 'lb of N/ac';
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
        material={layer}
        discreteLabels={discreteLabels}
        mapboxToken={mapboxToken}
      />
    </Paper>
  );
});

export default NitrogenMapComp;
