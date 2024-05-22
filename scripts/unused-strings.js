/**
 * Check if there are unused keys
 *
 */
const fs = require('fs');
const path = require('path');
const csvFilePath = 'src/strings/csv/en.csv';

function getAllKeys(filePath) {
  const csvData = fs.readFileSync(filePath, 'utf-8');

  return csvData
    .split('\n')
    .slice(1) // ignore header
    .map((row) => {
      const columns = row.split(',');
      return columns[0].trim();
    })
    .filter(Boolean);
}

function scanFiles(directory, fileExtensions) {
  let files = fs.readdirSync(directory);
  let results = [];

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      // Skip the "strings" directory
      if (file === 'strings') {
        return;
      }
      results = results.concat(scanFiles(filePath, fileExtensions));
    } else if (fileExtensions.includes(path.extname(filePath))) {
      results.push(filePath);
    }
  });

  return results;
}

function findReferences(csvEntries, files) {
  const references = {};

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    csvEntries.forEach((entry) => {
      if (content.includes(entry)) {
        if (!references[entry]) {
          references[entry] = [];
        }
        references[entry].push(file);
      }
    });
  });

  return references;
}

function checkUnusedEntries(keys, references) {
  const unusedEntries = keys.filter((key) => !references[key]);
  return unusedEntries;
}

function findUnusedString() {
  const keys = getAllKeys(csvFilePath);
  const allFiles = scanFiles('./src', ['.ts', '.js', '.tsx', '.jsx']);
  const references = findReferences(keys, allFiles);
  const unusedEntries = checkUnusedEntries(keys, references);

  if (unusedEntries.length === 0) {
    console.log('No unused entries found.');
  } else {
    console.log('Unused entries found:');
    unusedEntries.forEach((entry) => console.log(entry));
  }
}

findUnusedString();
