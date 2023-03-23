/**
 * String table rendering functions. This is not called at runtime, just as part of the build
 * process.
 *
 * It needs to be a CommonJS module because it is invoked by Webpack in dev environments.
 */
const btoa = require('btoa');
const fs = require('fs/promises');
const { parse } = require('csv-parse/sync');
const path = require('path');

/**
 * Loads a CSV strings file into an object.
 *
 * @param {string} [csvData] - Contents of CSV file
 * @return {object} - The strings table with keys and values from the first two CSV columns
 */
function csvToStrings(csvData) {
  const rows = parse(csvData, {
    // Skip header row
    from: 2,
    // Skip empty "row" that is really just the terminating linefeed
    skip_empty_lines: true,
  });

  return rows.reduce((result, row) => {
    result[row[0]] = row[1];
    return result;
  }, {});
}

/**
 * Renders a strings object as a JavaScript statement that exports a constant called "strings".
 *
 * @param {object} [stringsMap] - Strings to render as JavaScript.
 * @return {string} - A JavaScript statement that exports a constant called "strings"
 */
function stringsToJS(stringsMap) {
  const json = JSON.stringify(stringsMap, null, 2);

  return `export const strings = ${json};\n`;
}

async function exportStrings(stringsMap, locale, targetDir) {
  const javascript = stringsToJS(stringsMap);

  const exportPath = path.resolve(targetDir, `strings-${locale}.js`);

  await fs.writeFile(exportPath, javascript, { encoding: 'utf-8' });
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
  const stringsMap = csvToStrings(csvData);

  await exportStrings(stringsMap, locale, targetDir);

  if (locale === 'en') {
    await exportStrings(generateGibberish(stringsMap), 'gx', targetDir);
  }
}

/**
 * Transforms the English strings table into gibberish.
 *
 * 1. Split the English string into whitespace-delimited words.
 * 2. Reverse the order of the words.
 * 3. Render each word as a base64 encoding of its UTF-8 representation, except for words that look
 *    like format string placeholders.
 *
 * @param {object} [english] - English strings table.
 * @return {object} - Gibberish strings table.
 */
function generateGibberish(english) {
  const overrides = {
    MONITORING_DATE_FORMAT: 'kk:mm d Mo',
  };

  const encoder = new TextEncoder();
  const gibberish = Object.assign({}, english);
  Object.keys(english).forEach((key) => {
    const englishString = english[key];
    const words = englishString.split(' ').reverse();
    const encodedWords = words.map((word) => {
      if (word.startsWith('{')) {
        return word;
      } else {
        const uint8Array = encoder.encode(word);
        const binary = Array(uint8Array.length)
          .fill('')
          .map((_, i) => String.fromCharCode(uint8Array[i]))
          .join('');
        return btoa(binary).replace(/=/g, '');
      }
    });
    gibberish[key] = encodedWords.join(' ');
  });

  return { ...gibberish, ...overrides };
}

module.exports = { convertCsvFile, generateGibberish };
