/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { get, missingData } from '../../store/Store';

import './styles.scss';

const Advanced = () => {
  const BD = useSelector(get.BD);
  const N = useSelector(get.N);
  const coverCropTerminationDate = new Date(useSelector(get.coverCropTerminationDate));
  const carb = useSelector(get.carb);
  const cell = useSelector(get.cell);
  const lign = useSelector(get.lign);
  const lwc = useSelector(get.lwc);
  const biomass = useSelector(get.biomass);
  // const unit = useSelector(get.unit);
  const InorganicN = useSelector(get.InorganicN);
  const gotModel = useSelector(get.gotModel);
  const model = useSelector(get.model);

  const navigate = useNavigate();

  const scr = missingData();
  if (scr) {
    setTimeout(() => navigate(`../${scr}`), 1);
    return '';
  }

  if (!gotModel || !model || !biomass || !N || !carb || !cell || !lign || !lwc || !BD || !InorganicN) {
    return (
      <div className="loading">
        <p>Loading Output</p>
        <p>Please wait</p>
        <span />
        <span />
        <span />
      </div>
    );
  }

  const factor = 1;

  const minDate = new Date(coverCropTerminationDate);
  minDate.setHours(0, 0, 0, 0);

  Highcharts.setOptions({
    chart: {
      animation: false,
    },
    lang: {
      numericSymbols: null,
    },
  });

  const hourly = false;

  const Chart = ({ parm }) => {
    let date;
    const stacked = /Carb/.test(parm); // Array.isArray(parm);
    const series = [];
    const colors = ['#6b9333', 'blue', 'brown'];
    [parm].flat().forEach((parmm, i) => {
      const cdata = [];
      date = new Date(coverCropTerminationDate);
      date.setHours(0, 0, 0, 0);
      let total = 0;
      model.s[parmm].forEach((d) => {
        const value = +(d / factor).toFixed(2);
        total += +value;
        if (hourly || date.getHours() === 23) {
          if (stacked) {
            cdata.push({
              x: +date,
              y: +value,
            });
          } else {
            let yval;
            if (hourly) {
              yval = +value;
            } else if (parmm === 'Rain') {
              yval = +(total.toFixed(2));
            } else {
              yval = +((total / 24).toFixed(2));
            }
            cdata.push({
              x: +date,
              y: yval,
            });
          }
          total = 0;
        }
        date.setHours(date.getHours() + 1);
      });
      let typeval;
      if (stacked) {
        typeval = 'area';
      } else if (parmm === 'Rain') {
        typeval = 'column';
      } else {
        typeval = 'line';
      }
      series.push({
        name: {
          Carb: 'Carbohydrates',
          Cell: 'Holo-cellulose',
          Lign: 'Lignin',
          CarbN: 'Carbohydrates',
          CellN: 'Holo-cellulose',
          LigninN: 'Lignin',
          Rain: 'Rainfall',
          Temp: 'Air temperature',
          RH: 'Relative humidity',
          CNRF: 'C:N ratio factor',
          RMTFAC: 'Residue moisture-temperature reduction factor',
          ContactFactor: 'Residue contact factor',
          LitterMPa: 'Litter water potential',
          Air_MPa: 'Air water potential',
        }[parmm] || parmm,
        type: typeval,
        yAxis: /(RH)/.test(parmm) ? 1 : 0,
        data: cdata,
        color: colors[i],
        showInLegend: true || /(Carb|Cell|Lign|Rain|Temp|RH|CNRF|RMTFAC|ContactFactor)/.test(parm),
      });
    });

    let yAxisTitleText;
    if (/Rain/.test(parm)) {
      yAxisTitleText = `<div style="color: ${colors[0]}">Rainfall (mm)</div><br><div style="color: ${colors[1]}">Air temperature (&deg;C)</div>`;
    } else if (/Carb/.test(parm)) {
      yAxisTitleText = 'kg/ha';
    } else if (/LitterMPa|Air_MPa/.test(parm)) {
      yAxisTitleText = 'MPa';
    } else {
      yAxisTitleText = '';
    }
    const options = {
      chart: {
        height: 300,
        width: window.innerWidth > 500 ? 500 : window.innerWidth - 5,
      },
      plotOptions: {
        series: {
          animation: false,
          turboThreshold: 100000,
        },
        area: {
          stacking: 'normal',
          lineColor: '#666666',
          lineWidth: 1,
          marker: {
            lineWidth: 1,
            lineColor: '#666666',
          },
        },
      },
      tooltip: {
        shared: true,
        useHTML: true,
        // zformatter() {
        //   const week = Math.floor((this.x - minDate) / (24 * 3600 * 1000) / 7);

        //   return this.points.reduce((s, point) => (
        //     `${s}<strong>${point.series.name}: ${point.y.toFixed(0)} ${unit}<br/></strong>`
        //   ), `<small>${Highcharts.dateFormat('%b %e, %Y', new Date(this.x))}</small><br/>Week ${week}<br/>`);
        // },
      },
      title: {
        text: {
          'Carb,Cell,Lign': 'Fresh Organic Matter',
          'CarbN,CellN,LigninN': 'Fresh Organic Nitrogen',
          'zRain,Temp,RH': 'Weather',
          'zRMTFAC,CNRF,ContactFactor': ' ',
        }[parm],
        style: {
          color: colors[0],
          padding: 0,
          margin: 0,
        },
      },
      zsubtitle: {
        text: {
          RH: '',
          Rain: 'mm',
          Temp: '&deg;C',
          FOM: 'kg/ha',
          FON: 'kg N/ha',
          'Carb,Cell,Lign': 'kg/ha',
          'CarbN,CellN,LigninN': 'kg/ha',
        }[parm],
        style: {
          fontSize: '10pt',
          padding: 0,
          margin: 0,
        },
      },
      series,
      xAxis: [
        {
          type: 'datetime',
          title: '',
          crosshair: {
            color: 'green',
            dashStyle: 'dash',
          },
          labels: {
            // formatter() {
            //   const weeks = Math.round((this.value - minDate) / (24 * 3600 * 1000) / 7);
            //   return `${Highcharts.dateFormat('%b %e', new Date(this.value))}<br/>${
            //     weeks} weeks`;
            // },
            style: {
              fontSize: '13px',
            },
          },
        },
      ],
      yAxis: [
        {
          title: {
            text: yAxisTitleText,
            style: {
              fontWeight: 'bold',
            },
          },
          zmin: 0,
          endOnTick: false,
          minorTicks: true,
          lineWidth: 3,
        },
        { // Secondary yAxis
          gridLineWidth: 0,
          title: {
            text: /RH/.test(parm) ? 'Relative humidity (%)' : '',
            style: {
              color: colors[2],
              fontWeight: 'bold',
            },
          },
          zlabels: {
            format: '{value} mm',
            style: {
              color: Highcharts.getOptions().colors[0],
            },
          },
          opposite: true,
        },
      ],
    };

    return (
      <div className="advanced parent">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    );
  };

  return (
    <div id="Advanced">
      <div style={{ marginBottom: '50px' }}>
        <div style={{ display: 'inline-block' }}>
          <h3>Residue mass related variables</h3>
          <Chart parm={['Carb', 'Cell', 'Lign']} />
        </div>

        <div style={{ display: 'inline-block' }}>
          <h3>Residue N related variables</h3>
          <Chart parm={['CarbN', 'CellN', 'LigninN']} />
        </div>

        <div style={{ display: 'inline-block' }}>
          <h3>Decay rate adjustment factors</h3>
          <Chart parm={['RMTFAC', 'CNRF', 'ContactFactor']} />
        </div>

        <div style={{ display: 'inline-block' }}>
          <h3>Residue environment</h3>
          <Chart parm={['LitterMPa']} />
        </div>

        <h3>Weather information</h3>
        {
          [['Rain', 'Temp', 'RH'], 'Air_MPa']
            .map((parm) => <Chart key={parm} parm={parm} />)
        }
      </div>

      <div style={{ paddingBottom: '50px' }}>
        <Link className="link" to="/output">BACK</Link>
      </div>
    </div>
  );
}; // Advanced

Advanced.showInMenu = false;

export default Advanced;
