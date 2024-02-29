import React from 'react';
import { Box, useTheme } from '@mui/material';
import { Button, Message } from '@terraware/web-components';
import { ViewProps } from 'src/components/DeliverableView/types';
import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';

const RejectedDeliverableMessage = ({ deliverable }: ViewProps): JSX.Element => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const onClickEditFeedback = () => {
    alert('TODO: Edit rejection feedback');
  };

  return (
    <>
      {activeLocale && deliverable?.status === 'Rejected' && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={deliverable?.reason || ''}
            pageButtons={[
              <Button
                icon='iconEdit'
                key={0}
                label={strings.EDIT_FEEDBACK}
                onClick={onClickEditFeedback}
                priority='secondary'
                size='small'
                type='passive'
              />,
            ]}
            priority='critical'
            title={strings.DELIVERABLE_REJECTED}
            type='page'
          />
        </Box>
      )}
    </>
  );
};

export default RejectedDeliverableMessage;
