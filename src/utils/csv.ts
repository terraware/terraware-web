import { ColumnHeader, asBlob, generateCsv, mkConfig } from 'export-to-csv';

type AcceptedData = number | string | boolean | null | undefined;

export type CsvData = { [k: string]: AcceptedData };

// Excel and Google Sheets run a cell that opens with one of these as a formula.
const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Prefixes a value a spreadsheet would execute with a quote so it opens as text instead. Exports
 * carry text people typed, which must not become a formula in whoever opens the file.
 */
export const escapeCsvFormula = (value: AcceptedData): AcceptedData =>
  typeof value === 'string' && FORMULA_PREFIXES.some((prefix) => value.startsWith(prefix)) ? `'${value}` : value;

export const makeCsv = (columns: ColumnHeader[], data: CsvData[], quoteStrings = true, useBom = true): Blob => {
  const csvConfig = mkConfig({ columnHeaders: columns, quoteStrings, useBom });
  const csv = generateCsv(csvConfig)(data);
  return asBlob(csvConfig)(csv);
};

const downloadFile = (filename: string, mimeType: string, fileContent: string) => {
  const encodedUri = `data:${mimeType};charset=utf-8,${encodeURIComponent(fileContent)}`;
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  link.click();
};

export const downloadCsv = (filename: string, fileContent: string) => {
  downloadFile(`${filename}.csv`, 'text/csv', fileContent);
};

export const downloadGeoJson = (filename: string, fileContent: string) => {
  downloadFile(`${filename}.geojson`, 'application/geo+json', fileContent);
};
