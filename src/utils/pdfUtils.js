/**
 * Turns an array of captured map snapshots into an HTML string suitable for PDF generation.
 * @param {string} fieldName - field name for the heading
 * @param {Array} mapCaptures - array of { label, mapImage, legendItems, legendTitle }
 * @param {Object} summaryData - key-value pairs of summary data to include in the report
 */
const buildPdfReportHtml = ({ fieldName, mapCaptures, summaryData }) => {
  const summaryRows = Object.entries(summaryData)
    .map(
      ([key, item]) => `
        <div class="summary-item">
          <span class="summary-key">${key}:</span>
          <span class="summary-value">${Array.isArray(item.value) ? item.value.join(', ') : item.value}</span>
        </div>
    `,
    )
    .join('');

  const mapCards = mapCaptures
    .map(({
      label, mapImage, legendItems, legendTitle = [],
    }) => {
      const headerCells = legendTitle
        .map((u) => `<th class="legend-unit">${u}</th>`)
        .join('');

      const legendRows = legendItems
        .map(
          ({ color, values }) => `
          <tr class="legend-row">
            <td class="legend-swatch-cell"><span class="legend-swatch" style="background:${color};"></span></td>
            ${(values ?? []).map((v) => `<td class="legend-label">${v}</td>`).join('')}
          </tr>`,
        )
        .join('');

      return `
      <div class="map-card">
        <h3 class="map-title">${label}</h3>
        <div class="map-body">
          <img class="map-img" src="${mapImage}" alt="${label} map" />
          <div class="legend">
            <table class="legend-table">
              <thead>
                <tr>
                  <th class="legend-swatch-cell"></th>
                  ${headerCells}
                </tr>
              </thead>
              <tbody>
                ${legendRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
    })
    .join('');

  return `<!DOCTYPE html>
    <html lang="en">
        <head>
        <meta charset="UTF-8" />
        <style>
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
            body {
                font-family: Arial, sans-serif;
                padding: 32px;
                color: #1a1a1a;
                background: #fff;
            }
        
            header {
                margin-bottom: 28px;
                border-bottom: 2px solid #2e7d32;
                padding-bottom: 12px;
            }
            header h1 {
                font-size: 24px;
                font-weight: 700;
                color: #2e7d32;
            }
            header p {
                font-size: 12px;
                color: #666;
                margin-top: 4px;
            }

            .section-heading {
                font-size: 16px;
                font-weight: 700;
                color: #2e7d32;
                margin-bottom: 12px;
            }

            .summary-container {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                background: #f9f9f9;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #ddd;
                margin-bottom: 32px;
            }
            .summary-item {
                font-size: 12px;
                display: flex;
                gap: 5px;
            }
            .summary-key {
                font-weight: bold;
                color: #555;
            }
            .summary-value {
                color: #000;
            }
        
            .maps-grid {
                display: grid;
                gap: 24px;
            }
        
            .map-card {
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
                page-break-inside: avoid;
            }
        
            .map-title {
                font-size: 14px;
                font-weight: 600;
                background: #f1f8e9;
                padding: 8px 12px;
                border-bottom: 1px solid #ddd;
                color: #33691e;
            }
        
            .map-body {
                display: flex;
                gap: 0;
            }
        
            .map-img {
                width: calc(100% - 150px);
                height: 220px;
                object-fit: cover;
                display: block;
            }

            .legend {
                width: 150px;
                padding: 8px 6px;
                background: #fafafa;
                border-left: 1px solid #eee;
                flex-shrink: 0;
            }

            .legend-table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
            }

            .legend-unit {
                font-size: 9px;
                font-weight: 700;
                color: #555;
                text-align: center;
                vertical-align: bottom;
                padding-bottom: 4px;
            }

            .legend-swatch-cell {
                width: 18px;
            }

            .legend-swatch {
                display: inline-block;
                width: 14px;
                height: 14px;
                border-radius: 2px;
            }

            .legend-label {
                font-size: 9px;
                color: #333;
                line-height: 1.2;
                text-align: center;
                padding: 1px 0;
            }
        
            footer {
                margin-top: 28px;
                font-size: 11px;
                color: #999;
                text-align: right;
                border-top: 1px solid #eee;
                padding-top: 8px;
            }
        </style>
        </head>
        <body>
            <header>
                <h1>Nitrogen Prescription Maps - ${fieldName}</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
            </header>

            <section>
                <h2 class="section-heading">Average Field Properties</h2>
                <div class="summary-container">
                    ${summaryRows}
                </div>
            </section>
        
            <section>
                <h2 class="section-heading">Maps</h2>
                <div class="maps-grid">
                    ${mapCards}
                </div>
            </section>
        
            <footer>Precision Sustainable Agriculture - Nitrogen Calculator</footer>
        </body>
    </html>`;
};

export default buildPdfReportHtml;
