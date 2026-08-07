import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import isEnabled from 'src/features';
import { useLocalization } from 'src/providers/hooks';
import { AcceleratorReportPayload } from 'src/queries/generated/reports';
import strings from 'src/strings';

type ApprovedReportMessageProps = {
  report: AcceleratorReportPayload;
};

const ApprovedReportMessage = ({ report }: ApprovedReportMessageProps): JSX.Element | null => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const newReportTabEnabled = isEnabled('Report Updates July 2026');

  if (!(activeLocale && report?.status === 'Approved')) {
    return null;
  }

  return (
    <>
      <Box marginBottom={theme.spacing(newReportTabEnabled ? 2 : 4)}>
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
