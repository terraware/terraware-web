import { useCallback, useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { FileChooser } from '@terraware/web-components';
import strings from 'src/strings';
import { useLocalization } from 'src/providers';
import useUpdateDeliverable from 'src/scenes/AcceleratorRouter/useUpdateDeliverable';
import { ViewProps } from './types';

const DocumentsUploader = ({ deliverable }: ViewProps): JSX.Element => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { update } = useUpdateDeliverable();

  const template = useMemo(() => {
    if (activeLocale && deliverable.templateUrl) {
      return { text: strings.DOWNLOAD_TEMPLATE, url: deliverable.templateUrl };
    } else {
      return undefined;
    }
  }, [activeLocale, deliverable.templateUrl]);

  const setFiles = useCallback(
    (files: File[]) => {
      window.alert(`${files.length} files selected`);
      update({ ...deliverable, status: 'In Review' });
    },
    [deliverable, update]
  );

  return (
    <Box display='flex' flexDirection='column'>
      <Typography marginBottom={theme.spacing(2)} fontSize='20px' lineHeight='28px' fontWeight={600}>
        {strings.DOCUMENTS}
      </Typography>
      <FileChooser
        acceptFileType='image/*,application/*'
        chooseFileText={strings.CHOOSE_FILE}
        setFiles={setFiles}
        multipleSelection
        uploadDescription={strings.UPLOAD_FILES_DESCRIPTION}
        uploadText={strings.UPLOAD_FILES_TITLE}
        template={template}
      />
    </Box>
  );
};

export default DocumentsUploader;
