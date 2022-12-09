import React, { useState, useEffect } from "react";
import { Map } from "@psa/dst.ui.map";
import { useDispatch } from "react-redux";
import { set } from "../../store/Store";
import mapboxgl from 'mapbox-gl';
import "./styles.scss";
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;


const MapComp = () => {
  const [address, setAddress] = useState({});
  const [geometry, setGeometry] = useState([]);
  const dispatch = useDispatch();
  const initStartZoom = 10;
  useEffect(() => {
    dispatch(set.mapPolygon(geometry));
    dispatch(set.mapZoom(initStartZoom));
    dispatch(set.mapType("satellite"));
    if (address.latitude) dispatch(set.lat(address.latitude));
    if (address.longitude) dispatch(set.lon(address.longitude));
  }, [address, geometry]);

  return (
    <div className="map">
      <Map
        setAddress={setAddress}
        setGeometry={setGeometry}
        initWidth="100%"
        initHeight="400px"
        initLon={-80.16}
        initLat={37.75}
        initStartZoom={initStartZoom}
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
      />
    </div>
  );
};

export default MapComp;
