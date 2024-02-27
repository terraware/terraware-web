import { Box, useTheme } from '@mui/material';
import { ViewProps } from './types';
import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import strings from 'src/strings';

const StatusBar = (props: ViewProps): JSX.Element => {
  const { deliverable, isAcceleratorConsole } = props;
  const theme = useTheme();

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

      {isAcceleratorConsole && (
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
    </Box>
  );
};

export default StatusBar;
