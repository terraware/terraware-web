import { Box } from '@mui/material';
import { ViewProps } from './types';

const DocumentsList = (props: ViewProps): JSX.Element => {
  return (
    <Box display='flex' flexDirection='column'>
      DocumentsList coming soon {props.isAcceleratorConsole}!
    </Box>
  );
};

export default DocumentsList;
