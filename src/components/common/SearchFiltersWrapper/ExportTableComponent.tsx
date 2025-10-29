import React, { useCallback, useEffect } from 'react';

import { Button, Tooltip } from '@terraware/web-components';
import { ColumnHeader } from 'export-to-csv/output/lib/types';

import { StatusT } from 'src/redux/features/asyncUtils';
import strings from 'src/strings';
import { CsvData, downloadCsv, makeCsv } from 'src/utils/csv';

export type ExportTableProps = {
  columnHeaders: ColumnHeader[];
  convertRow?: (row: any) => CsvData;
  filename?: string;

  // For components with pre-fetched data
  retrieveResults?: () => Promise<CsvData[]>;

  // For Redux components
  requestResults?: () => void;
  resultsResponse?: StatusT<any>;
  // end redux specific props
};

export default function ExportTableComponent({
                                               columnHeaders,
                                               requestResults,
                                               resultsResponse,
                                               retrieveResults,
                                               convertRow,
                                               filename,
                                             }: ExportTableProps) {
  const downloadResults = useCallback(
    async (results: CsvData[]) => {
      const data: CsvData[] = convertRow ? results.map((row) => convertRow(row)) : results;
      const fileBlob = makeCsv(columnHeaders, data);
      const fileContents = await fileBlob.text();

      downloadCsv(filename || 'export', fileContents);
    },
    [columnHeaders, convertRow, filename]
  );

  // For non-Redux components with pre-fetched data
  const onExportAsync = useCallback(async () => {
    const results: CsvData[] = (await retrieveResults?.()) || [];
    if (results.length === 0) {
      return;
    }

    await downloadResults(results);
  }, [downloadResults, retrieveResults]);

  // Handle both Redux and non-Redux patterns
  const onExport = useCallback(() => {
    if (retrieveResults) {
      // Non-Redux case: use async retrieve function
      void onExportAsync();
    } else if (requestResults) {
      // Redux case: dispatch action
      requestResults();
    }
  }, [retrieveResults, requestResults, onExportAsync]);

  // For Redux components: listen for response and download when ready
  useEffect(() => {
    if (resultsResponse?.status === 'success') {
      const results: CsvData[] = resultsResponse.data || [];
      if (results.length === 0) {
        return;
      }

      void downloadResults(results);
    }
  }, [downloadResults, resultsResponse]);

  return (
    <Tooltip title={strings.EXPORT}>
      <Button onClick={onExport} icon='iconExport' type='passive' priority='ghost' />
    </Tooltip>
  );
}
