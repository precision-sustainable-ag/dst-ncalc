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
  // const factor = parms.unit === 'lb/ac' ? 1.12085 : 1;
  const factor = 1;

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
    let date;
    const stacked = Array.isArray(parm);
    const series = [];
    const colors = ['#6b9333', 'brown', 'blue'];

    [parm].flat().forEach((parm, i) => {
      const cdata = [];
      date = new Date(parms.killDate);
      model.s[parm].forEach((d, i) => {
        const value = +(d / factor).toFixed(2)
  
        if (date.getHours() === 0) {
          if (stacked) {
            cdata.push({
              x: +date,
              y: +value,
              // marker: {
              //   enabled: (i / 24 === parms.nweeks * 7) ||
              //           (i === a.length - 1 && parms.nweeks * 7 * 24 >= a.length)
              // }
            });
          } else {
            cdata.push({
              x: +date,
              y: +value,
              // marker: {
              //   enabled: (i / 24 === parms.nweeks * 7) ||
              //           (i === a.length - 1 && parms.nweeks * 7 * 24 >= a.length)
              // }
            });
          }
        }
        date.setHours(date.getHours() + 1)
      });
      series.push({
        name: parm,
        data: cdata,
        color: colors[i],
        showInLegend: false,
      });
    })

    const options = {
      chart: {
        type: stacked ? 'area' : 'line',
        height: 300,
        width: 500,
      },
      plotOptions: {
        series: {
          animation: false,
        },
        area: {
          stacking: 'normal',
          lineColor: '#666666',
          lineWidth: 1,
          marker: {
            lineWidth: 1,
            lineColor: '#666666'
          }          
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
        text: {
          RH      : 'Relative Humidity',
          Rain    : 'Rainfall',
          Temp    : 'Air Temperature',
          FOM     : 'Fresh Organic Matter',
          FON     : 'Fresh Organic Nitrogen',
          'Carb,Cell,Lign' : `Carbohydrates, <span style="color: ${colors[1]}">Cellulose</span>, <span style="color: ${colors[2]}">Lignin</span>`,
          'CarbN,CellN,LigninN' : `Carbohydrates, <span style="color: ${colors[1]}">Cellulose</span>, <span style="color: ${colors[2]}">Lignin</span>`,
        }[parm] || parm,
        style: {
          color: colors[0],
          padding: 0,
          margin: 0
        }
      },
      subtitle: {
        text: {
          RH      : ``,
          Rain    : `mm`,
          Temp    : `&deg;C`,
          FOM     : `kg/ha`,
          FON     : `kg N/ha`,
          'Carb,Cell,Lign' : `kg/ha`,
          'CarbN,CellN,LigninN' : `kg/ha`,
        }[parm],
        style: {
          fontSize: '10pt',
          padding: 0,
          margin: 0
        }
      },
      series: series,
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
          zmin: 0,
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
      <h2>Residue mass related variables</h2>
      {
        ['FOM', ['Carb', 'Cell', 'Lign']]
          .map(parm => <Chart parm={parm} />)
      }

      <h2>Residue N related variables</h2>
      {
        ['FON', ['CarbN', 'CellN', 'LigninN']]
          .map(parm => <Chart parm={parm} />)
      }

      <h2>Adjustment factors</h2>
      {
        ['RMTFAC', 'CNRF', 'ContactFactor']
          .map(parm => <Chart parm={parm} />)
      }

      <h2>Weather Information</h2>
      {
        ['Rain', 'Temp', 'RH', 'Air_MPa']
          .map(parm => <Chart parm={parm} />)
      }

      <h2>Residue environment</h2>
      {
        ['LitterMPa']
          .map(parm => <Chart parm={parm} />)
      }

      <div className="bn">
        <button onClick={() => setScreen('Output')}>BACK</button>
      </div>
    </div>
  )
} // Advanced

export default Advanced;