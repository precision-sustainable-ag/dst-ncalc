/* eslint-disable arrow-body-style */
import Highcharts from 'highcharts';

// const responsiveOptions = {
//   rules: [{
//     condition: {
//       maxWidth: 200,
//     },
//     chartOptions: {
//       legend: {
//         enabled: false,
//       },
//     },
//   }],
// };

Highcharts.setOptions({
  chart: {
    animation: false,
  },
  lang: {
    numericSymbols: null,
  },
});

const getAxisTexts = ({
  mockup,
  outputN,
  doCornN,
  unit,
}) => {
  let titleText;
  if (mockup === 2) {
    if (outputN === 1 && doCornN) {
      titleText = '<div class="caption">Cover crop N released and Corn N uptake over time.</div>';
    } else if (outputN === 1) {
      titleText = '<div class="caption">Cover crop N released over time.</div>';
    } else {
      titleText = '<div class="caption">Undecomposed cover crop residue mass<br/>remaining over time following its termination.</div>';
    }
  } else {
    titleText = '';
  }

  let yAxisTitle;
  if (outputN === 1 && doCornN) {
    yAxisTitle = `Cover Crop N Released (${unit})<br><div style="color: orange;">Corn N uptake (${unit})</div>`;
  } else if (outputN === 1) {
    yAxisTitle = `Cover Crop N Released (${unit})`;
  } else {
    yAxisTitle = `Residue Remaining (${unit})`;
  }

  let xAxisTitle;
  if (mockup === 1) {
    if (outputN === 1 && doCornN) {
      xAxisTitle = '<div class="caption">Cover crop N released and Corn N uptake over time.</div>';
    } else if (outputN === 1) {
      xAxisTitle = '<div class="caption">Cover crop N released over time.</div>';
    } else {
      xAxisTitle = '<div class="caption">Undecomposed cover crop residue mass remaining over time following its termination.</div>';
    }
  } else {
    xAxisTitle = '';
  }
  return { titleText, xAxisTitle, yAxisTitle };
}; // getAxisTexts

/// ////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////
const getGeneralChartOptions = (props) => {
  const {
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
  } = props;
  console.log('props', props);

  const { titleText, xAxisTitle, yAxisTitle } = getAxisTexts({
    mockup,
    outputN,
    doCornN,
    unit,
  });
  return {
    chart: {
      height: 350,
    },
    plotOptions: {
      series: {
        animation: false,
      },
    },
    tooltip: {
      shared: true,
      useHTML: true,
      formatter() {
        const week = Math.floor((this.x - minDate) / (24 * 3600 * 1000) / 7);
        const maxNUptake = Math.max(...NUptake.map((n) => n[1]));

        return this.points.reduce((s, point) => {
          if (point.series.name === 'Corn N uptake') {
            const pct = Math.round((point.y / maxNUptake) * 100);
            return `${s}<strong>${point.series.name}: ${point.y.toFixed(0)} ${unit} (${pct}%)<br/></strong>`;
          }
          return `${s}<strong>${point.series.name}: ${point.y.toFixed(0)} ${unit}<br/></strong>`;
        }, `<small>${Highcharts.dateFormat('%b %e, %Y', new Date(this.x))}</small><br/>Week ${week}<br/>`);
      },
    },
    title: {
      text: titleText,
    },
    series: [
      {
        name: outputN === 1 ? 'N released' : 'Residue Remaining',
        data: surfaceData,
        color: '#008837',
        showInLegend: false,
        zmarker: {
          symbol: 'url(sun.png)',
        },
      },
      {
        name: outputN === 1 ? 'N released' : 'Residue Remaining',
        data: incorporatedData,
        color: '#003788',
        showInLegend: false,
        zmarker: {
          symbol: 'url(sun.png)',
        },
        visible: doIncorporated,
      },
      {
        name: 'Corn N uptake',
        data: NUptake,
        lineWidth: 1,
        color: 'orange',
        showInLegend: false,
      },
    ],
    yAxis: [
      {
        title: {
          text: yAxisTitle,
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#008837',
          },
        },
        min: -10,
        endOnTick: false,
        minorTicks: true,
        lineWidth: 3,
      },
      {
        title: {
          text: outputN === 1 ? 'Cover Crop N Released (%)' : 'Residue Remaining (%)',
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#008837',
          },
        },
        linkedTo: 0,
        gridLineWidth: 0,
        opposite: true,
        tickPositioner() {
          const positions = [];
          const increment = doCornN || outputN === 2 ? 25 : 10;

          for (let tick = 0; tick <= 100; tick += increment) {
            positions.push(tick * (maxSurface / 100));
          }

          return positions;
        },
        labels: {
          formatter() {
            const result = Math.round(this.value / (maxSurface / 100));
            return `${result}%`;
          },
        },
      },
    ],
    xAxis: [
      {
        type: 'datetime',
        title: {
          text: xAxisTitle,
        },
        crosshair: {
          color: '#7b3294',
          dashStyle: 'dash',
        },
        tickPositioner() {
          const positions = [];
          const increment = 24 * 60 * 60 * 1000 * 28;

          for (let tick = this.dataMin; tick <= this.dataMax; tick += increment) {
            positions.push(tick);
          }
          return positions;
        },
        labels: {
          formatter() {
            const weeks = Math.round((this.value - minDate) / (24 * 3600 * 1000) / 7);
            return `${Highcharts.dateFormat('%b %e', new Date(this.value))}<br/>${weeks} weeks`;
          },
          style: {
            fontSize: '13px',
          },
        },
        plotLines: [{
          value: new Date(plantingDate),
          color: '#7b3294',
          dashStyle: 'shortdash',
          width: 0.4,
          label: {
            useHTML: true,
            text: '<div style="background: white; transform: rotate(-90deg); position: relative; left: -50px; font-size: 1.2em;">Planting date</div>',
          },
        }],
      },
    ],
  };
}; // getGeneralChartOptions

/// ////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////
const getNitrogenChartOptions = ({
  mockup,
  outputN,
  unit,
  targetN,
  doIncorporated,
  incorporatedNPredict,
  surfaceNPredict,
}) => {
  return {
    chart: {
      type: 'bar',
      height: 250,
      className: outputN === 2 ? 'hidden' : '',
    },
    title: {
      text: `<div class="caption">
             Cash crop recommended N rate<br>after accounting for cover crop N credits.
           </div>
          `,
      verticalAlign: mockup === 1 ? 'bottom' : 'top',
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
        color: '#008837',
      },
      {
        name: 'Recommended N',
        data: doIncorporated
          ? [Math.max(0, targetN - incorporatedNPredict), Math.max(0, targetN - surfaceNPredict)]
          : [Math.max(0, targetN - surfaceNPredict)],
        color: '#7b3294',
      },
    ],
    xAxis: [{
      categories:
        doIncorporated
          ? [
            `<div style="text-align: left">
              Till&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><span style="font-size: 90%">(Incorporated)</span>
             </div>`,
            `<div style="text-align: left">
              No Till&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><span style="font-size: 90%">(Surface)&nbsp;&nbsp;&nbsp;&nbsp;</span>
             </div>`,
          ]
          : [
            `<div style="text-align: left">
              No Till&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><span style="font-size: 90%">(Surface)&nbsp;&nbsp;&nbsp;&nbsp;</span>
             </div>`,
          ],
      labels: {
        style: {
          fontSize: 13,
          color: 'black',
        },
      },
    }],
    yAxis: [{
      title: {
        text: '',
      },
      labels: {
        enabled: true,
      },
      plotLines: [{
        value: targetN,
        label: {
          useHTML: true,
          text: doIncorporated
            ? `<div class="IncorporatedTargetN">
                Target N
               </div>
               <div class="SurfaceTargetN">
                Target N
               </div>`
            : `<div class="SurfaceOnlyTargetN">
                Target N
               </div>`,
        },
      }],
    }],
    legend: {
      verticalAlign: 'top',
      symbolPadding: 0,
      useHTML: true,
      reversed: true,
      labelFormatter() {
        return `<div style="color: ${this.color};">${this.name}</div>`;
      },
    },
    plotOptions: {
      series: {
        stacking: 'normal',
        dataLabels: {
          enabled: true,
          useHTML: true,
          formatter() {
            const footnote = this.y === 0 ? '<sup>*</sup>' : '';
            return `
            <div style="color: ${this.color}; background: white; transform: translateY(${doIncorporated ? -38 : -58}px);">
              ${this.y} ${unit}${footnote}
            </div>
            `;
          },
        },
        animation: false,
      },
    },
  };
}; // getNitrogenChartOptions

/// ////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////
const getResidueChartOptions = ({
  mockup,
  outputN,
  unit,
  model,
  doIncorporated,
  incorporatedMin,
  surfaceMin,
}) => {
  return {
    chart: {
      type: 'bar',
      height: 350,
      className: outputN === 1 ? 'hidden' : '',
    },
    title: {
      text: `
        <div class="caption">
          Cover crop residue mass remaining<br>after ${Math.floor(model.s.Date.length / (24 * 7))} weeks past termination.
        </div>
      `,
      verticalAlign: mockup === 1 ? 'bottom' : 'top',
    },
    xAxis: {
      categories:
        doIncorporated
          ? [
            `<div style="text-align: left">
              Till&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><span style="font-size: 90%">(Incorporated)</span>
             </div>`,
            `<div style="text-align: left">
              No Till&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><span style="font-size: 90%">(Surface)&nbsp;&nbsp;&nbsp;&nbsp;</span>
             </div>`,
          ]
          : [
            `<div style="text-align: left">
              No Till&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><span style="font-size: 90%">(Surface)&nbsp;&nbsp;&nbsp;&nbsp;</span>
             </div>`,
          ],
      labels: {
        style: {
          fontSize: 13,
          color: 'black',
          step: 1,
        },
      },
    },
    yAxis: {
      title: {
        text: '',
      },
      labels: {
        enabled: true,
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
            fontSize: '0.9rem',
          },
        },
        animation: false,
      },
    },
    series: [
      {
        name: 'Residue remaining',
        data: doIncorporated ? [Math.round(incorporatedMin), Math.round(surfaceMin)] : [Math.round(surfaceMin)],
        color: '#008837',
      },
    ],
  };
}; // getResidueChartOptions

export {
  Highcharts,
  getGeneralChartOptions,
  getResidueChartOptions,
  getNitrogenChartOptions,
};
