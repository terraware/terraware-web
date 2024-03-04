import React, { useEffect, useState } from 'react';

import ReportService from 'src/services/ReportService';
import { Report, ReportFile } from 'src/types/Report';
import useSnackbar from 'src/utils/useSnackbar';

export default function useReportFiles(
  report?: Report,
  setUpdatedReportFiles?: React.Dispatch<React.SetStateAction<ReportFile[]>>
): ReportFile[] {
  const snackbar = useSnackbar();
  const [initialReportFiles, setInitialReportFiles] = useState<ReportFile[]>([]);
  useEffect(() => {
    const getFiles = async () => {
      if (report) {
        const fileListResponse = await ReportService.getReportFiles(report.id);
        if (!fileListResponse.requestSucceeded) {
          setInitialReportFiles([]);
          snackbar.toastError();
        } else {
          const fileArray: ReportFile[] = [];
          fileListResponse.files?.forEach((f) => {
            fileArray.push(f);
          });

          setInitialReportFiles(fileArray);
          if (setUpdatedReportFiles) {
            setUpdatedReportFiles(fileArray);
          }
        }
      }
    };

    getFiles();
  }, [report, snackbar, setUpdatedReportFiles]);

  return initialReportFiles;
}
