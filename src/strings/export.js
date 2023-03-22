/**
 * String table rendering functions. This is not called at runtime, just as part of the build
 * process.
 *
 * It needs to be a CommonJS module because it is invoked by Webpack in dev environments.
 */
const fs = require('fs/promises');
const { parse } = require('csv-parse/sync');
const path = require('path');

/**
 * Renders a CSV strings file as a JavaScript statement that exports a constant called "strings".
 *
 * @param {string} [csvData] - Contents of CSV file
 * @return {string} - A JavaScript statement that exports a constant called "strings"
 */
function csvToJS(csvData) {
  const rows = parse(csvData, {
    // Skip header row
    from: 2,
    // Skip empty "row" that is really just the terminating linefeed
    skip_empty_lines: true,
  });

  const stringsMap = rows.reduce((result, row) => {
    result[row[0]] = row[1];
    return result;
  }, {});

  const json = JSON.stringify(stringsMap, null, 2);

  return `export const strings = ${json};\n`;
}

/**
 * Converts a CSV strings file to a JavaScript source file that exports a constant called "strings".
 *
 * @param {string} [csvPath] - Location of CSV file. The filename is assumed to be the locale
 * code with a ".csv" suffix.
 * @param {string} [targetDir] - Directory to write JS file to
 * @return {Promise<void>}
 */
async function convertCsvFile(csvPath, targetDir) {
  if (!csvPath.endsWith('.csv')) {
    throw new Error('Cannot convert a non-CSV file');
  }

  const locale = path.basename(csvPath, '.csv');
  const csvData = await fs.readFile(csvPath, { encoding: 'utf-8' });
  const javascript = csvToJS(csvData);

  const exportPath = path.resolve(targetDir, `strings-${locale}.js`);

  await fs.writeFile(exportPath, javascript, { encoding: 'utf-8' });
}

module.exports = { convertCsvFile };
