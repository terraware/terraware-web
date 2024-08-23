import React, { useCallback, useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { DateTime } from 'luxon';

import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

import InternalComment from './InternalComment';
import { ViewProps } from './types';
import useUpdateDeliverable from './useUpdateDeliverable';

const Metadata = (props: ViewProps): JSX.Element => {
  const { deliverable, hideStatusBadge } = props;
  const { activeLocale } = useLocalization();

  const snackbar = useSnackbar();
  const theme = useTheme();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { status, update } = useUpdateDeliverable();

  const onUpdateInternalComment = useCallback(
    (internalComment: string) => {
      update({
        ...deliverable,
        status: deliverable.status === 'Overdue' ? 'Not Submitted' : deliverable.status,
        internalComment,
      });
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

  const dueDateText = useMemo(() => {
    if (!activeLocale || !deliverable.dueDate) {
      return '';
    }

    const dueDate = DateTime.fromISO(deliverable.dueDate).toFormat('yyyy-MM-dd');

    return strings.formatString(strings.DUE_DATE_PREFIX, dueDate).toString();
  }, [activeLocale, deliverable]);

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
          <div style={{ float: 'right', marginBottom: '8px', marginLeft: '16px', clear: 'both' }}>
            <DeliverableStatusBadge status={deliverable.status} />
          </div>
        )}

        <Typography
          fontWeight={400}
          fontSize={'16px'}
          lineHeight={'24px'}
          fontStyle={'italic'}
          style={{ clear: 'both' }}
        >
          {dueDateText}
        </Typography>

        <div dangerouslySetInnerHTML={{ __html: deliverable.descriptionHtml || '' }} />
      </Box>
    </Box>
  );
};

export default Metadata;
