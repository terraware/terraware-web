/**
 * Generates string tables for all the locales that have CSV strings files.
 *
 * This is run as part of the CI build process; you usually shouldn't need to run it by hand.
 */
const { convertAllLocales } = require('../src/strings/export');

const csvDir = 'src/strings/csv';
const stringsDir = 'src/strings';

convertAllLocales(csvDir, stringsDir, false);
