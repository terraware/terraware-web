import { Box } from '@mui/material';
import { useRouteMatch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import DocumentsList from 'src/scenes/DeliverablesRouter/DocumentsList';
import AcceleratorDocumentsList from 'src/scenes/AcceleratorRouter/AcceleratorDocumentsList';
import { ViewProps } from './types';
import DocumentsUploader from './DocumentsUploader';

const Documents = (props: ViewProps): JSX.Element => {
  const isAcceleratorRoute = useRouteMatch(APP_PATHS.ACCELERATOR);

  return (
    <Box display='flex' flexDirection='column'>
      <DocumentsUploader {...props} />
      {isAcceleratorRoute ? <AcceleratorDocumentsList {...props} /> : <DocumentsList {...props} />}
    </Box>
  );
};

export default Documents;
