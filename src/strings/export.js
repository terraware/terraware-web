/**
 * String table rendering functions. This is not called at runtime, just as part of the build
 * process.
 *
 * Parsing the CSVs, deriving the gibberish locale, and rendering a table as TypeScript are shared
 * with @terraware/web-components, which builds its own string tables the same way. What's left
 * here is the strings this application adds outside of the CSVs.
 *
 * It needs to be a CommonJS module because it is invoked by Rsbuild's config in dev environments.
 */
const fs = require('fs/promises');
const path = require('path');
const { csvToStrings, generateGibberish, stringsToTypeScript } = require('@terraware/web-components/strings/export');

/**
 * Returns a list of extra strings to include in the string table for a locale. This is necessary
 * because some translation frameworks don't work well with punctuation-only strings such as list
 * separators; including them in a translation order can cause the order to get stuck indefinitely.
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

async function exportStrings(englishStrings, localizedStrings, locale, targetDir, defaultToEnglish = true) {
  const stringsMap = extraStrings(locale);
  for (let key in englishStrings) {
    if (key in localizedStrings) {
      stringsMap[key] = localizedStrings[key];
    } else {
      console.warn(`Locale ${locale} has no translation for ${key}`);
      if (defaultToEnglish) {
        stringsMap[key] = englishStrings[key];
      }
    }
  }

  const exportPath = path.resolve(targetDir, `strings-${locale}.ts`);

  await fs.writeFile(exportPath, await stringsToTypeScript(stringsMap, exportPath), { encoding: 'utf-8' });
}

/**
 * Converts a CSV strings file to a TypeScript source file that exports a constant called "strings".
 * This will be an object that has the same keys as the English strings file; the English strings
 * will be used for any keys that aren't translated yet.
 *
 * @param {string} [csvPath] - Location of CSV file. The filename is assumed to be the locale
 * code with a ".csv" suffix.
 * @param {string} [targetDir] - Directory to write the TypeScript file to
 * @param {boolean} [defaultToEnglish] - If true, output the English text for any strings that
 * don't have translations in the CSV file.
 * @return {Promise<void>}
 */
async function convertCsvFile(csvPath, targetDir, defaultToEnglish = true) {
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

  await exportStrings(englishStringsMap, stringsMap, locale, targetDir, defaultToEnglish);

  if (locale === 'en') {
    await exportStrings(englishStringsMap, generateGibberish(englishStringsMap), 'gx', targetDir);
  }
}

/**
 * Converts the CSV files for all locales to TypeScript source files that export a symbol
 * "strings." The list of locales is determined by the presence of CSV files.
 */
async function convertAllLocales(csvDir, stringsDir, defaultToEnglish = true) {
  const files = await fs.readdir(csvDir);
  const conversions = files.map(async (filename) => {
    if (filename.endsWith('.csv')) {
      // eslint-disable no-console
      console.log(`Converting ${filename} to TypeScript`);
      await convertCsvFile(`${csvDir}/${filename}`, stringsDir, defaultToEnglish);
    }
  });

  await Promise.resolve(Promise.all(conversions));
}

module.exports = { convertAllLocales };
