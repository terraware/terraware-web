import { Box, Typography, useTheme } from '@mui/material';
import { FileChooser } from '@terraware/web-components';
import strings from 'src/strings';
import { ViewProps } from './types';

const DocumentsUploader = ({ deliverable }: ViewProps): JSX.Element => {
  const theme = useTheme();
  // const { activeLocale } = useLocalization();

  // TODO templateURL doesn't seem to exist in the deliverable
  // const template = useMemo(() => {
  //   if (activeLocale && deliverable.templateUrl) {
  //     return { text: strings.DOWNLOAD_TEMPLATE, url: deliverable.templateUrl };
  //   } else {
  //     return undefined;
  //   }
  // }, [activeLocale, deliverable.templateUrl]);

  return (
    <Box display='flex' flexDirection='column'>
      <Typography marginBottom={theme.spacing(2)} fontSize='20px' lineHeight='28px' fontWeight={600}>
        {strings.DOCUMENTS}
      </Typography>
      <FileChooser
        acceptFileType='image/*,application/*'
        chooseFileText={strings.CHOOSE_FILE}
        setFiles={(files: File[]) => window.alert(`${files.length} files selected`)}
        multipleSelection
        uploadDescription={strings.UPLOAD_FILES_DESCRIPTION}
        uploadText={strings.UPLOAD_FILES_TITLE}
        // template={template}
      />
    </Box>
  );
};

export default DocumentsUploader;
