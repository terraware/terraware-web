import React, { type JSX, useCallback, useEffect } from 'react';

import { Box, useTheme } from '@mui/material';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import { useUser } from 'src/providers';
import { AcceleratorReportPayload, useReviewAcceleratorReportMutation } from 'src/queries/generated/reports';
import strings from 'src/strings';
import { AcceleratorReportStatus } from 'src/types/AcceleratorReport';
import useSnackbar from 'src/utils/useSnackbar';

import InternalComment from './InternalComment';

export type MetadataProps = {
  report: AcceleratorReportPayload;
  projectId: number;
};

const Metadata = (props: MetadataProps): JSX.Element => {
  const { report, projectId } = props;

  const [reviewReport, reviewReportResponse] = useReviewAcceleratorReportMutation();

  const theme = useTheme();
  const { isAllowed } = useUser();
  const snackbar = useSnackbar();

  useEffect(() => {
    if (reviewReportResponse.isError) {
      snackbar.toastError();
    } else if (reviewReportResponse.isSuccess) {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    }
  }, [snackbar, reviewReportResponse.isError, reviewReportResponse.isSuccess]);

  const onUpdateInternalComment = useCallback(
    (internalComment: string, status: AcceleratorReportStatus) => {
      void reviewReport({
        reportId: report.id,
        projectId,
        reviewAcceleratorReportRequestPayload: {
          review: {
            ...report,
            internalComment,
            status,
          },
        },
      });
    },
    [reviewReport, report, projectId]
  );

  return (
    <Box display='flex' flexDirection='column'>
      <Box border={`1px solid ${theme.palette.TwClrBaseGray100}`} borderRadius='8px' marginBottom='16px' padding='16px'>
        {report.status !== 'Needs Update' && (
          <div style={{ float: 'right', marginBottom: '0px', marginLeft: '16px' }}>
            <AcceleratorReportStatusBadge status={report.status} />
          </div>
        )}
        <InternalComment entity={report} update={onUpdateInternalComment} disabled={!isAllowed('EDIT_REPORTS')} />
      </Box>
    </Box>
  );
};

export default Metadata;
