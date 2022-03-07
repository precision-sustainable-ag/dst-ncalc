import React from 'react';

import Highcharts from 'highcharts';

import HighchartsReact from 'highcharts-react-official';

import ZoomInIcon from '@mui/icons-material/ZoomIn';

const zoomIn = (e) => {
  const div = e.target.closest('.parent');
  div.classList.toggle('advanced');
  div.classList.toggle('zoomed');
} // zoomIn

const Advanced = ({parms, setScreen}) => {
  const factor = parms.unit === 'lb/ac' ? 1.12085 : 1;

  const model = parms.model;

  const minDate = +parms.killDate;

  Highcharts.setOptions({
    chart: {
      animation: false
    },
    lang: {
      numericSymbols: null
    }    
  });

  const Chart = ({parm}) => {
    const cdata = [];
    let date = new Date(parms.killDate);
 
    try {
      model.s[parm].forEach((d, i, a) => {
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
      <div className="advanced parent">
        <HighchartsReact highcharts={Highcharts} options={options}/>
      </div>
    )
  }
  
  return (
    <div id="Advanced">
      {
        ['RH', 'Rain', 'Temp', 'FOM', 'FON', 'Carb', 'Cell', 'Lign', '%_lignin', 'a', 'CarbK', 'CarbN', 'CellN', 'CNR', 'Dew', 'Evaporation', 'FOMNhum', 'FromAir', 'FromRain', 'GRCom', 'GRCom1', 'GRCom2', 'GRCom3', 'GRNom', 'GrNom1', 'GRNom2', 'HumMin', 'INkg', 'k_4', 'LigninN', 'Litter_MPa_Gradient', 'LitterMPa', 'LitterWaterContent', 'MinFromFOMRate', 'MinFromHumRate', 'MinNfromFOM', 'MinNfromHum', 'NetMin', 'NImmobFromFOM', 'PrevLitWC', 'PrevRH', 'RainToGetCurrentWC', 'Resistant', 'RHChange', 'RhMin', 'RMTFAC', 'WaterLossFromEvap', 'WCFromRain']
          .slice(0, 80)
          .map(parm => <Chart parm={parm} />)
      }

      <div className="bn">
        <button onClick={() => setScreen('Output')}>BACK</button>
      </div>
    </div>
  )
} // Advanced

export default Advanced;