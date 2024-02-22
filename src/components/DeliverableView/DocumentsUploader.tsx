import { Box } from '@mui/material';
import { ViewProps } from './types';

const DocumentsUploader = (props: ViewProps): JSX.Element => {
  return (
    <Box display='flex' flexDirection='column'>
      DocumentsUploader coming soon {props.isAcceleratorConsole}!
    </Box>
  );
};

export default DocumentsUploader;
