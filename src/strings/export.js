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
    // Only rows for strings that have comments have 3 fields.
    relax_column_count_less: true,
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

/**
 * Returns a list of extra strings to include in the string table for a locale. This is necessary
 * because Phrase doesn't work well with punctuation-only strings such as list separators; including
 * them in a translation order can cause the order to get stuck indefinitely.
 *
 * @param {string} [locale] - Locale whose extra strings should be returned.
 * @return {{LIST_SEPARATOR_SECONDARY: string, LIST_SEPARATOR: string, TRUNCATED_TEXT_MORE_SEPARATOR: string}}
 */
function extraStrings(locale) {
  if (locale.startsWith('gx')) {
    return {
      LIST_SEPARATOR: '_ ',
      LIST_SEPARATOR_SECONDARY: '! ',
      TRUNCATED_TEXT_MORE_SEPARATOR: ',,,',
    };
  } else if (locale.startsWith('zh')) {
    return {
      LIST_SEPARATOR: '、',
      LIST_SEPARATOR_SECONDARY: '；',
      TRUNCATED_TEXT_MORE_SEPARATOR: '……',
    };
  } else {
    return {
      LIST_SEPARATOR: ', ',
      LIST_SEPARATOR_SECONDARY: '; ',
      TRUNCATED_TEXT_MORE_SEPARATOR: '...',
    };
  }
}

async function exportStrings(englishStrings, localizedStrings, locale, targetDir) {
  const stringsMap = extraStrings(locale);
  for (let key in englishStrings) {
    if (key in localizedStrings) {
      stringsMap[key] = localizedStrings[key];
    } else {
      // tslint:disable-next-line:no-console
      console.warn(`Locale ${locale} has no translation for ${key}`);
      stringsMap[key] = englishStrings[key];
    }
  }

  const javascript = stringsToJS(stringsMap);

  const exportPath = path.resolve(targetDir, `strings-${locale}.js`);

  await fs.writeFile(exportPath, javascript, { encoding: 'utf-8' });
}

/**
 * Converts a CSV strings file to a JavaScript source file that exports a constant called "strings".
 * This will be an object that has the same keys as the English strings file; the English strings
 * will be used for any keys that aren't translated yet.
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

  let englishStringsMap;
  if (locale === 'en') {
    englishStringsMap = stringsMap;
  } else {
    const englishPath = path.resolve(path.dirname(csvPath), 'en.csv');
    const englishCsvData = await fs.readFile(englishPath, { encoding: 'utf-8' });
    englishStringsMap = csvToStrings(englishCsvData);
  }

  await exportStrings(englishStringsMap, stringsMap, locale, targetDir);

  if (locale === 'en') {
    await exportStrings(englishStringsMap, generateGibberish(englishStringsMap), 'gx', targetDir);
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
