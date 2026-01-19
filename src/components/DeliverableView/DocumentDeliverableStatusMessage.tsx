import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import { ViewProps } from 'src/components/DeliverableView/types';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers/hooks';

const DocumentDeliverableStatusMessage = ({ deliverable }: ViewProps): JSX.Element => {
  const { strings } = useLocalization();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const theme = useTheme();

  return (
    <>
      {deliverable?.status === 'Approved' && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={isAcceleratorRoute ? '' : strings.THIS_DELIVERABLE_HAS_BEEN_APPROVED_DOCUMENT}
            priority='success'
            title={strings.DELIVERABLE_APPROVED}
            type='page'
          />
        </Box>
      )}

      {deliverable?.status === 'Rejected' && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={deliverable?.feedback || ''}
            priority='critical'
            title={isAcceleratorRoute ? strings.DELIVERABLE_UPDATE_REQUESTED : strings.DELIVERABLE_UPDATE_NEEDED}
            type='page'
          />
        </Box>
      )}
    </>
  );
};

export default DocumentDeliverableStatusMessage;
