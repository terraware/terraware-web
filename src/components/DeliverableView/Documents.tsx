import { Box } from '@mui/material';
import { ViewProps } from './types';
import DocumentsUploader from './DocumentsUploader';
import DocumentsList from './DocumentsList';

const Documents = (props: ViewProps): JSX.Element => {
  return (
    <Box display='flex' flexDirection='column'>
      <DocumentsUploader {...props} />
      <DocumentsList {...props} />
    </Box>
  );
};

export default Documents;
