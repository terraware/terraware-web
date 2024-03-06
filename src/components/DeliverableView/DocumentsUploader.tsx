import { useCallback, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { FileChooser } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import FileUploadDialog from './FileUploadDialog';
import { ViewProps } from './types';

type DocumentUploaderProps = ViewProps & {
  maxFiles?: number;
};

const DocumentsUploader = ({ deliverable, maxFiles }: DocumentUploaderProps): JSX.Element => {
  const [files, setFiles] = useState<File[]>([]);
  const { activeLocale } = useLocalization();

  const documentLimitReached = useMemo(
    () => (maxFiles ? deliverable.documents.length >= maxFiles : false),
    [deliverable.documents.length, maxFiles]
  );

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
      {!documentLimitReached && (
        <FileChooser
          acceptFileType='image/*,application/*'
          chooseFileText={strings.CHOOSE_FILE}
          maxFiles={maxFiles}
          multipleSelection
          setFiles={setFiles}
          template={template}
          uploadDescription={strings.UPLOAD_FILES_DESCRIPTION}
          uploadText={strings.UPLOAD_FILES_TITLE}
        />
      )}
    </Box>
  );
};

export default DocumentsUploader;
