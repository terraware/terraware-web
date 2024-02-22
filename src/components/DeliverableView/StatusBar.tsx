import { Box } from '@mui/material';
import { ViewProps } from './types';

const StatusBar = (props: ViewProps): JSX.Element => {
  return (
    <Box display='flex' flexDirection='column'>
      StatusBar coming soon {props.isAcceleratorConsole}!
    </Box>
  );
};

export default StatusBar;
