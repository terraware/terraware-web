import React from 'react';

import { Box, useTheme } from '@mui/material';

import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';

import InternalComment from './InternalComment';
import { ViewProps } from './types';

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

          <div style={{ float: 'right', marginBottom: '0px', marginLeft: '16px' }}>
            {deliverable.status !== 'Rejected' && <DeliverableStatusBadge status={deliverable.status} />}
          </div>
        </Box>
      )}

      <Box marginBottom='16px'>
        <div style={{ float: 'right', marginBottom: '0px', marginLeft: '16px' }}>
          {deliverable.status !== 'Rejected' && !isAcceleratorRoute && (
            <DeliverableStatusBadge status={deliverable.status} />
          )}
        </div>

        <div dangerouslySetInnerHTML={{ __html: deliverable.descriptionHtml || '' }} />
      </Box>
    </Box>
  );
};

export default Metadata;
