/* eslint-disable */
import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import area from "@turf/area";
import centroid from "@turf/centroid";
import turf from "turf";
import chroma from "chroma-js";
import { geocodeReverse, coordinatesGeocoder } from "./helpers";

import styles from "./map.module.scss";
import "./mapbox-gl.css";
import "./mapbox-gl-draw.css";
import "./mapbox-gl-geocoder.css";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoibWlsYWRueXUiLCJhIjoiY2xhNmhkZDVwMWxqODN4bWhkYXFnNjRrMCJ9.VWy3AxJ3ULhYNw8nmVdMew";
mapboxgl.accessToken = MAPBOX_TOKEN;

const transpose = m => m[0].map((x, i) => m.map(x => x[i]))

// const bbox = [275370, 4547430, 277050, 4549110];
// const bbox = [-80.25, 37.78, -80.0, 37.68];
// const bbox = [-80.25, 37.7, -80.2, 37.68];
const polygons = turf.featureCollection([]);
let bbox, biomassData;

const acreDiv = 4046.856422;
const fastFly = {
  bearing: 0,
  speed: 4, // Make the flying slow/fast.
  curve: 5, // Change the speed at which it zooms out.
  easing: (t) => t ** 2,
};

const NcalcMap = ({
  setAddress = () => { },
  setFeatures = () => { },
  setZoom = () => { },
  setMap = () => { },
  onDraw = () => { },
  initRasterObject = {},
  initFeatures = [],
  initWidth = "400px",
  initHeight = "400px",
  initAddress = "",
  initLon = -75,
  initLat = 40,
  initStartZoom = 12,
  initMinZoom = 5,
  initMaxZoom = 16,
  hasSearchBar = false,
  hasMarker = false,
  hasNavigation = false,
  hasCoordBar = false,
  hasDrawing = false,
  hasGeolocate = false,
  hasFullScreen = false,
  hasMarkerPopup = false,
  hasMarkerMovable = false,
  scrollZoom = true,
  dragRotate = true,
  dragPan = true,
  keyboard = true,
  doubleClickZoom = false,
  touchZoomRotate = true,
}) => {
  // eslint-disable-next-line no-unused-vars
  const [lastZoom, setLastZoom] = useState(initStartZoom);
  const [viewport, setViewport] = useState({
    initWidth,
    initHeight,
    initLon,
    initLat,
    lastZoom,
    initMinZoom,
    initMaxZoom,
  });
  const [marker, setMarker] = useState({
    longitude: initLon,
    latitude: initLat,
  });
  const [cursorLoc, setCursorLoc] = useState({
    longitude: undefined,
    latitude: undefined,
  });
  const [featuresInitialized, setFeaturesInitialized] = useState(false);
  const [polygonArea, setPolygonArea] = useState(0);
  const [isDrawActive, setIsDrawActive] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState(undefined);
  const [popupOpen, setPopupOpen] = useState(true);
  const [flyToOptions, setFlyToOptions] = useState({});

  const map = useRef();
  const mapContainer = useRef();
  const drawerRef = useRef();
  const markerRef = useRef();
  const popupRef = useRef();
  const geocoderRef = useRef();

  //// GEOCODER CONTROL
  const Geocoder = new MapboxGeocoder({
    placeholder: initAddress || "Search Your Address ...",
    localGeocoder: coordinatesGeocoder,
    marker: false,
    accessToken: MAPBOX_TOKEN,
    container: map.current,
    proximity: "ip",
    trackProximity: true,
    countries: "us",
  });
  geocoderRef.current = Geocoder;
  // const bbox = [-80.35, 37.7895, -80.0, 40.6895];

  useEffect(() => {
    if (initRasterObject && Object.keys(initRasterObject).length > 0) {
      if (initRasterObject.data_array && initRasterObject.data_array.length > 0) {
        biomassData = initRasterObject.data_array;
        biomassData = transpose(biomassData);
        bbox = initRasterObject.bbox;
      }
    }
    if (biomassData && biomassData.length > 0) {
      let scale = chroma.scale(["white", "red"]);
      const w = biomassData.length;
      const h = biomassData[0].length;
      const lon = bbox[0];
      const lat = bbox[1];
      const dLon = (bbox[2] - bbox[0]) / w;
      const dLat = (bbox[1] - bbox[3]) / h;
      // console.log("dLon, dLat", dLon, dLat)
      for (let i = 0; i < w; i++) {
        for (let j = 0; j < h; j++) {
          const topLeftCorner = { lon: lon + i * dLon, lat: lat - j * dLat };
          let biomassVal = biomassData[i][j] !== -9999 ? biomassData[i][j] : null;
          biomassVal &&
            biomassVal > -9998 &&
            polygons.features.push(
              turf.polygon([[
                [topLeftCorner.lon, topLeftCorner.lat],
                [topLeftCorner.lon + dLon, topLeftCorner.lat],
                [topLeftCorner.lon + dLon, topLeftCorner.lat - dLat],
                [topLeftCorner.lon, topLeftCorner.lat - dLat],
                [topLeftCorner.lon, topLeftCorner.lat],
              ]], {
                value: biomassVal,
              })
            );
        }
      }
      map.current && map.current.getSource("biomassPolygons").setData(polygons);
    }

  }, []);

  // handle empty initFeature
  useEffect(() => {
    if (hasDrawing && drawerRef.current && initFeatures.length) {
      drawerRef.current.add({
        type: "FeatureCollection",
        features: initFeatures,
      });
    }
  }, [initFeatures]);

  // delete all shapes after geocode search
  useEffect(() => {
    if (hasDrawing && drawerRef.current) drawerRef.current.deleteAll();
  }, [geocodeResult]);

  // upon marker move, find the address of this new location and set the state
  useEffect(() => {
    geocodeReverse({
      apiKey: MAPBOX_TOKEN,
      setterFunc: (address) => {
        document.querySelector(".mapboxgl-ctrl-geocoder--input").placeholder =
          address().fullAddress;
        // Geocoder.setPlaceholder(address().fullAddress);
        setAddress(address);
      },
      longitude: marker.longitude,
      latitude: marker.latitude,
    });

    setAddress((addr) => ({
      ...addr,
      longitude: marker.longitude,
      latitude: marker.latitude,
    }));
    if (markerRef.current) {
      const lngLat = [marker.longitude, marker.latitude];
      popupRef.current.setHTML(
        `<span> click and drag </span>
      <br />
      <span>${marker.longitude.toFixed(4)}  ${marker.latitude.toFixed(
          4
        )}</span>`
      );
      markerRef.current.setLngLat(lngLat).setPopup(popupRef.current);
      map.current.flyTo({
        center: lngLat,
        ...flyToOptions,
      });
    }
  }, [marker.longitude, marker.latitude]);

  useEffect(() => {
    //// MAP CREATE
    if (map.current) return; // initialize map only once
    var Map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [initLon, initLat],
      zoom: initStartZoom,
    });
    map.current = Map;

    //// MARKER POPUP
    // const popup = new mapboxgl.Popup({ offset: 25 }).setText(
    //   'drag marker or double click anywhere'
    // );
    const Popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<span> click and drag </span>
      <br />
      <span>${marker.longitude.toFixed(4)}  ${marker.latitude.toFixed(
        4
      )}</span>`
    );
    popupRef.current = Popup;

    // Create a popup, but don't add it to the map yet.
    const overlayPopup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: true
    });

    //// MARKER CONTROL
    const Marker = new mapboxgl.Marker({
      draggable: hasMarkerMovable,
      color: "#e63946",
      scale: 1,
    })
      .setLngLat([marker.longitude, marker.latitude])
      .setPopup(Popup);
    markerRef.current = Marker;
    Marker.className = styles.marker;

    const simpleSelect = MapboxDraw.modes.simple_select;
    const directSelect = MapboxDraw.modes.direct_select;

    simpleSelect.dragMove = () => { };
    directSelect.dragFeature = () => { };

    // DRAWER CONTROL
    const Draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
      modes: {
        ...MapboxDraw.modes,
        simple_select: simpleSelect,
        direct_select: directSelect,
      },
    });
    drawerRef.current = Draw;

    //// GEOLOCATE CONTROL
    const Geolocate = new mapboxgl.GeolocateControl({ container: map.current });
    Geolocate._updateCamera = () => { };

    //// NAVIGATION CONTROL
    const Navigation = new mapboxgl.NavigationControl({
      container: map.current,
    });

    //// FULLSCREEN CONTROL
    const Fullscreen = new mapboxgl.FullscreenControl({
      container: map.current,
    });

    //// ADD CONTROLS
    if (hasFullScreen) map.current.addControl(Fullscreen, "top-right");
    if (hasNavigation) map.current.addControl(Navigation, "top-right");
    if (hasGeolocate) map.current.addControl(Geolocate, "top-right");
    if (hasDrawing) map.current.addControl(Draw, "top-left");
    if (hasSearchBar) map.current.addControl(Geocoder, "top-left");
    if (hasMarker && !isDrawActive) Marker.addTo(map.current);

    // if (!initAddress) {
    //   Geocoder.setPlaceholder('Search Your Address ...');
    // }

    //// FUNCTIONS
    function onDragEnd(e) {
      const lngLat = e.target.getLngLat();
      // map.current.flyTo({
      //   center: lngLat,
      // });
      setMarker((prev) => ({
        ...prev,
        longitude: lngLat.lng,
        latitude: lngLat.lat,
      }));
    }
    const handleGeolocate = (e) => {
      const lngLat = e.target._userLocationDotMarker._lngLat;
      setFlyToOptions(fastFly);

      setMarker((prev) => ({
        ...prev,
        longitude: lngLat.lng,
        latitude: lngLat.lat,
      }));
      setFlyToOptions({});

      // clear all shapes after geolocating to user's location
      if (hasDrawing && drawerRef.current) {
        drawerRef.current.deleteAll();
        setPolygonArea(0);
      }
    };

    const handlePolyCentCalc = (geom) => {
      if (geom) {
        if (geom.features.length > 0) {
          const coords = centroid(geom.features[0]).geometry.coordinates;

          setMarker((prev) => ({
            ...prev,
            longitude: coords[0],
            latitude: coords[1],
          }));
          setViewport((prev) => ({
            ...prev,
            longitude: coords[0],
            latitude: coords[1],
          }));
        }
      }
    };

    const handlePolyAreaCalc = (e) => {
      if (e.features.length > 0) {
        const a = area(e.features[0]) / acreDiv;
        setPolygonArea(a);
        setFeatures(e.features);
        handlePolyCentCalc(e);
      } else {
        setPolygonArea(0);
      }
    };

    const handleDrawCreate = (e) => {
      onDraw({ mode: "add", e: e });
    };
    const handleDrawDelete = (e) => {
      setIsDrawActive(false);
      onDraw({ mode: "delete", e: e });
    };
    const handleDrawUpdate = (e) => {
      onDraw({ mode: "update", e: e });
      handlePolyAreaCalc(e);
    };
    const handleDrawSelection = (e) => {
      onDraw({ mode: "select", e: e });
      handlePolyAreaCalc(e);
    };

    //// EVENTS
    Geolocate.on("geolocate", handleGeolocate);
    Geocoder.on("result", (e) => {
      var streetNum;
      var zipCode;
      if (e && e.result) {
        setGeocodeResult(e.result);
        var fullAddress = e.result.place_name;
        if (fullAddress.includes("Lat") && fullAddress.includes("Lng")) {
          let longitude = e.result.geometry.coordinates[0];
          let latitude = e.result.geometry.coordinates[1];
          geocodeReverse({
            apiKey: MAPBOX_TOKEN,
            setterFunc: (address) => {
              document.querySelector(
                ".mapboxgl-ctrl-geocoder--input"
              ).placeholder = address().fullAddress;
              // Geocoder.setPlaceholder(address().fullAddress);
              setAddress(address);
            },
            longitude: longitude,
            latitude: latitude,
          });
        } else {
          const splitted = fullAddress.split(", ");
          streetNum = splitted[0];
          const stateZip = splitted[splitted.length - 2].split(" ");
          zipCode = stateZip[stateZip.length - 1];
        }
        if (fullAddress) {
          setViewport((prev) => ({
            ...prev,
            address: streetNum,
            zipCode,
            fullAddress,
          }));
          setFlyToOptions(fastFly);

          setMarker((prev) => ({
            ...prev,
            longitude: e.result.center[0],
            latitude: e.result.center[1],
          }));
          setFlyToOptions({});
        }
      }
    });
    if (hasMarkerMovable) {
      map.current.on("dblclick", (e) => {
        setMarker((prev) => ({
          ...prev,
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
        }));
      });
    }
    map.current.on("mousemove", (e) => {
      const lnglat = e.lngLat.wrap();
      setCursorLoc({
        longitude: lnglat.lng.toFixed(4),
        latitude: lnglat.lat.toFixed(4),
      });
    });

    map.current.on("load", (e) => {

      map.current.addSource("biomassPolygons", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });
      map.current.getSource("biomassPolygons").setData(polygons);
      // add a layer that displays the data
      if (map.current.getLayer("biomassPolygons")) {
        map.removeLayer("biomassPolygons");
      }
      map.current.addLayer({
        id: "biomassPolygons",
        type: "fill",
        source: "biomassPolygons",
        paint: {
          "fill-opacity": 0.3,
          "fill-color": {
            property: "value",
            stops: [
              [60, "#e71d36"],
              [100, "#f86624"],
              [140, "#f9c80e"],
              [180, "#affc41"],
              [220, "#1dd3b0"],
              [260, "#086375"],
            ],
          },
        },
      });

      if (!scrollZoom) map.current.scrollZoom.disable();
      if (!dragRotate) map.current.dragRotate.disable();
      if (!dragPan) map.current.dragPan.disable();
      if (!keyboard) map.current.keyboard.disable();
      if (!doubleClickZoom) map.current.doubleClickZoom.disable();
      if (!touchZoomRotate) map.current.touchZoomRotate.disable();
      if (hasMarkerPopup) {
        markerRef.current.togglePopup();
        setTimeout(() => markerRef.current.togglePopup(), 2000);
      }
      if (
        drawerRef.current &&
        hasDrawing &&
        initFeatures.length > 0 &&
        !featuresInitialized
      ) {
        drawerRef.current.add({
          type: "FeatureCollection",
          features: initFeatures,
        });
        setFeaturesInitialized(true);
      }

      map.current.addPolygon = function (id, polygon, options = {}) {
        const lineId = `${id}-line`;

        const polygonStyle = {
          "fill-color": options["fill-color"] ?? "#000",
          "fill-opacity": options["fill-opacity"] ?? 1,
        };

        const lineStyle = {
          "line-color": options["line-color"] ?? "#000",
          "line-opacity": options["line-opacity"] ?? 1,
          "line-width": options["line-width"] ?? 1,
        };

        if (map.current.getLayer(id)) {
          map.current.removeLayer(id);
        }

        if (map.current.getLayer(lineId)) {
          map.current.removeLayer(lineId);
        }

        if (map.current.getSource(id)) {
          map.current.removeSource(id);
        }

        map.current.addSource(id, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: polygon,
            },
          },
        });

        map.current.addLayer({
          id,
          type: "fill",
          source: id,
          paint: polygonStyle,
        });

        map.current.addLayer({
          id: lineId,
          type: "line",
          source: id,
          paint: lineStyle,
        });

        map.current.on("mouseenter", id, () => {

          map.current.setPaintProperty(lineId, "line-width", 2);
          map.current.setPaintProperty(lineId, "line-color", "#aaa");

          ["fill-color", "fill-opacity"].forEach((prop) => {
            if (options.hover?.[prop]) {
              map.current.setPaintProperty(id, prop, options.hover[prop]);
            }
          });

          ["line-width", "line-color", "line-opacity"].forEach((prop) => {
            if (options.hover?.[prop]) {
              map.current.setPaintProperty(lineId, prop, options.hover[prop]);
            }
          });
        });

        map.current.on("mouseleave", id, () => {
          Object.entries(polygonStyle).forEach(([property, value]) => {
            map.current.setPaintProperty(id, property, value);
          });

          Object.entries(lineStyle).forEach(([property, value]) => {
            map.current.setPaintProperty(lineId, property, value);
          });
        });
      };

      setMap(map.current);
    });

    map.current.on("draw.create", handleDrawCreate);
    map.current.on("draw.delete", handleDrawDelete);
    map.current.on("draw.update", handleDrawUpdate);
    map.current.on("draw.selectionchange", handleDrawSelection);
    Marker.on("dragend", onDragEnd);

    // Biomass layer listeners
    map.current.on("click", "biomassPolygons", (e) => {
      e.preventDefault();
      // // Map overlay (Biomass) popup
      map.current.getCanvas().style.cursor = 'pointer';
      // Copy coordinates array.
      const coordinates = e.features[0].geometry.coordinates.slice();
      const description = `<div>value: ${e.features[0].properties.value}</div>`

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      // Populate the popup and set its coordinates
      // based on the feature found.
      overlayPopup.setLngLat([
        (coordinates[0][0][0] + coordinates[0][2][0]) / 2,
        (coordinates[0][0][1] + coordinates[0][2][1]) / 2]
      ).setHTML(description).addTo(map.current);
    })

    // map.current.on("mouseleave", "biomassPolygonsData", (e) => {
    //   map.current.getCanvas().style.cursor = '';
    //   overlayPopup.remove();
    // })

  }, [map]);

  useEffect(() => {
    map.current.on("zoom", () => {
      const currentZoom = map.current.getZoom();
      setLastZoom(currentZoom);
      setZoom(currentZoom);
    });
  }, []);

  return (
    <div className={styles.wrapper}>
      <div
        id="map"
        ref={mapContainer}
        className={styles.map}
        style={{ width: initWidth, height: initHeight }}
      />
      {hasCoordBar && cursorLoc.longitude && (
        <div className={styles.infobar}>
          <ul>
            <li>{`Longitude:${cursorLoc.longitude}`}</li>
            <li>{`Latitude:${cursorLoc.latitude}`}</li>
            {polygonArea > 0 && (
              <li>{`Area ${polygonArea.toFixed(2)} acres`}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export { NcalcMap };
