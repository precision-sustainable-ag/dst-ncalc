import React from 'react';

import Highcharts from 'highcharts';

import HighchartsReact from 'highcharts-react-official';

import transpile from './Transpiler.js';

const Output1 = ({parms, sets, setScreen}) => {
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
  if (!parms.biomass || !parms.N || !parms.carb || !parms.cellulose || !parms.lignin || !parms.lwc || !parms.BD || !parms.InorganicN || !parms.weather.length) {
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

  const total = parms.carb + parms.cellulose + parms.lignin;

  const model = transpile({
    FOMkg: parms.biomass / 2.2,
    FOMpctN: +parms.N,
    FOMpctCarb: +parms.carb,
    FOMpctCell: +parms.cellulose,
    FOMpctLign: +parms.lignin,
    LitterWaterContent: +parms.lwc,
    BD: +parms.BD,
    INppm: +parms.InorganicN,
    hours: parms.weather.length,
    stop:  parms.weather.length,
    temp: parms.weather.map(d => d.air_temperature),
    RH: parms.weather.map(d => d.relative_humidity * 100),
    rain: parms.weather.map(d => d.precipitation),
  });

  const date = new Date(parms.coverCropKillDate);

  let data = model[parms.outputN === 1 ? 'MinNfromFOM' : 'FOM'].map((d, i) => {
    date.setTime(date.getTime() + (60 * 60 * 1000));
    return [+date, +((d * 0.892179).toFixed(2))];
  });

  const max = Math.max.apply(Math, data.map(d => d[1]));
  const min = Math.min.apply(Math, data.map(d => d[1]));
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
    plotOptions: {
      series: {
        animation: false,
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
        showInLegend: false,
      },
    ],
    yAxis: [
      {
        title: {
          text: parms.outputN === 1 ? 'Cover Crop N Released (lbs/acre)' : 'Residue Remaining (lbs/acre)',
          style: {
            fontSize: '16px',
            color: '#6B9333'
          }
        },
        min: 0,
        endOnTick: false,
        minorTicks: true,
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
        opposite: true,
        labels: {
          formatter: function () {
            return Math.round(this.value / (max / 100)) + '%';
          }
        }      
      },
    ],
    xAxis: [
      {
        type: 'datetime',
        title: {
          text: 'Days after termination'
        },
        tickInterval: 24 * 3600 * 1000 * 14,
        startOnTick: false,
        endOnTick: false,
        min: data[0][0],
        labels: {
          formatter: function () {
            return Highcharts.dateFormat('%b %e', new Date(this.value)) + '<br/>' +
                   Math.round((this.value - minDate) / (24 * 3600 * 1000)) + ' days';
          }
        },
        plotLines: [{
          value: new Date(parms.plantingDate),
          color: 'green',
          dashStyle: 'shortdash',
          width: 1,
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

  const col = ['BD', 'RH', 'Rain', 'Temp', 'FOM', 'FON', 'Carb', 'Cell', 'Lign', '%_lignin', 'a', 'Air_MPa', 'b', 'BD', 'c', 'Carb0', 'CarbK', 'CarbN', 'CellK', 'CellN', 'CNR', 'CNRF', 'ContactFactor', 'Critical_FOM', 'DeCarb', 'DeCell', 'DeLign', 'Depth_in', 'Depth_layer_cm', 'Dew', 'Dminr', 'Evaporation', 'FAC', 'FOMNhum', 'FromAir', 'FromDew', 'FromRain', 'GRCom', 'GRCom1', 'GRCom2', 'GRCom3', 'GRNom', 'GrNom1', 'GRNom2', 'GRNOm3', 'Hum', 'HumMin', 'HumN', 'InitialFOMN_kg/ha', 'INkg', 'INppm', 'k_4', 'k1', 'k3', 'LigninN', 'LignK', 'Litter_MPa_Gradient', 'LitterMPa', 'LitterWaterContent', 'MinFromFOMRate', 'MinFromHumRate', 'MinNfromFOM', 'MinNfromHum', 'NAllocationFactor', 'NetMin', 'NImmobFromFOM', 'NimmobIntoCarbN', 'Noname_1', 'Noname_2', 'PMNhotKCl', 'PrevLitWC', 'PrevRH', 'RainToGetCurrentWC', 'Resistant', 'RHChange', 'RhMin', 'RMTFAC', 'RNAC', 'Sat', 'SOCpct', 'WaterLossFromEvap', 'WCFromRain'].slice(0, 8);

  return (
    <div id="Output2">
      <table style={{width: '100%'}}>
        <tbody>
          <tr>
            <td>
              <p><strong>Cover crop summary</strong></p>
              <div className="inputs">
                <p>Dry Biomass (lbs/acre):</p>
                <div className="underscore">{(+parms.biomass).toFixed(0)}</div>

                <p>Residue N Content (lbs/acre):</p>
                <div className="underscore">{((parms.biomass * parms.N) / 100).toFixed(0)}</div>

                <table className="residueChemistry" style={{marginTop: '1em'}}>
                  <caption>Residue C Chemistry</caption>
                  <tbody>
                    <tr>
                      <td>Carbohydrates</td>
                      <td>{(parms.carb || 0).toFixed(0)}%</td>
                    </tr>
                    <tr>
                      <td>Cellulose</td>
                      <td>{(parms.cellulose || 0).toFixed(0)}%</td>
                    </tr>
                    <tr>
                      <td>Lignin</td>
                      <td>{(parms.lignin || 0).toFixed(0)}%</td>
                    </tr>
                  </tbody>
                </table>
                <div className="percent" style={{display: 'none', width: '500px', color: '#eee'}}>
                  <div style={{width: (parms.carb / total) * 100 - 1 + '%', background: '#385E1B'}}>
                    {(parms.carb || 0).toFixed(0)}
                  </div>
                  <div style={{width: (parms.cellulose / total) * 100 - 1 + '%', background: '#8EB644'}}>
                    {(parms.cellulose || 0).toFixed(0)}
                  </div>
                  <div style={{width: (parms.lignin / total) * 100 - 1 + '%', background: '#543608'}}>
                    {(parms.lignin || 0).toFixed(0)}
                  </div>

                  <div style={{textAlign: 'left', width: (parms.carb / total) * 100 - 1 + '%', color: '#385E1B'}}>
                    Carb
                  </div>
                  <div style={{textAlign: 'left', width: (parms.cellulose / total) * 100 - 1 + '%', color: '#8EB644'}}>
                    Cell
                  </div>
                  <div style={{textAlign: 'left', width: (parms.lignin / total) * 100 - 1 + '%', color: '#543608'}}>
                    Lign
                  </div>
                </div>
              </div>
            </td>
            <td>
              <div className="output">
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
            </td>
          </tr>
        </tbody>
      </table>
      <div className="bn">
        <button onClick={() => setScreen('Output1')}>BACK</button>
      </div>
    </div>
  )
} // Output2

export {
  Output1,
  Output2
}