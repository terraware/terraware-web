import React from 'react';
import { Box, useTheme } from '@mui/material';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import { ViewProps } from './types';
import InternalComment from './InternalComment';

const Metadata = (props: ViewProps): JSX.Element => {
  const { deliverable } = props;
  const theme = useTheme();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  return (
    <Box display='flex' flexDirection='column'>
      {isAcceleratorRoute && (
        <Box
          border={`1px solid ${theme.palette.TwClrBaseGray100}`}
          borderRadius='8px'
          marginBottom='16px'
          padding='16px'
        >
          <InternalComment deliverable={deliverable} />

          {deliverable.status !== 'Rejected' && <DeliverableStatusBadge status={deliverable.status} />}
        </Box>
      )}

      <Box marginBottom='16px'>
        {deliverable.status !== 'Rejected' && !isAcceleratorRoute && (
          <DeliverableStatusBadge status={deliverable.status} />
        )}

        <div dangerouslySetInnerHTML={{ __html: deliverable.descriptionHtml || '' }} />
      </Box>
    </Box>
  );
};

export default Metadata;
