/**
 * Generates string tables for all the locales that have CSV strings files.
 *
 * This is run as part of the CI build process; you usually shouldn't need to run it by hand.
 */
const fs = require('fs/promises');
const { convertCsvFile } = require('../src/strings/export');

const csvDir = 'src/strings/csv';
const stringsDir = 'src/strings';

async function convertAll() {
  const files = await fs.readdir(csvDir);
  const conversions = files.map(async (filename) => {
    if (filename.endsWith('.csv')) {
      // tslint:disable:no-console
      console.log(`Converting ${filename} to JavaScript`);
      await convertCsvFile(`${csvDir}/${filename}`, stringsDir);
    }
  });

  await Promise.resolve(Promise.all(conversions));
}

convertAll();
