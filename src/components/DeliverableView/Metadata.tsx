import React, { useCallback, useEffect } from 'react';

import { Box, useTheme } from '@mui/material';

import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

import InternalComment from './InternalComment';
import { ViewProps } from './types';
import useUpdateDeliverable from './useUpdateDeliverable';

const Metadata = (props: ViewProps): JSX.Element => {
  const { deliverable, hideStatusBadge } = props;

  const snackbar = useSnackbar();
  const theme = useTheme();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { status, update } = useUpdateDeliverable();

  const onUpdateInternalComment = useCallback(
    (internalComment: string) => {
      update({ ...deliverable, internalComment });
    },
    [deliverable]
  );

  useEffect(() => {
    if (status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    } else if (status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [status, snackbar]);

  return (
    <Box display='flex' flexDirection='column'>
      {isAcceleratorRoute && (
        <Box
          border={`1px solid ${theme.palette.TwClrBaseGray100}`}
          borderRadius='8px'
          marginBottom='16px'
          padding='16px'
        >
          {deliverable.status !== 'Rejected' && (
            <div style={{ float: 'right', marginBottom: '0px', marginLeft: '16px' }}>
              <DeliverableStatusBadge status={deliverable.status} />
            </div>
          )}
          <InternalComment entity={deliverable} update={onUpdateInternalComment} />
        </Box>
      )}

      <Box marginBottom='16px'>
        {deliverable.status !== 'Rejected' && !isAcceleratorRoute && hideStatusBadge !== true && (
          <div style={{ float: 'right', marginBottom: '0px', marginLeft: '16px' }}>
            <DeliverableStatusBadge status={deliverable.status} />
          </div>
        )}

        <div dangerouslySetInnerHTML={{ __html: deliverable.descriptionHtml || '' }} />
      </Box>
    </Box>
  );
};

export default Metadata;
