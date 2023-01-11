import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, NavLink, Routes, useNavigate } from "react-router-dom";

import { get, set } from "./store/Store";
import { Help } from "./shared/Help";

import "./App.css";
import "react-datepicker/dist/react-datepicker.css";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const screens = {
  init: () => <></>,
};

if (/water/i.test(window.location)) {
  screens.init = require("./water/Init").default;
  screens.home = require("./water/Home").default;
  screens.about = require("./water/About").default;
  screens.location = require("./shared/Location").default;
  screens.soil = require("./water/Soil").default;
  screens.worksheet = require("./water/Worksheet").default;
} else {
  screens.init = require("./ncalc/Init").default;
  screens.home = require("./ncalc/Home").default;
  screens.about = require("./ncalc/About").default;
  screens.location = require("./shared/Location").default;
  screens.soil = require("./ncalc/Soil").default;
  screens.covercrop = require("./ncalc/CoverCrop").CoverCrop1;
  screens.covercrop2 = require("./ncalc/CoverCrop").CoverCrop2;
  screens.cashcrop = require("./ncalc/CashCrop").default;
  screens.output = require("./ncalc/Output").default;
  screens.feedback = require("./ncalc/Feedback").default;
  screens.advanced = require("./ncalc/Advanced").default;
}

screens.init.showInMenu = false;

if (screens.feedback) {
  screens.feedback.showInMenu = false;
}

Object.keys(screens).forEach((key) => {
  screens[key].desc = screens[key].desc || key[0].toUpperCase() + key.slice(1);
});

const holdWarn = console.warn;
console.warn = (msg, ...subst) => {
  // Deprecation: moment
  // Autocomplete: useless warning, which has an overcomplicated isOptionEqualTo solution
  //               https://github.com/mui/material-ui/issues/29727

  if (!/Deprecation|Autocomplete/.test(msg)) {
    holdWarn(msg, ...subst);
  }
};

const Init = screens.init;

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [navModalOpen, setNavModalOpen] = useState(false);

  useSelector(get.screen); // force render

  const path =
    window.location.toString().split("/").pop().toLowerCase() || "home";
  const Screen = screens[path] || screens.home;

  return (
    <div
      tabIndex="0"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          dispatch(set.privacy(false));
        }
      }}
      id="Main"
    >
      <Help />
      <Init desktop={true} setNavModalOpen={setNavModalOpen} />
      {screens.feedback && (
        <button className="feedback" onClick={() => navigate("feedback")}>
          FEEDBACK
        </button>
      )}
      <img alt="logo" src="PSALogo.png" id="PSALogo" />
      <div className="nav-menu-div">
        <nav className="nav">
          {Object.keys(screens)
            .filter((scr) => screens[scr].showInMenu !== false)
            .map((scr) => {
              return (
                <NavLink
                  key={scr}
                  className={scr.toLowerCase()}
                  onClick={() => dispatch(set.screen(scr))}
                  style={({ isActive }) => {
                    return {
                      color: isActive ? "#385E1B" : "",
                      fontSize: "1.1rem",
                    };
                  }}
                  to={"/" + scr.toLowerCase()}
                >
                  {screens[scr].desc || scr}
                </NavLink>
              );
            })}
        </nav>
        <MenuIcon
          className="menu-icon"
          fontSize="large"
          onClick={() => setNavModalOpen(true)}
        />
        {navModalOpen && (
          <div className="menu-modal">
            <CloseIcon
              className="close-icon"
              fontSize="large"
              onClick={() => setNavModalOpen(false)}
            />
            <div className="menu-modal-div">
              {Object.keys(screens)
                .filter((scr) => screens[scr].showInMenu !== false)
                .map((scr) => {
                  return (
                    <NavLink
                      key={scr}
                      className={scr.toLowerCase()}
                      onClick={() => {
                        setNavModalOpen(false);
                        dispatch(set.screen(scr));
                      }}
                      style={({ isActive }) => {
                        return {
                          color: "#fff",
                          fontSize: "1.1rem",
                        };
                      }}
                      to={"/" + scr.toLowerCase()}
                    >
                      {screens[scr].desc || scr}
                    </NavLink>
                  );
                })}
              {screens.feedback && (
                <button
                  className="feedback-mobile"
                  onClick={() => {
                    setNavModalOpen(false);
                    navigate("feedback");
                  }}
                >
                  FEEDBACK
                </button>
              )}
              <div>
                <Init desktop={false} setNavModalOpen={setNavModalOpen} />
              </div>
            </div>
          </div>
        )}
      </div>

      <Routes>
        {Object.keys(screens).map((scr) => {
          return (
            <Route key={scr} path={scr.toLowerCase()} element={<Screen />} />
          );
        })}
        <Route path={""} element={<Screen />} />
      </Routes>
    </div>
  );
}; // App

document.title = window.location.toString().includes("water")
  ? "Water DST"
  : "CC-NCALC";

export default App;
