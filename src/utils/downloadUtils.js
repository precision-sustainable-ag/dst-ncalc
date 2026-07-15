import JSZip from 'jszip';

/**
 * Triggers a browser download for a Blob.
 * @param {Blob} blob - file contents
 * @param {string} fileName - name the file is saved as
 */
export const downloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Bundles GeoJSON objects into a zip and downloads it.
 * @param {Array<{name: string, geojson: Object}>} files - GeoJSON files to include in the zip
 * @param {string} zipName - Name the zip file is saved as
 */
export const downloadGeojsonZip = async (files, zipName) => {
  const zip = new JSZip();
  files.forEach(({ name, geojson }) => {
    zip.file(name, JSON.stringify(geojson));
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, zipName);
};
