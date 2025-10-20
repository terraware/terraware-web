import React, { useCallback } from 'react';

import { Button, Tooltip } from '@terraware/web-components';
import { ColumnHeader } from 'export-to-csv/output/lib/types';

import strings from 'src/strings';
import { CsvData, downloadCsv, makeCsv } from 'src/utils/csv';

export type ExportTableProps = {
  columnHeaders: ColumnHeader[];
  retrieveResults: () => Promise<CsvData[]>;
  convertRow?: (row: any) => CsvData;
  filename?: string;
};

export default function ExportTableComponent({
  columnHeaders,
  retrieveResults,
  convertRow,
  filename,
}: ExportTableProps) {
  const onExportAsync = useCallback(async () => {
    const results: CsvData[] = (await retrieveResults()) || [];
    if (results.length === 0) {
      return;
    }

    const data: CsvData[] = convertRow ? results.map((row) => convertRow(row)) : results;
    const fileBlob = makeCsv(columnHeaders, data);
    const fileContents = await fileBlob.text();

    downloadCsv(filename || 'export', fileContents);
  }, [columnHeaders, convertRow, filename, retrieveResults]);

  const onExport = useCallback(() => void onExportAsync(), [onExportAsync]);

  return (
    <Tooltip title={strings.EXPORT}>
      <Button onClick={onExport} icon='iconExport' type='passive' priority='ghost' />
    </Tooltip>
  );
}
