import React, { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import Map from '../../shared/GoogleMaps';
import Map from "../Map";
import { Input } from "../Inputs";
import { Help } from "../Help";
import { useSelector, useDispatch } from "react-redux";
import { get, set } from "../../store/Store";

import "./styles.scss";

const Location = () => {
  return (
    <div className="locationWrapper">
      <div className="mapHeader">
        <div className="mapHeaderText">
          <h1>Where is your Field located?</h1>
          <p>
            Enter your address or zip code to determine your field's location.
            You can then zoom in and click to pinpoint it on the map. If you
            know your exact coordinates, you can enter them separated by comma
            (ex. 37.7, -80.2 ).
          </p>
        </div>
        <div className="inputsContainer">
          <Input
            label="Name your Field"
            id="field"
            autoComplete="off"
            style={{ height: "2rem" }}
          />
          <Help className="moveLeft">
            <p>
              This input is optional. If you enter a field name, you'll be able
              to rerun the model on this computer without re-entering your data.
            </p>
            <p>Notes:</p>
            <ul>
              <li>
                If you have multiple fields, you'll be able to select them from
                a drop-down menu in the upper-right.
              </li>
              <li>
                Your information is stored on your computer only. It will not be
                uploaded to a server.
              </li>
              <li>
                If you clear your browser's cache, you'll need to re-enter your
                data the next time you run the program.
              </li>
            </ul>
          </Help>
        </div>
      </div>
      <div className="map">
        <Map />
      </div>
      <div className="bn">
        <Link className="link" to={"/home"}>
          BACK
        </Link>
        <Link className="link" to={"/soil"}>
          NEXT
        </Link>
      </div>
    </div>
  );
}; // Location

export default Location;
