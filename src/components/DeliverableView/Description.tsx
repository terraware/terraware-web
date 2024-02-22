import { Box } from '@mui/material';
import { ViewProps } from './types';

const Description = (props: ViewProps): JSX.Element => {
  return (
    <Box display='flex' flexDirection='column'>
      Description coming soon {props.isAcceleratorConsole}!
    </Box>
  );
};

export default Description;
