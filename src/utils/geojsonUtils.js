/* eslint-disable no-console */
/* eslint-disable no-alert */
import centroid from '@turf/centroid';
import { bbox } from '@turf/turf';

/**
 * Recursively removes altitude/Z-coordinates from GeoJSON coordinate arrays
 * @param {Array} coords - Coordinates array (Point, Line, or Polygon depth)
 * @returns {Array} - Cleaned 2D coordinates [lon, lat]
 */
const cleanTo2D = (coords) => {
  if (!Array.isArray(coords)) return coords;

  // If the first element is not an array, we are at the coordinate pair level [x, y, z]
  if (!Array.isArray(coords[0])) {
    return coords.slice(0, 2);
  }

  // Else, go deeper into the array
  return coords.map((element) => cleanTo2D(element));
};

/**
 * Validates if the provided data is valid GeoJSON
 * @param {object} data - Data to validate
 * @returns {boolean} - True if valid GeoJSON, false otherwise
 */
export const isValidGeoJSON = (data) => {
  if (!data || typeof data !== 'object') return false;

  // Edge case for when shpjs returns an array of FeatureCollections
  if (Array.isArray(data)) {
    return data.every((feature) => isValidGeoJSON(feature));
  }

  const validTypes = [
    'Feature',
    'FeatureCollection',
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon',
    'GeometryCollection',
  ];

  if (!data.type || !validTypes.includes(data.type)) return false;

  // FeatureCollection must have features array
  if (data.type === 'FeatureCollection') {
    return Array.isArray(data.features);
  }

  // Feature must have geometry and properties
  if (data.type === 'Feature') {
    if (!data.geometry || typeof data.properties !== 'object') return false;
    return validTypes.includes(data.geometry.type);
  }

  // Geometry must have coordinates
  if ('coordinates' in data) {
    return Array.isArray(data.coordinates);
  }

  return true;
};

/**
 * Validates and processes GeoJSON data into features array.
 * Computes and sets centroid and bounding box of the provided geojson.
 * @param {Object|Array} geojson - GeoJSON data to process
 * @param {Function} setFeatures - React state setter used to store the extracted array of GeoJSON features.
 * @param {Function} setLatLon - React state setter that sets [lat, lon] based on the centroid
 * @param {Function} setBounds - React state setter that sets the bounding box array [minX, minY, maxX, maxY] based on the features.
 * @returns {void}
 */
export const validateAndProcessGeoJSON = (geojson, setFeatures, setLatLon, setBounds) => {
  if (!isValidGeoJSON(geojson)) {
    alert('Invalid GeoJSON structure');
    return;
  }

  let featuresToSet = [];

  if (Array.isArray(geojson)) {
    featuresToSet = geojson.flatMap((g) => g.features);
  } else if (geojson.type === 'FeatureCollection') {
    featuresToSet = geojson.features;
  } else if (geojson.type === 'Feature') {
    featuresToSet = [geojson];
  } else {
    console.warn('Uploaded JSON is valid but not a Feature or FeatureCollection');
    return;
  }

  if (!featuresToSet || featuresToSet.length === 0) {
    alert('No valid features found in file.');
    return;
  }

  const cleanedFeatures = featuresToSet.map((feature) => ({
    ...feature,
    geometry: {
      ...feature.geometry,
      coordinates: cleanTo2D(feature.geometry.coordinates),
    },
  }));

  setFeatures(cleanedFeatures);

  try {
    const centerPoint = centroid({
      type: 'FeatureCollection',
      features: featuresToSet,
    });
    const [centerLon, centerLat] = centerPoint.geometry.coordinates;
    setLatLon([centerLat, centerLon]);

    const newBounds = bbox({
      type: 'FeatureCollection',
      features: featuresToSet,
    });
    setBounds(newBounds);
  } catch (e) {
    console.warn('Could not calculate bounds', e);
  }
};

/**
 * Processes an array of features into a single Polygon or MultiPolygon geometry
 * This is required for storing the geometries in MongoDB
 * @param {Array} featuresArray - Array of GeoJSON features
 * @returns {Object|null} - Polygon or MultiPolygon geometry, or null if invalid
 */
export const processGeometries = (featuresArray) => {
  if (!featuresArray || featuresArray.length === 0) return null;

  // Case 1: Single Shape -> Return strict Polygon
  if (featuresArray.length === 1) {
    return featuresArray[0].geometry;
  }

  // Case 2: Multiple Shapes -> Merge into MultiPolygon
  const cleanCoords = [];

  featuresArray.forEach((f) => {
    const { type, coordinates } = f.geometry;

    if (type === 'Polygon') {
      cleanCoords.push(coordinates);
    } else if (type === 'MultiPolygon') {
      cleanCoords.push(...coordinates);
    }
  });

  return {
    type: 'MultiPolygon',
    coordinates: cleanCoords,
  };
};

/**
 * Converts geometries (format as saved in db) to features (format required for mapbox maps)
 * @param {*} geometry - Geometry as saved in database (geometry.type can be either Polygon or MultiPolygon)
 * @param {Function} setFeatures - React state setter used to store the extracted array of GeoJSON features.
 * @param {Function} setLatLon - React state setter that sets [lat, lon] based on the centroid
 * @param {Function} setBounds - React state setter that sets the bounding box array [minX, minY, maxX, maxY] based on the features.
 */
export const geometriesToFeatures = (geometry, setFeatures, setLatLon, setBounds) => {
  if (geometry && geometry.type && geometry.coordinates) {
    const featuresToSet = [
      {
        type: 'Feature',
        properties: {},
        geometry, // works for BOTH Polygon & MultiPolygon
      },
    ];

    setFeatures(featuresToSet);

    try {
      const centerPoint = centroid({
        type: 'FeatureCollection',
        features: featuresToSet,
      });
      const [centerLon, centerLat] = centerPoint.geometry.coordinates;
      setLatLon([centerLat, centerLon]);

      const newBounds = bbox({
        type: 'FeatureCollection',
        features: featuresToSet,
      });
      setBounds(newBounds);
    } catch (e) {
      console.warn('Could not calculate bounds', e);
    }
  }
};
