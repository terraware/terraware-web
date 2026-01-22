import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';
import { Button, Message } from '@terraware/web-components';

import { ViewProps } from 'src/components/DeliverableView/types';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';

type Props = ViewProps & {
  showRejectDialog: () => void;
};

const RejectedDeliverableMessage = ({ deliverable, showRejectDialog }: Props): JSX.Element => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  return (
    <>
      {activeLocale && deliverable?.status === 'Rejected' && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={deliverable?.feedback || ''}
            pageButtons={[
              <Button
                icon='iconEdit'
                key={0}
                label={strings.EDIT_FEEDBACK}
                onClick={showRejectDialog}
                priority='secondary'
                size='small'
                type='passive'
              />,
            ]}
            priority='critical'
            title={isAcceleratorRoute ? strings.DELIVERABLE_UPDATE_REQUESTED : strings.DELIVERABLE_UPDATE_NEEDED}
            type='page'
          />
        </Box>
      )}
    </>
  );
};

export default RejectedDeliverableMessage;
