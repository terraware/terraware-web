import React from 'react';

import { Box, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import { ViewProps } from 'src/components/DeliverableView/types';
import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';

const ApprovedDeliverableMessage = ({ deliverable }: ViewProps): JSX.Element | null => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  if (!(activeLocale && deliverable?.status === 'Approved')) {
    return null;
  }

  return (
    <>
      <Box marginBottom={theme.spacing(4)}>
        <Message
          body={strings.THIS_DELIVERABLE_HAS_BEEN_APPROVED}
          priority='success'
          title={strings.DELIVERABLE_APPROVED}
          type='page'
        />
      </Box>
    </>
  );
};

export default ApprovedDeliverableMessage;
