import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';
import { Button, Message } from '@terraware/web-components';

import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';
import { AcceleratorReport } from 'src/types/AcceleratorReport';

type RejectedReportMessageProps = {
  report: AcceleratorReport;
  showRejectDialog?: () => void;
};

const RejectedReportMessage = ({ report, showRejectDialog }: RejectedReportMessageProps): JSX.Element => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  return (
    <>
      {activeLocale && report?.status === 'Needs Update' && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={report?.feedback || ''}
            pageButtons={
              showRejectDialog
                ? [
                    <Button
                      icon='iconEdit'
                      key={0}
                      label={strings.EDIT_FEEDBACK}
                      onClick={showRejectDialog}
                      priority='secondary'
                      size='small'
                      type='passive'
                    />,
                  ]
                : undefined
            }
            priority='critical'
            title={strings.REPORT_NEEDS_UPDATE}
            type='page'
          />
        </Box>
      )}
    </>
  );
};

export default RejectedReportMessage;
