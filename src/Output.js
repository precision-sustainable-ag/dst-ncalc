import React from 'react';

import Highcharts from 'highcharts';

import HighchartsReact from 'highcharts-react-official';

import transpile from './Transpiler.js';

import moment from 'moment';

import { CSVLink } from "react-csv";

const Output = ({ps, parms, sets, setScreen}) => {
  if (!parms.biomass || !parms.N || !parms.carb || !parms.cell || !parms.lign || !parms.lwc || !parms.BD || !parms.InorganicN || !parms.weather.length) {
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
  // alert('output')
  const total = +parms.carb + +parms.cell + +parms.lign;
  const carb = parms.carb * 100 / total;
  const cell = parms.cell * 100 / total;
  const lign = parms.lign * 100 / total;
  const factor = parms.unit === 'lb/ac' ? 1.12085 : 1;

  const model = transpile({
    FOMkg: parms.biomass * factor,
    FOMpctN: +parms.N,
    FOMpctCarb: carb,
    FOMpctCell: cell,
    FOMpctLign: lign,
    LitterWaterContent: +parms.lwc,
    BD: +parms.BD,
    INppm: +parms.InorganicN,
    hours: parms.weather.length,
    stop:  parms.weather.length,
    temp: parms.weather.map(d => d.air_temperature),
    RH: parms.weather.map(d => d.relative_humidity * 100),
    rain: parms.weather.map(d => d.precipitation),
  });
  console.log(model);

  const d1 = new Date(parms.plantingDate);
  let dailyTotal = 0;
  let gdd = 0;
  // const NUptake = [[+parms.plantingDate, 0]];
  const NUptake = [];

  const cornN = parms.cashCrop === 'Corn' && parms.outputN === 1;
  if (cornN) {
    const f = parms.unit === 'lb/ac' ? 1 : 1.12085;

    parms.weather.slice((parms.plantingDate - parms.killDate) / (1000 * 60 * 60)).forEach(d => {
      dailyTotal += d.air_temperature - 8;
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
  
  const data = [];

  model[parms.outputN === 1 ? 'MinNfromFOM' : 'FOM'].forEach((d, i, a) => {
    const value = +(d / factor).toFixed(2)
    if (date.getHours() === 0) {
      data.push({
        x: +date,
        y: +value,
        marker: {
          radius: 5,
          fillColor: 'blue',
          enabled: (i / 24 === parms.nweeks * 7) ||
                   (i === a.length - 1 && parms.nweeks * 7 * 24 >= a.length)
        }
      });
    }
    date.setHours(date.getHours() + 1)
  });

  const max = parms.outputN === 1 ? (parms.biomass * parms.N) / 100 : Math.max.apply(Math, data.map(d => d.y));
  const min = parms.outputN === 1 ? (parms.biomass * parms.N) / 100 : Math.min.apply(Math, data.map(d => d.y));

  const minDate = Math.min.apply(Math, data.map(d => d.x));

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

        return this.points.reduce((s, point) => (
          s + '<strong>' + point.series.name + ': ' + point.y.toFixed(0) + ' ' + parms.unit + '<br/></strong>'
        ), `<small>${Highcharts.dateFormat('%b %e, %Y', new Date(this.x))}</small><br/>Week ${week}<br/>`);
      }
    },
    title: {
      text: ''
    },
    series: [
      {
        name: parms.outputN === 1 ? 'N released' : 'Residue Remaining',
        data: data,
        color: '#6B9333',
        showInLegend: false,
        zmarker: {
          symbol: 'url(sun.png)'
        }
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
            color: '#6B9333'
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
            color: '#6B9333'
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
          color: 'green',
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
          color: 'green',
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

  const NPredict = Math.round(model.MinNfromFOM.slice(-1) / factor);
//  console.log(model.Temp.map(t => t.toFixed(2)));
  const NGraph = {
    chart: {
      type: 'bar',
      height: 350,
      zmarginRight: 40,
      className: parms.outputN === 2 && 'hidden'
    },
    title: {
      text: '<div class="caption">Cash crop recommended N rate<br>after accounting for cover crop N credits.</div>',
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
        data: [+NPredict, +NPredict],
        color: '#6B9333'
      },
      {
        name: 'Recommended N',
        data: [Math.max(0, parms.targetN - NPredict), Math.max(0, parms.targetN - NPredict)],
        color: 'brown'
      },
    ],
    xAxis: [{
      categories: ['Incorporated', 'Surface'],
      labels: {
        style: {
          fontSize: 13
        }
      },
    }],
    yAxis: [{
      title: {
        text: ''
      },
      labels: {
        enabled: false
      },
      plotLines: [{
        value: parms.targetN,
        color: 'blue',
        width: 2,
        label: {
          useHTML: true,
          text: '<div style="background: white; transform: rotate(-90deg); position: relative; left: -40px; font-size: 1em; color: blue">Target N</div>'
        }
      }],
  
    }],
    legend: {
      verticalAlign: 'top',
      align: 'right',
      itemDistance: -260,  // hack to reverse legend items
      symbolPadding: 0,
      useHTML: true,
      labelFormatter: function() {
        return `<div style="color: ${this.color};">${this.name}</div>`
      }
    },
    plotOptions: {
      series: {
        stacking: 'normal',
        zpointWidth: 22,
        zpointPadding: 0.5,
        zgroupPadding: 0.5,
        dataLabels: {
          enabled: true,
          useHTML: true,
          formatter: function() {
            return `<div style="color: ${this.color}; background: white; transform: translateY(-35px);">${this.y} ${parms.unit}</div>`
          },
          zcolor: 'green',
        },
        animation: false
      }
    },
  } // NGraph

  const residueGraph = {
    chart: {
      type: 'column',
      className: parms.outputN === 1 && 'hidden'
    },
    title: {
      text: ''
    },
    xAxis: {
      categories: ['Incorporated', 'Surface'],
      title: {
        text: `<div class="caption">Cover crop residue mass remaining<br>after ${Math.floor(parms.weather.length / (24 * 7))} weeks past termination.</div>`
      }
    },
    yAxis: {
      title: {
        text: ''
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
        data: [Math.round(min * 1.3), Math.round(min)],
        color: '#6B9333',
      },
    ]
  } // residueGraph

  const dec = {};

  Object.keys(model).forEach(parm => {
    const max = isFinite(model[parm][1]) ? Math.max.apply(Math, model[parm].filter(v => isFinite(v))) : model[parm];

    dec[parm] = Math.abs(max) > 100  ? 0 :
                Math.abs(max) > 10   ? 1 :
                Math.abs(max) > 0    ? 2 :
                Math.abs(max) > 0.1  ? 3 :
                Math.abs(max) > 0.01 ? 4 :
                                       5;
  });

//  const col = ['BD', 'RH', 'Rain', 'Temp', 'FOM', 'FON', 'Carb', 'Cell', 'Lign', '%_lignin', 'a', 'Air_MPa', 'b', 'BD', 'c', 'Carb0', 'CarbK', 'CarbN', 'CellK', 'CellN', 'CNR', 'CNRF', 'ContactFactor', 'Critical_FOM', 'DeCarb', 'DeCell', 'DeLign', 'Depth_in', 'Depth_layer_cm', 'Dew', 'Dminr', 'Evaporation', 'FAC', 'FOMNhum', 'FromAir', 'FromDew', 'FromRain', 'GRCom', 'GRCom1', 'GRCom2', 'GRCom3', 'GRNom', 'GrNom1', 'GRNom2', 'GRNOm3', 'Hum', 'HumMin', 'HumN', 'InitialFOMN_kg/ha', 'INkg', 'INppm', 'k_4', 'k1', 'k3', 'LigninN', 'LignK', 'Litter_MPa_Gradient', 'LitterMPa', 'LitterWaterContent', 'MinFromFOMRate', 'MinFromHumRate', 'MinNfromFOM', 'MinNfromHum', 'NAllocationFactor', 'NetMin', 'NImmobFromFOM', 'NimmobIntoCarbN', 'Noname_1', 'Noname_2', 'PMNhotKCl', 'PrevLitWC', 'PrevRH', 'RainToGetCurrentWC', 'Resistant', 'RHChange', 'RhMin', 'RMTFAC', 'RNAC', 'Sat', 'SOCpct', 'WaterLossFromEvap', 'WCFromRain'].slice(0, 8);

  if (parms.field) {
    const clone = {...parms};
    clone.weather = {};
    localStorage.setItem(parms.field, JSON.stringify(clone));
  }

  const cols = Object.keys(model).sort((a, b) => a.toUpperCase().localeCompare(b.toUpperCase()));

  cols.filter(col => !model[col].length).forEach(col => {
    model[col] = new Array(model.Rain.length).fill(model[col]);
  });

  const csv = 'Time,' + cols + '\n' + model.Rain.map((_, i) => i + ',' + cols.map(col => model[col][i])).join('\n');
//  alert(csv);

  return (
    <div id="Output">
      <CSVLink data={csv} className="download">Download</CSVLink>

      <table style={{width: '100%'}}>
        <tbody>
          <tr>
            <td>
              <p><strong>Cover crop summary</strong></p>
              <div className="inputs">
                <table 
                  className="coverCropSummary"
                  style={{marginTop: '1em', width: '100%'}}
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
                              <td>Cover Crop Species</td>
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
                              <td>Cellulose</td>
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
              <HighchartsReact highcharts={Highcharts} options={NGraph}       className="hidden" />
              <HighchartsReact highcharts={Highcharts} options={residueGraph} />
            </td>
            <td>
              <div className="output center" style={{marginBottom: '1em'}}>
                <button
                  className={parms.outputN === 1 ? 'selected' : ''}
                  onClick={() => sets.outputN(1)}
                >
                  N RELEASED
                </button>
                
                <button
                  className={parms.outputN === 2 ? 'selected' : ''}
                  onClick={() => sets.outputN(2)}
                >
                  RESIDUE REMAINING
                </button>
              </div>
              <HighchartsReact highcharts={Highcharts} options={options}/>
              
              <div className="inputs" style={{borderTop: '1px solid #bbb', paddingTop: '1em'}}>
                By
                &nbsp;
                <select
                  {...ps('nweeks')}
                  onChange={() => 'prevent warning'}
                >
                  {
                    Array(Math.round(parms.weather.length / 24 / 7)).fill().map((_, i) => <option key={i + 1}>{i + 1}</option>)
                  }
                </select>
                &nbsp;
                week{parms.nweeks > 1 ? 's' : ''} after cover crop termination, 
                {parms.outputN === 1 ? ' cumulative N released ' : ' undecomposed residue mass remaining '}
                is:
                <ul>
                  <li>{Math.round(data[Math.min(parms.nweeks * 7, data.length - 1)].y)} {parms.unit} for surface residues.</li>
                  <li>{Math.round(data[Math.min(parms.nweeks * 7, data.length - 1)].y)} {parms.unit} for incorporated residues.</li>
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