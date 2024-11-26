import React from 'react';

import { Box, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import { ViewProps } from 'src/components/DeliverableView/types';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';

const DocumentDeliverableRejectedMessage = ({ deliverable }: ViewProps): JSX.Element => {
  const { activeLocale } = useLocalization();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const theme = useTheme();

  return (
    <>
      {activeLocale && deliverable?.status === 'Rejected' && (
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

export default DocumentDeliverableRejectedMessage;
