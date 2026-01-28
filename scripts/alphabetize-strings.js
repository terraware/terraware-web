const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../src/strings/csv/en.csv');

// Read the CSV file
const content = fs.readFileSync(csvPath, 'utf8');

// Parse CSV properly handling quoted multi-line fields
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && !insideQuotes) {
      insideQuotes = true;
    } else if (char === '"' && insideQuotes) {
      if (nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        insideQuotes = false;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentField);
      if (currentRow.some((field) => field.trim() !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Handle last field and row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((field) => field.trim() !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Convert rows back to CSV format
function rowToCSV(row) {
  return row
    .map((field) => {
      // Quote field if it contains comma, newline, or quotes
      if (field.includes(',') || field.includes('\n') || field.includes('"')) {
        // Escape quotes by doubling them
        const escaped = field.replace(/"/g, '""');
        return `"${escaped}"`;
      }
      return field;
    })
    .join(',');
}

// Parse the CSV
const rows = parseCSV(content);

if (rows.length === 0) {
  console.error('Error: No rows found in CSV');
  process.exit(1);
}

// Extract header and data rows
const header = rows[0];
const dataRows = rows.slice(1);

// Sort data rows alphabetically by key_name (first column)
dataRows.sort((a, b) => {
  const keyA = (a[0] || '').toUpperCase();
  const keyB = (b[0] || '').toUpperCase();
  return keyA.localeCompare(keyB);
});

// Reconstruct the CSV content
const sortedRows = [header, ...dataRows];
const sortedContent = sortedRows.map(rowToCSV).join('\n') + '\n';

// Write back to file
fs.writeFileSync(csvPath, sortedContent, 'utf8');

console.log('✓ en.csv has been alphabetized');
