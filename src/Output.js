import React from 'react';

import Highcharts from 'highcharts';

import HighchartsReact from 'highcharts-react-official';

import transpile from './Transpiler.js';

import moment from 'moment';

const Output1 = ({parms, sets, setScreen}) => {  // OBSOLETE
  return (
    <>
      <h1>Where is the cover crop residue located?</h1>
      <p>Select your preferred output, then click "next".</p>

      <div className="inputs">
        <p>
          <label>
            <input
              type="radio" name="residue" id="residue"
              value="surface"
              checked={parms.residue === 'surface'} 
              onChange={() => sets.residue('surface')}
            />
            Soil Surface
          </label>
        </p>

        <p>
          <label>
            <input
              type="radio" name="residue" id="residue"
              value="incorporated"
              checked={parms.residue === 'incorporated'} 
              onChange={() => sets.residue('incorporated')}
            />
            Incorporated
          </label>
        </p>

        <p>
          <label>
            <input
              type="radio" name="residue" id="residue"
              value="compare"
              checked={parms.residue === 'compare'} 
              onChange={() => sets.residue('compare')}
            />
            Compare
          </label>
        </p>
      </div>

      <div className="bn">
        <button onClick={() => setScreen('CoverCrop3')}>BACK</button>
        <button onClick={() => setScreen('Output2')}>NEXT</button>
      </div>

    </>
  )
} // Output1

const Output2 = ({ps, parms, sets, setScreen}) => {
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

  const total = parms.carb + parms.cell + parms.lign;

  const model = transpile({
    FOMkg: parms.biomass * 1.12085,
    FOMpctN: +parms.N,
    FOMpctCarb: +parms.carb,
    FOMpctCell: +parms.cell,
    FOMpctLign: +parms.lign,
    LitterWaterContent: +parms.lwc,
    BD: +parms.BD,
    INppm: +parms.InorganicN,
    hours: parms.weather.length,
    stop:  parms.weather.length,
    temp: parms.weather.map(d => d.air_temperature),
    RH: parms.weather.map(d => d.relative_humidity * 100),
    rain: parms.weather.map(d => d.precipitation),
  });

  const d1 = new Date(parms.plantingDate);
  let dailyTotal = 0;
  let gdd = 0;
  // const NUptake = [[+parms.plantingDate, 0]];
  const NUptake = [];

  const cornN = parms.cashCrop === 'Corn' && parms.outputN === 1;
  if (cornN) {
    parms.weather.slice((parms.plantingDate - parms.killDate) / (1000 * 60 * 60)).forEach(d => {
      dailyTotal += d.air_temperature - 8;
      if (d1.getHours() === 23) {
        gdd += (dailyTotal / 24);
        NUptake.push([
          // d1 - (1000 * 60 * 60 * 24),
          +d1,
          (parms.yield * 1.09) / (1 + Math.exp((-0.00615 * (gdd - 646.19)) ))
        ]);
        dailyTotal = 0;
      }
      d1.setHours(d1.getHours() + 1)
    });
  }

  let date = new Date(parms.killDate);
  
  const data = [];

  model[parms.outputN === 1 ? 'MinNfromFOM' : 'FOM'].forEach((d, i) => {
    date.setTime(date.getTime() + (60 * 60 * 1000));
    const value = +(d / 1.12085).toFixed(2)
    
    data.push([+date, +value]);
  });

  const max = parms.outputN === 1 ? (parms.biomass * parms.N) / 100 : Math.max.apply(Math, data.map(d => d[1]));

  const minDate = Math.min.apply(Math, data.map(d => d[0]));

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
      events: {
        /*
          Linking the secondary axis to the primary axis causes strange percentages, like 0%, 8%, 15%, 23%, ...
          This code gives the percentages in multiples of 5, 10, 20, or 25.
          Maybe there's a better way of doing this.
        */
        render: function() {
          const labels = document.querySelectorAll('.highcharts-yaxis-labels')[1].childNodes;
          const slope = (labels[labels.length - 1].getAttribute('y') - labels[0].getAttribute('y')) / labels[labels.length - 1].innerHTML;
          const intercept = +labels[0].getAttribute('y');
          const minY = +labels[labels.length - 1].getAttribute('y');
          const maxPercent = labels[labels.length - 1].innerHTML;
          const delta = maxPercent > 100 ? 25 :
                        maxPercent >  75 ? 20 :
                        maxPercent >  50 ? 10 :
                                           5;

          labels.forEach((label, i) => {
            const y = i * delta * slope + intercept;
            
            if (i * delta > 100 || y < minY) {
              label.innerHTML = '';
            } else {
              label.setAttribute('y', y);
              label.innerHTML = i * delta + '%';
            }
          })
        }
      },
    },
    credits: {
      enabled: false
    },
    legend: {
      align: 'right',
      verticalAlign: 'top',
      layout: 'vertical'
    },
    plotOptions: {
      series: {
        animation: false,
        /*
          dataLabels: {
            enabled: true,
            borderRadius: 5,
            backgroundColor: 'rgba(252, 255, 197, 0.2)',
            borderWidth: 1,
            borderColor: '#aaa',
            formatter: function() {
              if (this.y === min || this.y === max) {
                return Math.round(this.y) + ' lbs/A';
              }
            }
          },
        */
      }
    },
    tooltip: {
      formatter: function () {
        return '<small>' + Highcharts.dateFormat('%b %e, %Y', new Date(this.x)) + '</small><br/>' +
               '<strong>' + this.series.name + ': ' + this.y.toFixed(0) + ' lbs/A</strong>';
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
        showInLegend: false && cornN,
      },
      {
        name: 'Corn N uptake',
        data: NUptake,
        lineWidth: 1,
        color: 'orange',
        showInLegend: false && cornN,
      }
    ],
    yAxis: [
      {
        title: {
          text: parms.outputN === 1 && cornN  ? 'Cover Crop N Released (lbs/acre)<br><div style="color: orange; zfont-weight: normal;">Corn N uptake (lbs/acre)</div>' :
                parms.outputN === 1           ? 'Cover Crop N Released (lbs/acre)' :
                                                'Residue Remaining (lbs/acre)',
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
            fontSize: '16px',
            color: '#6B9333'
          }
        },
        linkedTo: 0,
        gridLineWidth: 0,
        opposite: true,
        tickInterval: 1,
        labels: {
          formatter: function () {
            const result = Math.round(this.value / (max / 100));
            return result;
          }
        }      
      },
    ],
    xAxis: [
      {
        type: 'datetime',
        title: {
          text: 'Weeks after termination'
        },
        ztickInterval: 24 * 3600 * 1000 * 14,
        tickInterval: 24 * 3600 * 1000 * 7,
        startOnTick: false,
        endOnTick: false,
        min: data[0][0],
        labels: {
          formatter: function () {
            const weeks = Math.round((this.value - minDate) / (24 * 3600 * 1000) / 7);
            if (!(weeks % 2)) {
              return Highcharts.dateFormat('%b %e', new Date(this.value)) + '<br/>' +
                     Math.round((this.value - minDate) / (24 * 3600 * 1000) / 7) + ' weeks';
            }
          }
        },
        plotLines: [{
          value: new Date(parms.plantingDate),
          color: 'green',
          dashStyle: 'shortdash',
          width: 0.4,
          label: {
            useHTML: true,
            text: '<div style="background: white; transform: rotate(-90deg); position: relative; left: -50px;">Planting date</div>'
          }
        }],
      },
    ]
  };

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

  const NPredict = (model.MinNfromFOM.slice(-1)  / 1.12085).toFixed(0);
  const NPredict14 = (model.MinNfromFOM[14 * 24] / 1.12085).toFixed(0);
  const NPredict28 = (model.MinNfromFOM[28 * 24] / 1.12085).toFixed(0);

//  const col = ['BD', 'RH', 'Rain', 'Temp', 'FOM', 'FON', 'Carb', 'Cell', 'Lign', '%_lignin', 'a', 'Air_MPa', 'b', 'BD', 'c', 'Carb0', 'CarbK', 'CarbN', 'CellK', 'CellN', 'CNR', 'CNRF', 'ContactFactor', 'Critical_FOM', 'DeCarb', 'DeCell', 'DeLign', 'Depth_in', 'Depth_layer_cm', 'Dew', 'Dminr', 'Evaporation', 'FAC', 'FOMNhum', 'FromAir', 'FromDew', 'FromRain', 'GRCom', 'GRCom1', 'GRCom2', 'GRCom3', 'GRNom', 'GrNom1', 'GRNom2', 'GRNOm3', 'Hum', 'HumMin', 'HumN', 'InitialFOMN_kg/ha', 'INkg', 'INppm', 'k_4', 'k1', 'k3', 'LigninN', 'LignK', 'Litter_MPa_Gradient', 'LitterMPa', 'LitterWaterContent', 'MinFromFOMRate', 'MinFromHumRate', 'MinNfromFOM', 'MinNfromHum', 'NAllocationFactor', 'NetMin', 'NImmobFromFOM', 'NimmobIntoCarbN', 'Noname_1', 'Noname_2', 'PMNhotKCl', 'PrevLitWC', 'PrevRH', 'RainToGetCurrentWC', 'Resistant', 'RHChange', 'RhMin', 'RMTFAC', 'RNAC', 'Sat', 'SOCpct', 'WaterLossFromEvap', 'WCFromRain'].slice(0, 8);

  return (
    <div id="Output2">
      <table style={{width: '100%'}}>
        <tbody>
          <tr>
            <td>
              <p><strong>Cover crop summary</strong></p>
              <div className="inputs">
                <table className="coverCropSummary" style={{marginTop: '1em'}}>
                  <tbody>
                    <tr>
                      <td>Dry Biomass</td>
                      <td>{(+parms.biomass).toFixed(0)}</td>
                      <td>lbs/A</td>
                    </tr>
                    <tr>
                      <td>Residue N Content</td>
                      <td>{((parms.biomass * parms.N) / 100).toFixed(0)}</td>
                      <td>lbs/A</td>
                    </tr>
                    <tr>
                      <th colSpan="3">Residue quality</th>
                    </tr>
                    <tr>
                      <td>Carbohydrates</td>
                      <td>{(parms.carb || 0).toFixed(0)}</td>
                      <td>%</td>
                    </tr>
                    <tr>
                      <td>Cellulose</td>
                      <td>{(parms.cell || 0).toFixed(0)}</td>
                      <td>%</td>
                    </tr>
                    <tr>
                      <td>Lignin</td>
                      <td>{(parms.lign || 0).toFixed(0)}</td>
                      <td>%</td>
                    </tr>
                  </tbody>
                </table>
                <hr/>
                <p>Your cover crop <strong>{parms.coverCrop.join('; ')}</strong> was terminated on <strong>{moment(parms.killDate).format('MMM D, yyyy')}</strong>.</p>
                <p>The cover crop is predicted to release {NPredict} lbs of N per acre from the aboveground biomass over three months. This is a N {NPredict >= 0 ? 'credit' : 'debit'}.</p>
                <p>The cover crop is predicted to release:</p>
                <ul>
                  <li>{NPredict14} lbs of N per acre in the first two weeks after termination.</li>
                  <li>{NPredict28} lbs of N per acre in the first four weeks after termination.</li>
                </ul>
                <p>Your target nitrogen fertilizer rate was {parms.targetN} lbs N/ac.</p>
                <p>Your recommended N after crediting nitrogen from the cover crop is {parms.targetN - NPredict} lbs N/ac.</p>
                <div className="percent" style={{display: 'none', width: '500px', color: '#eee'}}>
                  <div style={{width: (parms.carb / total) * 100 - 1 + '%', background: '#385E1B'}}>
                    {(parms.carb || 0).toFixed(0)}
                  </div>
                  <div style={{width: (parms.cell / total) * 100 - 1 + '%', background: '#8EB644'}}>
                    {(parms.cell || 0).toFixed(0)}
                  </div>
                  <div style={{width: (parms.lign / total) * 100 - 1 + '%', background: '#543608'}}>
                    {(parms.lign || 0).toFixed(0)}
                  </div>

                  <div style={{textAlign: 'left', width: (parms.carb / total) * 100 - 1 + '%', color: '#385E1B'}}>
                    Carb
                  </div>
                  <div style={{textAlign: 'left', width: (parms.cell / total) * 100 - 1 + '%', color: '#8EB644'}}>
                    Cell
                  </div>
                  <div style={{textAlign: 'left', width: (parms.lign / total) * 100 - 1 + '%', color: '#543608'}}>
                    Lign
                  </div>
                </div>
              </div>
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
              <HighchartsReact highcharts={Highcharts} options={options} />
              <p>In addition to the amount of available N released from your cover crop, when it is released is important to guide your N management.</p>
              <p>This graph will give you an idea about when the N is being released. Days after cover crop termination is on the horizontal axis and amount of available N on the vertical axis. To determine how much available N will be available at a given time, follow a vertical line up from a date to the plotted curve.</p>
              <p>The steepness of the plotted line indicates how rapidly N is released.</p>
              <p>This graph may help you decide if you want to adjust your N fertilizer at planting or sidedress.</p>
            </td>
          </tr>
        </tbody>
      </table>
      <p>The available N reported above from the cover crop decompositions is considered a N credit if positive or a debit if negative. The amount of N fertilizer recommended may be reduced by a credit or increased by a debit. Here are examples:</p>
      <table className="example">
        <tbody>
          <tr>
            <th>N Credit Example:</th>
            <th>N Debit Example:</th>
          </tr>
          <tr>
            <td>
              Recommended or Target N = 150 lbs N/ac<br/>
              Predicted Cover Crop N = 50 lbs N/ac<br/>
              Recommended N after Credit = 150 - 50 = <strong>100</strong> lbs N/ac
            </td>
            <td>
              Recommended or Target N = 150 lbs N/ac<br/>
              Predicted Cover Crop N = - 20 lbs N/ac<br/>
              Recommended N after Debit = 150 - (-20) = 150 +20 = <strong>170</strong> lbs N/ac
            </td>
          </tr>
        </tbody>
      </table>

      <div className="bn">
        <button onClick={() => setScreen('CoverCrop3')}>BACK</button>
      </div>
    </div>
  )
} // Output2

export {
  Output1,
  Output2
}