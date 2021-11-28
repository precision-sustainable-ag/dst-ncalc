import React from 'react';

import Highcharts from 'highcharts';

import HighchartsReact from 'highcharts-react-official';


const Advanced = ({parms, setScreen}) => {
  if (!parms.biomass || !parms.N || !parms.carb || !parms.cell || !parms.lign || !parms.lwc || !parms.BD || !parms.InorganicN || !parms.weather.length) {
    return (
      <div className="loading">
        <p>Loading Advanced</p>
        <p>Please wait</p>
        <span></span>
        <span></span>
        <span></span>
      </div>
    );
  }

  const total = +parms.carb + +parms.cell + +parms.lign;
  const carb = parms.carb * 100 / total;
  const cell = parms.cell * 100 / total;
  const lign = parms.lign * 100 / total;
  const factor = parms.unit === 'lb/ac' ? 1.12085 : 1;

  const model = {
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
  };
  console.log(model);

  let date = new Date(parms.killDate);
  
  const data = [];

  model[parms.outputN === 1 ? 'MinNfromFOM' : 'FOM'].forEach((d, i, a) => {
    const value = +(d / factor).toFixed(2)
    if (date.getHours() === 0) {
      data.push({
        x: +date,
        y: +value,
        marker: {
          enabled: (i / 24 === parms.nweeks * 7) ||
                   (i === a.length - 1 && parms.nweeks * 7 * 24 >= a.length)
        }
      });
    }
    date.setHours(date.getHours() + 1)
  });

  Highcharts.setOptions({
    chart: {
      animation: false
    },
    lang: {
      numericSymbols: null
    }    
  });

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

  if (parms.field) {
    const clone = {...parms};
    clone.weather = {};
    localStorage.setItem(parms.field, JSON.stringify(clone));
  }

  const cols = Object.keys(model).sort((a, b) => a.toUpperCase().localeCompare(b.toUpperCase()));

  cols.filter(col => !model[col].length).forEach(col => {
    model[col] = new Array(model.Rain.length).fill(model[col]);
  });

  const Chart = ({parm}) => {
    const cdata = [];
    let date = new Date(parms.killDate);
    const minDate = Math.min.apply(Math, data.map(d => d.x));
 
    try {
      model[parm].forEach((d, i, a) => {
        const value = +(d / factor).toFixed(2)
        if (date.getHours() === 0) {
          cdata.push({
            x: +date,
            y: +value,
            // marker: {
            //   enabled: (i / 24 === parms.nweeks * 7) ||
            //           (i === a.length - 1 && parms.nweeks * 7 * 24 >= a.length)
            // }
          });
        }
        date.setHours(date.getHours() + 1)
      });
    } catch(ee) {
      alert(parm);
    }

    const options = {
      chart: {
        height: 300,
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
        text: parm
      },
      series: [
        {
          name: parm,
          data: cdata,
          color: '#6B9333',
          showInLegend: false,
        }
      ],
      yAxis: [
        {
          title: {
            text: '',
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
        }
      ],
      xAxis: [
        {
          type: 'datetime',
          title: '',
          crosshair: {
            color: 'green',
            dashStyle: 'dash'
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
          /*
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
          */
        },
      ]
    };

    return (
      <HighchartsReact highcharts={Highcharts} options={options}/>
    )
  }
  
  return (
    <div id="Advanced">
      {
        ['RH', 'Rain', 'Temp', 'FOM', 'FON', 'Carb', 'Cell', 'Lign', '%_lignin', 'a', 'Air_MPa', 'b', 'CarbK', 'CarbN', 'CellK', 'CellN', 'CNR', 'CNRF', 'ContactFactor', 'Critical_FOM', 'DeCarb', 'DeCell', 'DeLign', 'Depth_layer_cm', 'Dew', 'Dminr', 'Evaporation', 'FAC', 'FOMNhum', 'FromAir', 'FromDew', 'FromRain', 'GRCom', 'GRCom1', 'GRCom2', 'GRCom3', 'GRNom', 'GrNom1', 'GRNom2', 'GRNOm3', 'Hum', 'HumMin', 'HumN', 'InitialFOMN_kg/ha', 'INkg', 'INppm', 'k_4', 'k1', 'k3', 'LigninN', 'LignK', 'Litter_MPa_Gradient', 'LitterMPa', 'LitterWaterContent', 'MinFromFOMRate', 'MinFromHumRate', 'MinNfromFOM', 'MinNfromHum', 'NAllocationFactor', 'NetMin', 'NImmobFromFOM', 'NimmobIntoCarbN', 'Noname_1', 'Noname_2', 'PMNhotKCl', 'PrevLitWC', 'PrevRH', 'RainToGetCurrentWC', 'Resistant', 'RHChange', 'RhMin', 'RMTFAC', 'RNAC', 'Sat', 'SOCpct', 'WaterLossFromEvap', 'WCFromRain']
          .slice(0, 80)
          .map(parm => <div className="advanced"> <Chart parm={parm} /> </div>)
      }

      <div className="bn">
        <button onClick={() => setScreen('Output')}>BACK</button>
      </div>
    </div>
  )
} // Advanced

export default Advanced;