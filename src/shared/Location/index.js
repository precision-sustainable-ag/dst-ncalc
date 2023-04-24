import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Map from '../Map';
import Input from '../Inputs';
import Biomass from '../Biomass';
import Help from '../Help';

import './styles.scss';

const Location = () => (
  <div className="locationWrapper">
    <div className="mapHeader">
      <div className="mapHeaderText">
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography variant="h5" gutterBottom>
              Where is your Field located?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h8" gutterBottom>
              Enter your address or zip code to determine your field&apos;s location. You can then
              zoom in and click to pinpoint it on the map. If you know your exact coordinates, you
              can enter them in search bar separated by comma (ex. 37.7, -80.2 ).
            </Typography>
            <div className="inputsContainer">
              <Input
                label="Name your Field (optional)"
                id="field"
                autoComplete="off"
                style={{ height: '2rem', minWidth: '13rem' }}
              />
              <Help className="moveLeft">
                <p>
                  This input is optional. If you enter a field name, you will be able to rerun the
                  model on this computer without re-entering your data.
                </p>
                <p>Notes:</p>
                <ul>
                  <li>
                    If you have multiple fields, you will be able to select them from a drop-down
                    menu in the upper-right.
                  </li>
                  <li>
                    Your information is stored on your computer only. It will not be uploaded to a
                    server.
                  </li>
                  <li>
                    If you clear your browser&apos;s cache, you will need to re-enter your data the
                    next time you run the program.
                  </li>
                </ul>
              </Help>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>

      <div>
        <Biomass />
      </div>
    </div>
    <div
      style={{
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div className="map">
        <Map />
      </div>
      <div
        style={{
          justifyContent: 'space-evenly',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Link className="link" to="/home">
          BACK
        </Link>
        <Link className="link" to="/soil">
          NEXT
        </Link>
      </div>
    </div>
  </div>
); // Location

export default Location;
