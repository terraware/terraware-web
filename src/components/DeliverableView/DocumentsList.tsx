import { Box } from '@mui/material';
import { ViewProps } from './types';

const DocumentsList = (props: ViewProps): JSX.Element => {
  return (
    <Box display='flex' flexDirection='column'>
      <div>DocumentsList coming soon {props.isAcceleratorConsole}!</div>
    </Box>
  );
};

export default DocumentsList;
