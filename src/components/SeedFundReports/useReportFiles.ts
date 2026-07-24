import React, { useEffect, useMemo } from 'react';

import { useListReportFilesQuery } from 'src/queries/generated/seedFundReports';
import { SeedFundReport, SeedFundReportFile } from 'src/types/SeedFundReport';
import useSnackbar from 'src/utils/useSnackbar';

export default function useReportFiles(
  report?: SeedFundReport,
  setUpdatedReportFiles?: React.Dispatch<React.SetStateAction<SeedFundReportFile[]>>
): SeedFundReportFile[] {
  const snackbar = useSnackbar();
  const response = useListReportFilesQuery(report?.id as number, { skip: !report });

  const initialReportFiles: SeedFundReportFile[] = useMemo(
    () => response.currentData?.files ?? [],
    [response.currentData]
  );

  useEffect(() => {
    if (response.isError) {
      snackbar.toastError();
    }
  }, [response.isError, snackbar]);

  useEffect(() => {
    if (response.currentData && setUpdatedReportFiles) {
      setUpdatedReportFiles(initialReportFiles);
    }
  }, [initialReportFiles, response.currentData, setUpdatedReportFiles]);

  return initialReportFiles;
}
