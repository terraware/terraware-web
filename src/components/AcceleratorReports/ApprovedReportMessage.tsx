import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';
import { AcceleratorReport } from 'src/types/AcceleratorReport';

type ApprovedReportMessageProps = {
  report: AcceleratorReport;
};

const ApprovedReportMessage = ({ report }: ApprovedReportMessageProps): JSX.Element | null => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  if (!(activeLocale && report?.status === 'Approved')) {
    return null;
  }

  return (
    <>
      <Box marginBottom={theme.spacing(4)}>
        <Message
          body={strings.THIS_REPORT_HAS_BEEN_APPROVED}
          priority='success'
          title={strings.REPORT_APPROVED}
          type='page'
        />
      </Box>
    </>
  );
};

export default ApprovedReportMessage;
