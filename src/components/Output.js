import React from 'react';

import Highcharts from 'highcharts';

import HighchartsReact from 'highcharts-react-official';

import moment from 'moment';

import { CSVLink } from "react-csv";

const Output = ({props, parms, set, setScreen}) => {
  const doIncorporated = false;

  console.log({
    gotModel: parms.gotModel
  });

  if (!parms.gotModel || !parms.model || !parms.biomass || !parms.N || !parms.carb || !parms.cell || !parms.lign || !parms.lwc || !parms.BD || !parms.InorganicN) {
    return (
      <div className="loading">
        <p>Loading Output</p>
        <p>Please wait</p>
        <span></span>
        <span></span>
        <span></span>
      </div>
    );
  }

  Object.keys(parms.model.s).forEach(key => {
    if (!/^(Temp|MinNfromFOM|FOM|Date|Rain)$/.test(key)) {
      // delete parms.model.s[key];
    }
  });

  console.log(parms.model.s);

  const total = +parms.carb + +parms.cell + +parms.lign;
  const carb = parms.carb * 100 / total;
  const cell = parms.cell * 100 / total;
  const lign = parms.lign * 100 / total;
  const factor = parms.unit === 'lb/ac' ? 1.12085 : 1;

  const model = parms.model;

  const d1 = new Date(parms.plantingDate);
  let dailyTotal = 0;
  let gdd = 0;
  // const NUptake = [[+parms.plantingDate, 0]];
  const NUptake = [];

  const cornN = parms.cashCrop === 'Corn' && parms.outputN === 1;
  if (cornN) {
    const f = parms.unit === 'lb/ac' ? 1 : 1.12085;

    parms.model.s.Temp.slice((parms.plantingDate - parms.killDate) / (1000 * 60 * 60)).forEach(temp => {
      dailyTotal += temp - 8;
      if (d1.getHours() === 0) {
        gdd += (dailyTotal / 24);
        NUptake.push([
          // d1 - (1000 * 60 * 60 * 24),
          +d1,
          (parms.yield * 1.09) / (1 + Math.exp((-0.00615 * (gdd - 646.19)))) * f
        ]);
        dailyTotal = 0;
      }
      d1.setHours(d1.getHours() + 1);
    });
  }

  let date = new Date(parms.killDate);
  const surfaceData = [];

  model.s[parms.outputN === 1 ? 'MinNfromFOM' : 'FOM'].forEach((d, i, a) => {
    const value = +(d / factor).toFixed(2);
    if (date.getHours() === 0) {
      surfaceData.push({
        x: +date,
        y: +value,
        marker: {
          radius: 5,
          fillColor: '#008837',
          enabled: (i / 24 === parms.nweeks * 7) ||
                   (i === a.length - 1 && parms.nweeks * 7 * 24 >= a.length)
        }
      });
    }
    date.setHours(date.getHours() + 1);
  });

  date = new Date(parms.killDate);
  const incorporatedData = [];

  if (doIncorporated) {
    model.i[parms.outputN === 1 ? 'FomCumN' : 'FOM'].forEach((d, i, a) => {
      const value = +(d / factor).toFixed(2);
      incorporatedData.push({
        x: +date,
        y: +value,
        marker: {
          radius: 5,
          fillColor: '#008837',
          enabled: (i / 24 === parms.nweeks * 7) ||
                    (i === a.length - 1 && parms.nweeks * 7 * 24 >= a.length)
        }
      });
      date.setDate(date.getDate() + 1);
    });
  }

  const max = parms.outputN === 1 ? (parms.biomass * parms.N) / 100 : Math.max.apply(Math, surfaceData.map(d => d.y));
  const surfaceMin = parms.outputN === 1 ? (parms.biomass * parms.N) / 100 : Math.min.apply(Math, surfaceData.map(d => d.y));
  const incorporatedMin = parms.outputN === 1 ? (parms.biomass * parms.N) / 100 : Math.min.apply(Math, incorporatedData.map(d => d.y));

  const minDate = +parms.killDate;

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
            return s + '<strong>' + point.series.name + ': ' + point.y.toFixed(0) + ' ' + parms.unit + ' (' + pct + '%)<br/></strong>';
          } else {
            return s + '<strong>' + point.series.name + ': ' + point.y.toFixed(0) + ' ' + parms.unit + '<br/></strong>'
          }
        }, `<small>${Highcharts.dateFormat('%b %e, %Y', new Date(this.x))}</small><br/>Week ${week}<br/>`);
      }
    },
    title: {
      text: ''
    },
    series: [
      {
        name: parms.outputN === 1 ? 'N released' : 'Residue Remaining',
        data: surfaceData,
        color: '#008837',
        showInLegend: false,
        zmarker: {
          symbol: 'url(sun.png)'
        }
      },
      {
        name: parms.outputN === 1 ? 'N released' : 'Residue Remaining',
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
          text: parms.outputN === 1 && cornN  ? `Cover Crop N Released (${parms.unit})<br><div style="color: orange;">Corn N uptake (${parms.unit})</div>` :
                parms.outputN === 1           ? `Cover Crop N Released (${parms.unit})` :
                                                `Residue Remaining (${parms.unit})`,
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
          text: parms.outputN === 1 ? 'Cover Crop N Released (%)' : 'Residue Remaining (%)',
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
          const increment = cornN || parms.outputN === 2 ? 25 : 10;

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
          text: parms.outputN === 1 && cornN ? '<div class="caption">Cover crop N released and Corn N uptake over time.</div>' :
                parms.outputN === 1          ? '<div class="caption">Cover crop N released over time.</div>'
                                             : '<div class="caption">Undecomposed cover crop residue mass remaining over time following its termination.</div>'
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
          value: new Date(parms.plantingDate),
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
      className: parms.outputN === 2 ? 'hidden' : '',
    },
    title: {
      text: `<div class="caption">
               Cash crop recommended N rate<br>after accounting for cover crop N credits.
             </div>
            `,
      verticalAlign: 'bottom'
    },
    series: [
      /*
      {
        name: 'Target N',
        data: [+parms.targetN, +parms.targetN],
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
        data: doIncorporated ? [Math.max(0, parms.targetN - incorporatedNPredict), Math.max(0, parms.targetN - surfaceNPredict)] : [Math.max(0, parms.targetN - surfaceNPredict)],
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
        value: parms.targetN,
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
            return `<div style="color: ${this.color}; background: white; transform: translateY(${doIncorporated ? -38 : -58}px);">${this.y} ${parms.unit}${footnote}</div>`
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
      className: parms.outputN === 1 ? 'hidden' : ''
    },
    title: {
      text: `<div class="caption">Cover crop residue mass remaining<br>after ${Math.floor(parms.model.s.Date.length / (24 * 7))} weeks past termination.</div>`,
      verticalAlign: 'bottom'
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
          format: `{y} ${parms.unit}`,
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

  if (parms.field) {
    const clone = {...parms};
    delete clone.model;

    console.log(clone);
    localStorage.setItem(parms.field, JSON.stringify(clone));
  }

  const cols = Object.keys(model.s).sort((a, b) => a.toUpperCase().localeCompare(b.toUpperCase()));

  const csv = 'Time,' + cols + '\n' + model.s.Rain.map((_, i) => i + ',' + cols.map(col => model.s[col][i])).join('\n');
//  alert(csv);

  return (
    <div id="Output" zclassName="mockup">
      <CSVLink data={csv} className="download">Download</CSVLink>
      { /*
      Mockup: &nbsp;
      <button
       className={parms.mockup === 1 ? 'selected' : ''}
       onClick={() => set.mockup(1)}
      >
        1
      </button>
      <button
       className={parms.mockup === 2 ? 'selected' : ''}
       onClick={() => set.mockup(2)}
      >
        2
      </button>
      <button
       className={parms.mockup === 3 ? 'selected' : ''}
       onClick={() => set.mockup(3)}
      >
        3
      </button>
      <button
       className={parms.mockup === 4 ? 'selected' : ''}
       onClick={() => set.mockup(4)}
      >
        4
      </button>
      <button
       className={parms.mockup === 5 ? 'selected' : ''}
       onClick={() => set.mockup(5)}
      >
        5
      </button>
      */}
      <table style={{width: '100%'}}>
        <tbody>
          <tr>
            <td className={'mockup' + parms.mockup} >
              <div className="mockup1" >
                <p><strong>Cover crop summary</strong></p>
                <div className="inputs">
                  <table 
                    className="coverCropSummary"
                    style={{width: '100%'}}
                  >
                    <tbody>
                      <tr>
                        <td>
                          <table>
                            <tbody>
                              <tr>
                                <td>Field name</td>
                                <td>{parms.field}</td>
                              </tr>
                              <tr>
                                <td>Species</td>
                                <td>{parms.coverCrop.map(crop => <div key={crop}>{crop}</div>)}</td>
                              </tr>
                              <tr>
                                <td>Termination Date</td>
                                <td>{moment(parms.killDate).format('MMM D, yyyy')}</td>
                              </tr>
                              <tr>
                                <td>Dry Biomass</td>
                                <td>{(+parms.biomass).toFixed(0)} {parms.unit}</td>
                              </tr>
                              <tr>
                                <td>Residue N Content</td>
                                <td>{((parms.biomass * parms.N) / 100).toFixed(0)} {parms.unit}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td>
                          <table style={{border: '1px solid #bbb', height: '100%'}}>
                            <tbody>
                              <tr>
                                <th colSpan="3">Residue quality</th>
                              </tr>
                              <tr>
                                <td>Carbohydrates</td>
                                <td style={{textAlign: 'right'}}>{carb.toFixed(0)} %</td>
                              </tr>
                              <tr>
                                <td>Holo-cellulose</td>
                                <td style={{textAlign: 'right'}}>{cell.toFixed(0)} %</td>
                              </tr>
                              <tr>
                                <td>Lignin</td>
                                <td style={{textAlign: 'right'}}>{lign.toFixed(0)} %</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <hr/>
                  <div className="percent" style={{display: 'none', width: '500px', color: '#eee'}}>
                    <div style={{width: (carb / total) * 100 - 1 + '%', background: '#385E1B'}}>
                      {carb.toFixed(0)}
                    </div>
                    <div style={{width: (cell / total) * 100 - 1 + '%', background: '#8EB644'}}>
                      {cell.toFixed(0)}
                    </div>
                    <div style={{width: (lign / total) * 100 - 1 + '%', background: '#543608'}}>
                      {lign.toFixed(0)}
                    </div>

                    <div style={{textAlign: 'left', width: (carb / total) * 100 - 1 + '%', color: '#385E1B'}}>
                      Carb
                    </div>
                    <div style={{textAlign: 'left', width: (cell / total) * 100 - 1 + '%', color: '#8EB644'}}>
                      Cell
                    </div>
                    <div style={{textAlign: 'left', width: (lign / total) * 100 - 1 + '%', color: '#543608'}}>
                      Lign
                    </div>
                  </div>
                </div>
              </div>

              <div className="mockup2" >
                <div className="inputs">
                  <table 
                    className="coverCropSummary"
                    style={{width: '100%', textAlign: 'center', borderBottom: '1px solid #888'}}
                  >
                    <tbody>
                      <tr>
                        <td>
                          <u>Field name</u><br/>
                          (<strong>{parms.field}</strong>)
                          <p></p>
                          <u>Species</u><br/>
                          (<strong>{parms.coverCrop.map((crop, i, a) => <span key={crop}>{crop}{i < a.length - 1 ? <br/> : ''}</span>)}</strong>)
                          <p></p>
                          <u>Termination Date</u><br/>
                          (<strong>{moment(parms.killDate).format('MMM D, yyyy')}</strong>)
                          <p></p>
                          <u>Dry Biomass</u><br/>
                          (<strong>{(+parms.biomass).toFixed(0)} {parms.unit}</strong>)
                        </td>
                        <td>
                          <u>Residue N Content</u><br/>
                          (<strong>{((parms.biomass * parms.N) / 100).toFixed(0)} {parms.unit}</strong>)
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

              <div className="mockup3" >
                <div className="inputs">
                  <table 
                    className="coverCropSummary"
                    style={{width: '100%', borderBottom: '1px solid #888'}}
                  >
                    <tbody>
                      <tr>
                        <td>Field name</td>
                        <td colSpan="2">
                          <strong>{parms.field}</strong>
                        </td>
                      </tr>

                      <tr>
                        <td>Species</td>
                        <td colSpan="2">
                          <strong>{parms.coverCrop.map(crop => <div key={crop}>{crop}</div>)}</strong>
                        </td>
                      </tr>

                      <tr>
                        <td>Termination Date</td>
                        <td><strong>{moment(parms.killDate).format('MMM D, yyyy')}</strong></td>
                        <td style={{paddingLeft: '0.5em'}}>Carbohydrates</td>
                        <td><strong>{carb.toFixed(0)} %</strong></td>
                      </tr>

                      <tr>
                        <td>Dry Biomass</td>
                        <td><strong>{(+parms.biomass).toFixed(0)} {parms.unit}</strong></td>
                        <td style={{paddingLeft: '0.5em'}}>Holo-cellulose</td>
                        <td><strong>{cell.toFixed(0)} %</strong></td>
                      </tr>
                          
                      <tr>
                        <td>Residue N Content</td>
                        <td><strong>{((parms.biomass * parms.N) / 100).toFixed(0)} {parms.unit}</strong></td>
                        <td style={{paddingLeft: '0.5em'}}>Lignin</td>
                        <td><strong>{lign.toFixed(0)} %</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mockup4" >
                <div className="inputs">
                  <table 
                    className="coverCropSummary"
                    style={{width: '100%', borderBottom: '1px solid #888'}}
                  >
                    <tbody>
                      <tr>
                        <td>Field name</td>
                        <td colSpan="2">
                          <strong>{parms.field}</strong>
                        </td>
                      </tr>

                      <tr>
                        <td>Species</td>
                        <td colSpan="2">
                          <strong>{parms.coverCrop.map(crop => <div key={crop}>{crop}</div>)}</strong>
                        </td>
                      </tr>

                      <tr>
                        <td>Termination Date</td>
                        <td><strong>{moment(parms.killDate).format('MMM D, yyyy')}</strong></td>
                        <td style={{borderLeft: '1px solid #ccc', paddingLeft: '0.5em'}}>Carbohydrates</td>
                        <td><strong>{carb.toFixed(0)} %</strong></td>
                      </tr>

                      <tr>
                        <td>Dry Biomass</td>
                        <td><strong>{(+parms.biomass).toFixed(0)} {parms.unit}</strong></td>
                        <td style={{borderLeft: '1px solid #ccc', paddingLeft: '0.5em'}}>Holo-cellulose</td>
                        <td><strong>{cell.toFixed(0)} %</strong></td>
                      </tr>
                          
                      <tr>
                        <td>Residue N Content</td>
                        <td><strong>{((parms.biomass * parms.N) / 100).toFixed(0)} {parms.unit}</strong></td>
                        <td style={{borderLeft: '1px solid #ccc', paddingLeft: '0.5em'}}>Lignin</td>
                        <td><strong>{lign.toFixed(0)} %</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mockup5" >
                <div className="inputs">
                  <table 
                    className="coverCropSummary"
                    style={{width: '100%', borderBottom: '1px solid #888'}}
                  >
                    <tbody>
                      <tr>
                        <td>Field name</td>
                        <td colSpan="2">
                          <strong>{parms.field}</strong>
                        </td>
                      </tr>

                      <tr>
                        <td>Species</td>
                        <td colSpan="2">
                          <strong>{parms.coverCrop.map(crop => <div key={crop}>{crop}</div>)}</strong>
                        </td>
                      </tr>

                      <tr>
                        <td>Termination Date</td>
                        <td><strong>{moment(parms.killDate).format('MMM D, yyyy')}</strong></td>
                        <td style={{borderTop: '1px solid #ccc', borderLeft: '1px solid #ccc', paddingLeft: '0.5em'}}>Carbohydrates</td>
                        <td style={{borderTop: '1px solid #ccc'}}><strong>{carb.toFixed(0)} %</strong></td>
                      </tr>

                      <tr>
                        <td>Dry Biomass</td>
                        <td><strong>{(+parms.biomass).toFixed(0)} {parms.unit}</strong></td>
                        <td style={{borderLeft: '1px solid #ccc', paddingLeft: '0.5em'}}>Holo-cellulose</td>
                        <td><strong>{cell.toFixed(0)} %</strong></td>
                      </tr>
                          
                      <tr>
                        <td>Residue N Content</td>
                        <td><strong>{((parms.biomass * parms.N) / 100).toFixed(0)} {parms.unit}</strong></td>
                        <td style={{borderLeft: '1px solid #ccc', paddingLeft: '0.5em'}}>Lignin</td>
                        <td><strong>{lign.toFixed(0)} %</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <HighchartsReact highcharts={Highcharts} options={NGraph} className="hidden" />
              {(parms.outputN === 1 && parms.targetN < surfaceNPredict) && <div class="footnote">* Your cover crop is supplying all of your needs.</div>}
              <HighchartsReact highcharts={Highcharts} options={residueGraph} />
            </td>
            <td>
              <div className="output center" style={{marginBottom: '1em'}}>
                <button
                  className={parms.outputN === 1 ? 'selected' : ''}
                  onClick={() => set.outputN(1)}
                >
                  N RELEASED
                </button>
                
                <button
                  className={parms.outputN === 2 ? 'selected' : ''}
                  onClick={() => set.outputN(2)}
                >
                  RESIDUE REMAINING
                </button>
              </div>
              <HighchartsReact highcharts={Highcharts} options={options}/>
              
              <div className="inputs" style={{borderTop: '1px solid #bbb', paddingTop: '1em'}}>
                By
                &nbsp;
                <select
                  {...props('nweeks')}
                  onChange={(e) => set.nweeks(e.target.value)}
                >
                  {
                    Array(Math.round(parms.model.s.Date.length / 24 / 7)).fill().map((_, i) => <option key={i + 1}>{i + 1}</option>)
                  }
                </select>
                &nbsp;
                week{parms.nweeks > 1 ? 's' : ''} after cover crop termination, 
                {parms.outputN === 1 ? ' cumulative N released ' : ' undecomposed residue mass remaining '}
                is:
                <ul>
                  <li>{Math.round(surfaceData[Math.min(parms.nweeks * 7, surfaceData.length - 1)].y)} {parms.unit} for surface residues.</li>
                  {
                    doIncorporated &&
                    <li>{Math.round(incorporatedData[Math.min(parms.nweeks * 7, incorporatedData.length - 1)].y)} {parms.unit} for incorporated residues.</li>
                  }
                  
                </ul>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="bn">
        <button onClick={() => setScreen('CashCrop')}>BACK</button>
        <button onClick={() => setScreen('Advanced')}>ADVANCED</button>
      </div>
    </div>
  )
} // Output

export default Output;