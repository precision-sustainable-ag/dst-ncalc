/* eslint-disable no-unused-vars */
/* eslint-disable operator-linebreak */
/* eslint-disable import/prefer-default-export */
import moment from 'moment';

const modelCalc = ({
  model,
  carb,
  cell,
  lign,
  unit,
  cashCropPlantingDate,
  coverCropTerminationDate,
  cashCrop,
  outputN,
  cornN,
  Yield,
  nweeks,
  biomass,
  N,
  doCornN,
  doIncorporated,
}) => {
  const total = +carb + +cell + +lign;
  carb = (carb * 100) / total;
  cell = (cell * 100) / total;
  lign = (lign * 100) / total;
  const factor = unit === 'lb/ac' ? 1.12085 : 1;

  const d1 = new Date(cashCropPlantingDate);
  let dailyTotal = 0;
  let gdd = 0;
  // const NUptake = [[+cashCropPlantingDate, 0]];
  const NUptake = [];

  // const doCornN = cashCrop === 'Corn' && outputN === 1;

  if (cornN && doCornN) {
    const f = unit === 'lb/ac' ? 1 : 1.12085;
    cornN.forEach((rec) => {
      const temp = rec.air_temperature;
      dailyTotal += temp - 8;
      if (d1.getHours() === 0) {
        gdd += dailyTotal / 24;
        NUptake.push({
          x: +d1,
          y: ((Yield * 1.09) /
            (1 + Math.exp(-0.00615 * (gdd - 646.19)))) *
            f,
          marker: {
            radius: 3,
            fillColor: 'orange',
            enabled: false,
          },
        });
        dailyTotal = 0;
      }
      d1.setHours(d1.getHours() + 1);
    });
  }

  let date = new Date(coverCropTerminationDate);
  date.setHours(0, 0, 0, 0);
  const surfaceData = [];

  let m2;
  let m4;
  let mf;
  const dates = [];

  if (model) {
    model.s[outputN === 1 ? 'MinNfromFOM' : 'FOM'].forEach(
      (d, i, a) => {
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
              enabled:
                Math.round(i / 24) === nweeks * 7 ||
                (i === a.length - 1 && nweeks * 7 * 24 >= a.length),
            },
          });
        }
        date.setHours(date.getHours() + 1);
      },
    );
  }

  date = new Date(coverCropTerminationDate);
  const incorporatedData = [];

  if (model && doIncorporated) {
    model.i[outputN === 1 ? 'FomCumN' : 'FOM'].forEach((d, i, a) => {
      const value = +(d / factor).toFixed(2);
      incorporatedData.push({
        x: +date,
        y: +value,
        marker: {
          radius: 5,
          fillColor: '#008837',
          enabled:
            i / 24 === nweeks * 7 ||
            (i === a.length - 1 && nweeks * 7 * 24 >= a.length),
        },
      });
      date.setDate(date.getDate() + 1);
    });
  }

  const maxSurface =
    outputN === 1
      ? (biomass * N) / 100
      : Math.max(...surfaceData.map((d) => d.y));
  const surfaceMin =
    outputN === 1
      ? (biomass * N) / 100
      : Math.min(...surfaceData.map((d) => d.y));
  const incorporatedMin =
    outputN === 1
      ? (biomass * N) / 100
      : Math.min(...incorporatedData.map((d) => d.y));

  const minDate = new Date(coverCropTerminationDate);

  const surfaceNPredict = model ? Math.round(
    model.s.MinNfromFOM.slice(-1) / factor,
  ) : 0;

  const incorporatedNPredict =
    model && doIncorporated && Math.round(model.i.FomCumN.slice(-1) / factor);

  // surfaceData[30] && console.log('modelCalc', 'outputN', outputN, biomass, surfaceData[30]);

  return {
    maxSurface,
    surfaceMin,
    incorporatedMin,
    minDate,
    surfaceData,
    incorporatedData,
    NUptake,
    surfaceNPredict,
    incorporatedNPredict,
    dates,
  };
};

export { modelCalc };
