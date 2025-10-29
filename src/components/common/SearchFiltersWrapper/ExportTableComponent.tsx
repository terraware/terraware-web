import React, { useCallback, useEffect, useState } from 'react';

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
  const [alreadyDownloaded, setAlreadyDownloaded] = useState<boolean>(false);

  const downloadResults = useCallback(
    async (results: CsvData[]) => {
      if (alreadyDownloaded) {
        return;
      }

      const data: CsvData[] = convertRow ? results.map((row) => convertRow(row)) : results;
      const fileBlob = makeCsv(columnHeaders, data);
      const fileContents = await fileBlob.text();

      downloadCsv(filename || 'export', fileContents);
      setAlreadyDownloaded(true);
    },
    [alreadyDownloaded, columnHeaders, convertRow, filename]
  );

  const downloadDirectly = useCallback(async () => {
    const results: CsvData[] = (await retrieveResults?.()) || [];
    if (results.length === 0) {
      return;
    }

    await downloadResults(results);
  }, [downloadResults, retrieveResults]);

  const onExport = useCallback(() => {
    setAlreadyDownloaded(false);
    if (retrieveResults) {
      void downloadDirectly();
    } else if (requestResults) {
      requestResults();
    }
  }, [retrieveResults, requestResults, downloadDirectly]);

  useEffect(() => {
    // For Redux components: listen for response and download when ready
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
