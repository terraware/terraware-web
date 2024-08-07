import React from 'react';

import { Box, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import { ViewProps } from 'src/components/DeliverableView/types';
import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';

const DocumentDeliverableRejectedMessage = ({ deliverable }: ViewProps): JSX.Element => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  return (
    <>
      {activeLocale && deliverable?.status === 'Rejected' && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={deliverable?.feedback || ''}
            priority='critical'
            title={strings.DELIVERABLE_NOT_ACCEPTED}
            type='page'
          />
        </Box>
      )}
    </>
  );
};

export default DocumentDeliverableRejectedMessage;
