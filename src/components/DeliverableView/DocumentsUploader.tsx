import { useCallback, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { FileChooser } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import FileUploadDialog from './FileUploadDialog';
import { ViewProps } from './types';

const DocumentsUploader = ({ deliverable }: ViewProps): JSX.Element => {
  const [files, setFiles] = useState<File[]>([]);
  const { activeLocale } = useLocalization();

  const template = useMemo(() => {
    if (activeLocale && deliverable.templateUrl) {
      return { text: strings.DOWNLOAD_TEMPLATE, url: deliverable.templateUrl };
    } else {
      return undefined;
    }
  }, [activeLocale, deliverable.templateUrl]);

  const onCloseFileUploadDialog = useCallback(() => void setFiles([]), []);

  return (
    <Box display='flex' flexDirection='column'>
      {files.length > 0 && (
        <FileUploadDialog deliverable={deliverable} files={files} onClose={onCloseFileUploadDialog} />
      )}
      <FileChooser
        acceptFileType='image/*,application/*'
        chooseFileText={strings.CHOOSE_FILE}
        setFiles={setFiles}
        maxFiles={15 - deliverable.documents.length}
        multipleSelection
        uploadDescription={strings.UPLOAD_FILES_DESCRIPTION}
        uploadText={strings.UPLOAD_FILES_TITLE}
        template={template}
      />
    </Box>
  );
};

export default DocumentsUploader;
