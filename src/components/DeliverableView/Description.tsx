import { Box } from '@mui/material';
import { ViewProps } from './types';
import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';

const Description = (props: ViewProps): JSX.Element => {
  const { deliverable, isAcceleratorConsole } = props;

  return (
    <Box display='flex' flexDirection='column'>
      <div>
        {deliverable.status !== 'Rejected' && !isAcceleratorConsole && (
          <DeliverableStatusBadge status={deliverable.status} />
        )}
        Description coming soon!
      </div>
    </Box>
  );
};

export default Description;
