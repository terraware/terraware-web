/**
 * Check if there are unused keys
 *
 */
const { findUnusedStrings, formatUnusedStrings } = require('@terraware/web-components/strings/export');

findUnusedStrings({ csvPath: 'src/strings/csv/en.csv', sourceDir: './src' }).then((result) =>
  process.stdout.write(formatUnusedStrings(result))
);
