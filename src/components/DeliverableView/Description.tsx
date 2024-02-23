import { Box } from '@mui/material';
import { ViewProps } from './types';

const Description = (props: ViewProps): JSX.Element => {
  return (
    <Box display='flex' flexDirection='column'>
      <div>Description coming soon {props.isAcceleratorConsole}!</div>
    </Box>
  );
};

export default Description;
