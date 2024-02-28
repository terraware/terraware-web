import React from 'react';
import { Box, useTheme } from '@mui/material';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { ViewProps } from './types';
import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import strings from 'src/strings';

const Metadata = (props: ViewProps): JSX.Element => {
  const { deliverable } = props;
  const theme = useTheme();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  return (
    <Box display='flex' flexDirection='column'>
      {deliverable.status === 'Rejected' && (
        <Box
          border={`1px solid ${theme.palette.TwClrBaseGray100}`}
          borderRadius='8px'
          marginBottom='16px'
          padding='16px'
        >
          <DeliverableStatusBadge status={deliverable.status} />
          <strong>{strings.REASON}</strong> {deliverable.reason}
        </Box>
      )}

      {isAcceleratorRoute && (
        <Box
          border={`1px solid ${theme.palette.TwClrBaseGray100}`}
          borderRadius='8px'
          marginBottom='16px'
          padding='16px'
        >
          {deliverable.status !== 'Rejected' && <DeliverableStatusBadge status={deliverable.status} />}
          <strong>{strings.INTERNAL_COMMENTS}</strong> ?
        </Box>
      )}

      <Box marginBottom='16px'>
        {deliverable.status !== 'Rejected' && !isAcceleratorRoute && (
          <DeliverableStatusBadge status={deliverable.status} />
        )}

        <div dangerouslySetInnerHTML={{ __html: deliverable.deliverableContent }} />
      </Box>
    </Box>
  );
};

export default Metadata;
