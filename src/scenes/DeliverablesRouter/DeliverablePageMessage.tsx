import React from 'react';
import { Box, useTheme } from '@mui/material';
import { Button, Message } from '@terraware/web-components';
import { ViewProps } from 'src/components/DeliverableView/types';
import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';

const DeliverableView = (props: ViewProps): JSX.Element => {
  const { deliverable, isAcceleratorConsole } = props;
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const onClickEditReason = () => {
    alert('TODO: Edit rejection reason');
  };

  return (
    <>
      {activeLocale && deliverable?.status === 'Rejected' && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={deliverable?.reason || ''}
            pageButtons={
              isAcceleratorConsole
                ? [
                    <Button
                      icon='iconEdit'
                      key={0}
                      label={strings.EDIT_REASON}
                      onClick={onClickEditReason}
                      priority='secondary'
                      size='small'
                      type='passive'
                    />,
                  ]
                : undefined
            }
            priority='critical'
            title={strings.DELIVERABLE_REJECTED}
            type='page'
          />
        </Box>
      )}
    </>
  );
};

export default DeliverableView;
