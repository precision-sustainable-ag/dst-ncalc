import React from 'react';

import Highcharts from 'highcharts';

import HighchartsReact from 'highcharts-react-official';

import moment from 'moment';

import {CSVLink} from "react-csv";
import {useDispatch, useSelector} from 'react-redux';
import {get, set, missingData} from '../store/Store';
import {Link, useNavigate} from 'react-router-dom';

const params = new URLSearchParams(window.location.search);

const Output = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const doIncorporated = false;
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
  const gotModel = useSelector(get.gotModel);
  const errorModel = useSelector(get.errorModel);
  const errorCorn = useSelector(get.errorCorn);
  const model = useSelector(get.model);
  const mockup = useSelector(get.mockup);
  const cornN = useSelector(get.cornN);
  const cashCrop = useSelector(get.cashCrop);
  const Yield = useSelector(get.yield);
  const outputN = useSelector(get.outputN);
  const nweeks = useSelector(get.nweeks);
  const targetN = useSelector(get.targetN);

  const scr = missingData();
  if (scr) {
    setTimeout(() => navigate('../' + scr), 1);
    return '';
  }

  if (errorModel || errorCorn) {
    const errors = [];
    if (errorModel) {
      errors.push(`Couldn't run Model.  Make sure your location is in the continental United States.`)
    }
    if (errorCorn) {
      errors.push(`Couldn't run corn uptake curve.`)
    }
    return (
      <>
        <p>
          Errors:
        </p>
        <ul>
          {errors.map(k => <li>{k}</li>)}
        </ul>
        <p>
          Please review your inputs and try again.
        </p>
      </>
    )
  }

  console.log({gotModel, cornN, model, biomass, N, carb, cell, lign, lwc, BD, InorganicN});

  if (!gotModel || !cornN || !model || !biomass || !N || !carb || !cell || !lign || !lwc || !BD || !InorganicN) {
    return (
      <>
        <div className="loading">
          <p>Loading Output</p>
          <p>Please wait</p>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <ul>
          <li>Model: {errorModel.toString()}</li>
          <li>Corn uptake curve: {errorCorn.toString()}</li>
        </ul>
      </>
    );
  }

  Object.keys(model.s).forEach(key => {
    if (!/^(Temp|MinNfromFOM|FOM|Date|Rain)$/.test(key)) {
      // delete model.s[key];
    }
  });

  console.log(model.s);

  const total = +carb + +cell + +lign;
  carb = carb * 100 / total;
  cell = cell * 100 / total;
  lign = lign * 100 / total;
  const factor = unit === 'lb/ac' ? 1.12085 : 1;

  const d1 = new Date(plantingDate);
  let dailyTotal = 0;
  let gdd = 0;
  // const NUptake = [[+plantingDate, 0]];
  const NUptake = [];

  const doCornN = cashCrop === 'Corn' && outputN === 1;
  if (doCornN) {
    const f = unit === 'lb/ac' ? 1 : 1.12085;

    cornN.forEach(rec => {
      const temp = rec.air_temperature;

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
  date.setHours(0,0,0,0);
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
          enabled: (Math.round(i / 24) === nweeks * 7) ||
                   (i === a.length - 1 && nweeks * 7 * 24 >= a.length)
        }
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
          enabled: (i / 24 === nweeks * 7) ||
                    (i === a.length - 1 && nweeks * 7 * 24 >= a.length)
        }
      });
      date.setDate(date.getDate() + 1);
    });
  }

  const max = outputN === 1 ? (biomass * N) / 100 : Math.max.apply(Math, surfaceData.map(d => d.y));
  const surfaceMin = outputN === 1 ? (biomass * N) / 100 : Math.min.apply(Math, surfaceData.map(d => d.y));
  const incorporatedMin = outputN === 1 ? (biomass * N) / 100 : Math.min.apply(Math, incorporatedData.map(d => d.y));

  const minDate = new Date(killDate);

  let labModel = '';

  if (params.get('fy')) {
    const src = `http://aesl.ces.uga.edu/mineralization/client/surface/?fy=${params.get('fy')}&lab=${params.get('lab')}&modeled2=${m2}&modeled4=${m4}&modeled=${mf}`;

    labModel = <iframe title="N/A" style={{display: 'none'}} src={src}/>
  }

  Highcharts.setOptions({
    chart: {
      animation: false
    },
    lang: {
      numericSymbols: null
    }    
  });

  const options = {
    chart: {
      height: 405
    },
    plotOptions: {
      series: {
        animation: false,
      }
    },
    tooltip: {
      shared: true,
      useHTML: true,
      formatter: function() {
        const week = Math.floor((this.x - minDate) / (24 * 3600 * 1000) / 7);
        const maxNUptake = Math.max.apply(Math, NUptake.map(n => n[1]));

        return this.points.reduce((s, point) => {
          if (point.series.name === 'Corn N uptake') {
            const pct = Math.round((point.y / maxNUptake) * 100);
            return s + '<strong>' + point.series.name + ': ' + point.y.toFixed(0) + ' ' + unit + ' (' + pct + '%)<br/></strong>';
          } else {
            return s + '<strong>' + point.series.name + ': ' + point.y.toFixed(0) + ' ' + unit + '<br/></strong>'
          }
        }, `<small>${Highcharts.dateFormat('%b %e, %Y', new Date(this.x))}</small><br/>Week ${week}<br/>`);
      }
    },
    title: {
      text: mockup === 2 ? (
              outputN === 1 && doCornN ? '<div class="caption">Cover crop N released and Corn N uptake over time.</div>' :
              outputN === 1            ? '<div class="caption">Cover crop N released over time.</div>'
                                             : '<div class="caption">Undecomposed cover crop residue mass<br/>remaining over time following its termination.</div>'
            ) : ''
    },
    series: [
      {
        name: outputN === 1 ? 'N released' : 'Residue Remaining',
        data: surfaceData,
        color: '#008837',
        showInLegend: false,
        zmarker: {
          symbol: 'url(sun.png)'
        }
      },
      {
        name: outputN === 1 ? 'N released' : 'Residue Remaining',
        data: incorporatedData,
        color: '#003788',
        showInLegend: false,
        zmarker: {
          symbol: 'url(sun.png)'
        },
        visible: doIncorporated
      },
      {
        name: 'Corn N uptake',
        data: NUptake,
        lineWidth: 1,
        color: 'orange',
        showInLegend: false
      }
    ],
    yAxis: [
      {
        title: {
          text: outputN === 1 && doCornN  ? `Cover Crop N Released (${unit})<br><div style="color: orange;">Corn N uptake (${unit})</div>` :
                outputN === 1             ? `Cover Crop N Released (${unit})` :
                                                  `Residue Remaining (${unit})`,
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#008837'
          }
        },
        min: 0,
        endOnTick: false,
        minorTicks: true,
        lineWidth: 3
      },
      {
        title: {
          text: outputN === 1 ? 'Cover Crop N Released (%)' : 'Residue Remaining (%)',
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#008837'
          }
        },
        linkedTo: 0,
        gridLineWidth: 0,
        opposite: true,
        tickPositioner: function() {
          const positions = [];
          const increment = doCornN || outputN === 2 ? 25 : 10;

          for (let tick = 0; tick <= 100; tick += increment) {
            positions.push(tick * (max / 100));
          }

          return positions;
        },        
        labels: {
          formatter: function() {
            const result = Math.round(this.value / (max / 100));
            return result + '%';
          }
        }
      },
    ],
    xAxis: [
      {
        type: 'datetime',
        title: {
          text: mockup === 1 ? (
                  outputN === 1 && doCornN ? '<div class="caption">Cover crop N released and Corn N uptake over time.</div>' :
                  outputN === 1            ? '<div class="caption">Cover crop N released over time.</div>'
                                                 : '<div class="caption">Undecomposed cover crop residue mass remaining over time following its termination.</div>'
                ) : ''
        },
        crosshair: {
          color: '#7b3294',
          dashStyle: 'dash'
        },
        tickPositioner: function() {
          const positions = [];
          const increment = 24 * 60 * 60 * 1000 * 28;

          for (let tick = this.dataMin; tick <= this.dataMax; tick += increment) {
            positions.push(tick);
          }
          return positions;
        },
        labels: {
          formatter: function() {
            const weeks = Math.round((this.value - minDate) / (24 * 3600 * 1000) / 7);
            return Highcharts.dateFormat('%b %e', new Date(this.value)) + '<br/>' +
                   weeks + ' weeks';
          },
          style: {
            fontSize: '13px'
          }
        },
        plotLines: [{
          value: new Date(plantingDate),
          color: '#7b3294',
          dashStyle: 'shortdash',
          width: 0.4,
          label: {
            useHTML: true,
            text: '<div style="background: white; transform: rotate(-90deg); position: relative; left: -50px; font-size: 1.2em;">Planting date</div>'
          }
        }],
      },
    ]
  };

  const surfaceNPredict = Math.round(model.s.MinNfromFOM.slice(-1) / factor);
  
  const incorporatedNPredict = doIncorporated && Math.round(model.i.FomCumN.slice(-1) / factor);

  const NGraph = {
    chart: {
      type: 'bar',
      height: 350,
      className: outputN === 2 ? 'hidden' : '',
    },
    title: {
      text: `<div class="caption">
               Cash crop recommended N rate<br>after accounting for cover crop N credits.
             </div>
            `,
      verticalAlign: mockup === 1 ? 'bottom' : 'top'
    },
    series: [
      /*
      {
        name: 'Target N',
        data: [+targetN, +targetN],
        color: '#666'
      },
      */
      {
        name: 'Cover Crop N credit',
        data: doIncorporated ? [+incorporatedNPredict, +surfaceNPredict] : [+surfaceNPredict],
        color: '#008837'
      },
      {
        name: 'Recommended N',
        data: doIncorporated ? [Math.max(0, targetN - incorporatedNPredict), Math.max(0, targetN - surfaceNPredict)] : [Math.max(0, targetN - surfaceNPredict)],
        color: '#7b3294',
      },
    ],
    xAxis: [{
      categories: 
        doIncorporated ? 
          [
            '<div style="text-align: left">Till&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><span style="font-size: 90%">(Incorporated)</span></div>',
            '<div style="text-align: left">No Till&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><span style="font-size: 90%">(Surface)&nbsp;&nbsp;&nbsp;&nbsp;</span></div>',
          ]
        :
          [
            '<div style="text-align: left">No Till&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><span style="font-size: 90%">(Surface)&nbsp;&nbsp;&nbsp;&nbsp;</span></div>',
          ]
      ,
      labels: {
        style: {
          fontSize: 13,
          color: 'black'
        }
      },
    }],
    yAxis: [{
      title: {
        text: ''
      },
      labels: {
        enabled: true
      },
      plotLines: [{
        value: targetN,
        label: {
          useHTML: true,
          text: doIncorporated ? 
                  `<div class="IncorporatedTargetN">Target N</div>
                   <div class="SurfaceTargetN">Target N</div>
                  `                  
                : 
                  `<div class="SurfaceOnlyTargetN">Target N</div>`
        }
      }],
    }],
    legend: {
      verticalAlign: 'top',
      symbolPadding: 0,
      useHTML: true,
      reversed: true,
      labelFormatter: function() {
        return `<div style="color: ${this.color};">${this.name}</div>`
      }
    },
    plotOptions: {
      series: {
        stacking: 'normal',
        dataLabels: {
          enabled: true,
          useHTML: true,
          formatter: function() {
            const footnote = this.y === 0 ? '<sup>*</sup>' : '';
            return `<div style="color: ${this.color}; background: white; transform: translateY(${doIncorporated ? -38 : -58}px);">${this.y} ${unit}${footnote}</div>`
          },
        },
        animation: false
      },
    },
  } // NGraph

  const residueGraph = {
    chart: {
      type: 'bar',
      height: 350,
      className: outputN === 1 ? 'hidden' : ''
    },
    title: {
      text: `<div class="caption">Cover crop residue mass remaining<br>after ${Math.floor(model.s.Date.length / (24 * 7))} weeks past termination.</div>`,
      verticalAlign: mockup === 1 ? 'bottom' : 'top'
    },
    xAxis: {
      categories: 
        doIncorporated ?
          [
            '<div style="text-align: left">Till&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><span style="font-size: 90%">(Incorporated)</span></div>',
            '<div style="text-align: left">No Till&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><span style="font-size: 90%">(Surface)&nbsp;&nbsp;&nbsp;&nbsp;</span></div>',
          ]
        :
        [
          '<div style="text-align: left">No Till&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><span style="font-size: 90%">(Surface)&nbsp;&nbsp;&nbsp;&nbsp;</span></div>',
        ]
      ,
      labels: {
        style: {
          fontSize: 13,
          color: 'black',
          step: 1
        }
      },
    },
    yAxis: {
      title: {
        text: ''
      },
      labels: {
        enabled: true
      },
    },
    legend: {
      align: 'center',
      verticalAlign: 'top',
    },
    plotOptions: {
      series: {
        stacking: 'normal',
        dataLabels: {
          enabled: true,
          format: `{y} ${unit}`,
          style: {
            textOutline: 'none',
            textAlign: 'center',
            fontSize: '0.9rem'
          }
        },
        animation: false
      }
    },
    series: [
      {
        name: 'Residue remaining',
        data: doIncorporated ? [Math.round(incorporatedMin), Math.round(surfaceMin)] : [Math.round(surfaceMin)],
        color: '#008837',
      },
    ]
  } // residueGraph

  console.error('TODO: localStorage');
/*  
  if (field) {  // TODO!!!
    if (!/Example: Grass|Example: Legume/.test(field)) {
      const clone = {...parms};
      delete clone.model;

      console.log(parms);
      localStorage.setItem(field, JSON.stringify(clone));
    }
  }
*/
  const cols = ['FOM', 'Carb', 'Cell', 'Lign', 'FON', 'CarbN', 'CellN', 'LigninN', 'RMTFAC', 'CNRF', 'ContactFactor', 'Rain', 'Temp', 'RH', 'Air_MPa', 'LitterMPa'];

  const csv = 'Date,' + cols + '\n' + dates.map((date, i) => date + ',' + cols.map(col => model.s[col][i])).join('\n');

  const summary = 
    <div className="inputs" style={{borderTop: mockup === 1 ? '1px solid #bbb' : 'none', paddingTop: mockup === 1 ? '1em' : 'none'}}>
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
      week{nweeks > 1 ? 's' : ''} after cover crop termination, 
      {outputN === 1 ? ' cumulative N released ' : ' undecomposed residue mass remaining '}
      is:
      <ul>
        <li><strong>{Math.round(surfaceData[Math.min(nweeks * 7, surfaceData.length - 1)].y)}</strong> {unit} for surface residues.</li>
        {
          doIncorporated &&
          <li>{Math.round(incorporatedData[Math.min(nweeks * 7, incorporatedData.length - 1)].y)} {unit} for incorporated residues.</li>
        }
        
      </ul>
    </div>

  return (
    <>
      <div id="Output" className="mockup">
        {labModel}
        <CSVLink data={csv} className="download">Download</CSVLink>

        <div style={{display: 'none'}}>
          Mockup: &nbsp;
          <button
          className={mockup === 1 ? 'selected' : ''}
          onClick={() => dispatch(set.mockup(1))}
          >
            1
          </button>
          <button
          className={mockup === 2 ? 'selected' : ''}
          onClick={() => dispatch(set.mockup(2))}
          >
            2
          </button>
        </div>

        <table style={{width: '100%'}}>
          <tbody>
            <tr>
              <td>
                <div>
                  <div className="inputs">
                    <table 
                      className="coverCropSummary"
                      style={{width: '100%', textAlign: 'center', borderBottom: '1px solid #888'}}
                    >
                      <tbody>
                        <tr>
                          <td>
                            <u>Field name</u><br/>
                            (<strong>{field}</strong>)
                            <p></p>
                            <u>Species</u><br/>
                            (<strong>{coverCrop.map((crop, i, a) => <span key={crop}>{crop}{i < a.length - 1 ? <br/> : ''}</span>)}</strong>)
                            <p></p>
                            <u>Termination Date</u><br/>
                            (<strong>{moment(killDate).format('MMM D, yyyy')}</strong>)
                            <p></p>
                            <u>Dry Biomass</u><br/>
                            (<strong>{(+biomass).toFixed(0)} {unit}</strong>)
                          </td>
                          <td>
                            <u>Residue N Content</u><br/>
                            (<strong>{((biomass * N) / 100).toFixed(0)} {unit}</strong>)
                            <p></p>
                            <u>Carbohydrates</u><br/>
                            (<strong>{carb.toFixed(0)} %</strong>)
                            <p></p>
                            <u>Holo-cellulose</u><br/>
                            (<strong>{cell.toFixed(0)} %</strong>)
                            <p></p>
                            <u>Lignin</u><br/>
                            (<strong>{lign.toFixed(0)} %</strong>)
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <HighchartsReact highcharts={Highcharts} options={NGraph} className="hidden" />
                {(outputN === 1 && targetN < surfaceNPredict) && <div class="footnote">* Your cover crop is supplying all of your needs.</div>}
                <HighchartsReact highcharts={Highcharts} options={residueGraph} />
              </td>
              <td>
                <div className="output center" style={{marginBottom: '1em'}}>
                  <button
                    className={outputN === 1 ? 'selected' : ''}
                    onClick={() => dispatch(set.outputN(1))}
                  >
                    N RELEASED
                  </button>
                  
                  <button
                    className={outputN === 2 ? 'selected' : ''}
                    onClick={() => dispatch(set.outputN(2))}
                  >
                    RESIDUE REMAINING
                  </button>
                </div>
                
                {mockup === 2 && summary}

                <HighchartsReact highcharts={Highcharts} options={options}/>
                
                {mockup === 1 && summary}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="bn">
        <Link className="link" to={'/cashcrop'} >BACK</Link>
        <Link className="link" to={'/advanced'} >ADVANCED</Link>
        <Link className="link" to={'/feedback'} >FEEDBACK</Link>
      </div>
    </>
  )
} // Output

export default Output;