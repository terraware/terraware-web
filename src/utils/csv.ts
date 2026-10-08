import { ColumnHeader, asBlob, generateCsv, mkConfig } from 'export-to-csv';

type AcceptedData = number | string | boolean | null | undefined;

export type CsvData = { [k: string]: AcceptedData };

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
