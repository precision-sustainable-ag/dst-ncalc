// Desc: helper functions for hooks
// ..............................................................................
import moment from 'moment';

const weightedAverage = (data, parm, dec = 2) => {
  let totpct = 0;

  data = data
    .filter((d) => d[parm])
    .map((d) => {
      totpct += +d.comppct_r;
      return d[parm] * d.comppct_r;
    });

  return (data.reduce((a, b) => +a + +b) / totpct).toFixed(dec);
}; // weightedAverage

const query = (parm, def) => {
  const params = new URLSearchParams(window.location.search);
  if (parm === 'covercrop' && params.get('covercrop')) {
    return params.get(parm).split(',');
  } if (/date/.test(parm) && params.get(parm)) {
    return moment(params.get(parm));
  }
  return params.get(parm) || def;
}; // query

const downloadOutputCSV = (model, dates) => {
  const cols = Object.keys(model.s).sort();
  const csv = `Date,${cols}\n${dates.map((dt, i) => `${dt},${cols.map((col) => model.s[col][i])}`).join('\n')}`;
  const file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = 'ncalc-data.csv';
  a.click();
}; // downloadOutputCSV

export { weightedAverage, query, downloadOutputCSV };
