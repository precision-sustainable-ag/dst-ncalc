/* eslint-disable no-console */
/* eslint-disable react/no-this-in-sfc */
/* eslint-disable max-len */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import moment from 'moment';
// import { CSVLink } from 'react-csv';
import { useDispatch, useSelector } from 'react-redux';

import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
} from '@mui/material';

import Loading from './subcomponents/loading';
import Error from './subcomponents/error';

import {
  get, set, missingData,
} from '../../store/Store';
import Map from '../../shared/Map';
import './styles.scss';
import Biomass from '../../shared/Biomass';
import { useFetchModel } from '../../hooks/useFetchApi';

import model from './model.json';
import { getGeneralChartOptions, getNitrogenChartOptions, getResidueChartOptions } from './subcomponents/chart';
import SummaryList from './subcomponents/summary';

console.log('modelObj', model);
const params = new URLSearchParams(window.location.search);

const Output = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const doIncorporated = false;
  const lat = useSelector(get.lat);
  const lon = useSelector(get.lon);
  const BD = useSelector(get.BD);
  const N = useSelector(get.N);
  const killDate = useSelector(get.killDate);
  const plantingDate = useSelector(get.plantingDate);
  let carb = useSelector(get.carb);
  let cell = useSelector(get.cell);
  let lign = useSelector(get.lign);
  const lwc = useSelector(get.lwc);
  const biomass = useSelector(get.biomass);
  const unit = useSelector(get.unit);
  const InorganicN = useSelector(get.InorganicN);
  const coverCrop = useSelector(get.coverCrop);
  const field = useSelector(get.field);
  // const gotModel = useSelector(get.gotModel);
  // const gotModel = true;
  const errorModel = useSelector(get.errorModel);
  const errorCorn = useSelector(get.errorCorn);
  // const model = useSelector(get.model);
  // const model = {};
  const mockup = useSelector(get.mockup);
  const cornN = useSelector(get.cornN);
  const cashCrop = useSelector(get.cashCrop);
  const Yield = useSelector(get.yield);
  const outputN = useSelector(get.outputN);
  const nweeks = useSelector(get.nweeks);
  const targetN = useSelector(get.targetN);
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';

  console.log('field: ', field);

  if (field) {
    if (!/Example: Grass|Example: Legume/.test(field)) {
      try {
        localStorage.setItem(field, JSON.stringify({
          lat,
          lon,
          BD,
          N,
          killDate,
          plantingDate,
          carb,
          cell,
          lign,
          lwc,
          biomass,
          unit,
          InorganicN,
          coverCrop,
          field,
          // gotModel,
          errorModel,
          errorCorn,
          // model,
          mockup,
          // cornN,
          cashCrop,
          yield: Yield,
          outputN,
          nweeks,
          targetN,
        }));
      } catch (ee) {
        console.log(ee);
      }
    }
  }

  const modelData = useFetchModel();
  console.log('HOOK modelData', modelData);
  // useEffect(() => {
  //   console.log('dispatch, gotModel changed');
  //   console.log('gotModel fetchModel', gotModel);
  //   if (!gotModel) {
  //     console.log('fetchModel triggered ...');
  //     useFetchModel();
  //   }
  // }, [dispatch, gotModel]);

  const scr = missingData();
  if (scr) {
    setTimeout(() => navigate(`../${scr}`), 1);
    return '';
  }

  /// / fallback loading warning
  if (errorModel || errorCorn) {
    const errors = [];
    if (errorModel) {
      errors.push('Couldn\'t run Model.  Make sure your location is in the continental United States.');
    }
    if (errorCorn) {
      errors.push('Couldn\'t run corn uptake curve.');
    }
    return <Error errors={errors} />;
  }

  console.log('modelData', modelData, 'cornN', cornN);

  if (!modelData || !modelData.s) {
    console.log('showing loading ....');
    return <Loading />;
  }

  // Object.keys(model.s).forEach((key) => {
  //   if (!/^(Temp|MinNfromFOM|FOM|Date|Rain)$/.test(key)) {
  //     // delete model.s[key];
  //   }
  // });

  const total = +carb + +cell + +lign;
  carb = (carb * 100) / total;
  cell = (cell * 100) / total;
  lign = (lign * 100) / total;
  const factor = unit === 'lb/ac' ? 1.12085 : 1;

  const d1 = new Date(plantingDate);
  let dailyTotal = 0;
  let gdd = 0;
  // const NUptake = [[+plantingDate, 0]];
  const NUptake = [];

  const doCornN = cashCrop === 'Corn' && outputN === 1;
  if (doCornN) {
    const f = unit === 'lb/ac' ? 1 : 1.12085;

    cornN.forEach((rec) => {
      const temp = rec.air_temperature;

      dailyTotal += temp - 8;
      if (d1.getHours() === 0) {
        gdd += (dailyTotal / 24);
        NUptake.push([
          // d1 - (1000 * 60 * 60 * 24),
          +d1,
          ((Yield * 1.09) / (1 + Math.exp((-0.00615 * (gdd - 646.19))))) * f,
        ]);
        dailyTotal = 0;
      }
      d1.setHours(d1.getHours() + 1);
    });

    /*
    model.s.Temp.slice((plantingDate - killDate) / (1000 * 60 * 60)).forEach(temp => {
      dailyTotal += temp - 8;
      if (d1.getHours() === 0) {
        gdd += (dailyTotal / 24);
        NUptake.push([
          // d1 - (1000 * 60 * 60 * 24),
          +d1,
          (Yield * 1.09) / (1 + Math.exp((-0.00615 * (gdd - 646.19)))) * f
        ]);
        dailyTotal = 0;
      }
      d1.setHours(d1.getHours() + 1);
    });
    */
  }

  let date = new Date(killDate);
  date.setHours(0, 0, 0, 0);
  const surfaceData = [];

  let m2;
  let m4;
  let mf;
  const dates = [];

  model.s[outputN === 1 ? 'MinNfromFOM' : 'FOM'].forEach((d, i, a) => {
    const value = +(d / factor).toFixed(2);

    if (i === 24 * 2 * 7) {
      m2 = value;
    } else if (i === 24 * 4 * 7) {
      m4 = value;
    } else if (i === 24 * 13 * 7) {
      mf = value;
    }

    dates.push(moment(date).format('YYYY-MM-DD HH:mm'));

    if (date.getHours() === 0) {
      surfaceData.push({
        x: +date,
        y: +value,
        marker: {
          radius: 5,
          fillColor: '#008837',
          enabled: (Math.round(i / 24) === nweeks * 7)
            || (i === a.length - 1 && nweeks * 7 * 24 >= a.length),
        },
      });
    }
    date.setHours(date.getHours() + 1);
  });

  date = new Date(killDate);
  const incorporatedData = [];

  if (doIncorporated) {
    model.i[outputN === 1 ? 'FomCumN' : 'FOM'].forEach((d, i, a) => {
      const value = +(d / factor).toFixed(2);
      incorporatedData.push({
        x: +date,
        y: +value,
        marker: {
          radius: 5,
          fillColor: '#008837',
          enabled: (i / 24 === nweeks * 7)
            || (i === a.length - 1 && nweeks * 7 * 24 >= a.length),
        },
      });
      date.setDate(date.getDate() + 1);
    });
  }

  const maxSurface = outputN === 1 ? (biomass * N) / 100 : Math.max(...surfaceData.map((d) => d.y));
  const surfaceMin = outputN === 1 ? (biomass * N) / 100 : Math.min(...surfaceData.map((d) => d.y));
  const incorporatedMin = outputN === 1 ? (biomass * N) / 100 : Math.min(...incorporatedData.map((d) => d.y));

  const minDate = new Date(killDate);

  // let labModel = '';

  if (params.get('fy')) {
    const src = `http://aesl.ces.uga.edu/mineralization/client/surface/?fy=${params.get('fy')}&lab=${params.get('lab')}&modeled2=${m2}&modeled4=${m4}&modeled=${mf}`;
    console.log('src', src);
    // labModel = <iframe title="N/A" style={{ display: 'none' }} src={src} />;
  }

  const surfaceNPredict = Math.round(model.s.MinNfromFOM.slice(-1) / factor);

  const incorporatedNPredict = doIncorporated && Math.round(model.i.FomCumN.slice(-1) / factor);

  // const cols = ['FOM', 'Carb', 'Cell', 'Lign', 'FON', 'CarbN', 'CellN', 'LigninN', 'RMTFAC', 'CNRF', 'ContactFactor', 'Rain', 'Temp', 'RH', 'Air_MPa', 'LitterMPa'];

  // const csv = `Date,${cols}\n${dates.map((dt, i) => `${dt},${cols.map((col) => model.s[col][i])}`).join('\n')}`;

  const summary = (
    <div className="inputs" style={{ borderTop: mockup === 1 ? '1px solid #bbb' : 'none', paddingTop: mockup === 1 ? '1em' : 'none' }}>
      By
      &nbsp;
      <select
        id="nweeks"
        onChange={(e) => dispatch(set.nweeks(e.target.value))}
        value={nweeks}
      >
        {
          Array(Math.round(model.s.Date.length / 24 / 7)).fill().map((_, i) => <option key={i + 1}>{i + 1}</option>)
        }
      </select>
      &nbsp;
      week
      {nweeks > 1 ? 's' : ''}
      {' '}
      after cover crop termination,
      {outputN === 1 ? ' cumulative N released ' : ' undecomposed residue mass remaining '}
      is:
      <ul>
        <li>
          <strong>{Math.round(surfaceData[Math.min(nweeks * 7, surfaceData.length - 1)].y)}</strong>
          {' '}
          {unit}
          {' '}
          for surface residues.
        </li>
        {
          doIncorporated
          && (
            <li>
              {Math.round(incorporatedData[Math.min(nweeks * 7, incorporatedData.length - 1)].y)}
              {' '}
              {unit}
              {' '}
              for incorporated residues.
            </li>
          )
        }

      </ul>
    </div>
  );

  return (
    <Box sx={{ border: '3px solid red', minWidth: '100%' }}>
      <Container>
        <Stack direction="column" gap={3}>
          {/* {labModel}
          <div className="csv_download_div">
          <CSVLink data={csv} className="download">Download</CSVLink>
          </div>

          <div style={{ display: 'none' }}>
          Mockup: &nbsp;
          <button
            type="button"
            className={mockup === 1 ? 'selected' : ''}
            onClick={() => dispatch(set.mockup(1))}
          >
            1
          </button>
          <button
            type="button"
            className={mockup === 2 ? 'selected' : ''}
            onClick={() => dispatch(set.mockup(2))}
          >
            2
          </button>
          </div> */}

          <Paper>
            <Stack direction="column" gap={3} sx={{ border: '4px solid blue' }}>
              <Container>
                <Box>
                  <SummaryList />
                  <div>
                    <div className="inputs">
                      <table
                        className="coverCropSummary"
                        style={{ width: '100%', textAlign: 'center', borderBottom: '1px solid #888' }}
                      >
                        <tbody>
                          <tr>
                            <td>
                              <u>Field name</u>
                              <br />
                              (
                              <strong>{field}</strong>
                              )
                              <p />
                              <u>Species</u>
                              <br />
                              (
                              <strong>
                                {coverCrop.map((crop, i, a) => (
                                  <span key={crop}>
                                    {crop}
                                    {i < a.length - 1 ? <br /> : ''}
                                  </span>
                                ))}
                              </strong>
                              )
                              <p />
                              <u>Termination Date</u>
                              <br />
                              (
                              <strong>{moment(killDate).format('MMM D, yyyy')}</strong>
                              )
                              <p />
                              <u>Dry Biomass</u>
                              <br />
                              (
                              <strong>
                                {(+biomass).toFixed(0)}
                                {' '}
                                {unit}
                              </strong>
                              )
                            </td>
                            <td>
                              <u>Residue N Content</u>
                              <br />
                              (
                              <strong>
                                {((biomass * N) / 100).toFixed(0)}
                                {' '}
                                {unit}
                              </strong>
                              )
                              <p />
                              <u>Carbohydrates</u>
                              <br />
                              (
                              <strong>
                                {carb.toFixed(0)}
                                {' '}
                                %
                              </strong>
                              )
                              <p />
                              <u>Holo-cellulose</u>
                              <br />
                              (
                              <strong>
                                {cell.toFixed(0)}
                                {' '}
                                %
                              </strong>
                              )
                              <p />
                              <u>Lignin</u>
                              <br />
                              (
                              <strong>
                                {lign.toFixed(0)}
                                {' '}
                                %
                              </strong>
                              )
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <HighchartsReact
                    highcharts={Highcharts}
                    className="hidden"
                    options={getNitrogenChartOptions({
                      mockup,
                      outputN,
                      unit,
                      targetN,
                      doIncorporated,
                      incorporatedNPredict,
                      surfaceNPredict,
                    })}
                  />
                  {(outputN === 1 && targetN < surfaceNPredict) && <div className="footnote">* Your cover crop is supplying all of your needs.</div>}
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={getResidueChartOptions({
                      mockup,
                      outputN,
                      unit,
                      model,
                      doIncorporated,
                      incorporatedMin,
                      surfaceMin,
                    })}
                  />
                </Box>
              </Container>
              <Container>
                <Box>
                  <div className="output center" style={{ marginBottom: '1em' }}>
                    <button
                      type="button"
                      className={outputN === 1 ? 'selected' : ''}
                      onClick={() => dispatch(set.outputN(1))}
                    >
                      N RELEASED
                    </button>

                    <button
                      type="button"
                      className={outputN === 2 ? 'selected' : ''}
                      onClick={() => dispatch(set.outputN(2))}
                    >
                      RESIDUE REMAINING
                    </button>
                  </div>

                  {mockup === 2 && summary}

                  <HighchartsReact
                    highcharts={Highcharts}
                    options={getGeneralChartOptions({
                      mockup,
                      outputN,
                      doCornN,
                      unit,
                      minDate,
                      NUptake,
                      surfaceData,
                      doIncorporated,
                      incorporatedData,
                      plantingDate,
                      maxSurface,
                    })}
                  />

                  {mockup === 1 && summary}
                </Box>
              </Container>
            </Stack>
          </Paper>
          {isSatelliteMode
            && (
              <Box mb={8} sx={{ margin: '2rem 0rem' }}>
                <Paper sx={{ padding: '1rem' }}>
                  <Biomass minified />
                  <Map />
                </Paper>
              </Box>
            )}
          <Box sx={{
            justifyContent: 'space-around',
            alignItems: 'space-between',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
          }}
          >
            <Button
              sx={{ borderRadius: '1rem', fontSize: '22px', fontWeight: 900 }}
              onClick={() => navigate('/cashcrop')}
              variant="contained"
              color="success"
            >
              BACK
            </Button>
            <Button
              sx={{ borderRadius: '1rem', fontSize: '22px', fontWeight: 900 }}
              onClick={() => navigate('/advanced')}
              variant="contained"
              color="success"
            >
              ADVANCED
            </Button>
            <Button
              sx={{ borderRadius: '1rem', fontSize: '22px', fontWeight: 900 }}
              onClick={() => {
                dispatch(set.openFeedbackModal(true));
              }}
              variant="contained"
              color="success"
            >
              FEEDBACK
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}; // Output

export default Output;
