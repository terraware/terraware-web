import { Box } from '@mui/material';
import { ViewProps } from './types';

const StatusBar = (props: ViewProps): JSX.Element => {
  return (
    <Box display='flex' flexDirection='column'>
      <div>StatusBar coming soon {props.isAcceleratorConsole}!</div>
    </Box>
  );
};

export default StatusBar;
