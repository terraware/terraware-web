import { asBlob, generateCsv, mkConfig } from 'export-to-csv';
import { AcceptedData, ColumnHeader } from 'export-to-csv/output/lib/types';

export type CsvData = { [k: string]: AcceptedData };

export const makeCsv = (columns: ColumnHeader[], data: CsvData[]): Blob => {
  const csvConfig = mkConfig({ columnHeaders: columns });
  const csv = generateCsv(csvConfig)(data);
  return asBlob(csvConfig)(csv);
};

export const downloadFile = (filename: string, mimeType: string, fileContent: string) => {
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
