import { useCallback, useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { FileChooser } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import { MAX_FILES_LIMIT } from 'src/scenes/DeliverablesRouter/DeliverableView';
import strings from 'src/strings';

import FileUploadDialog from './FileUploadDialog';
import { ViewProps } from './types';

type DocumentUploaderProps = ViewProps & {
  canEdit?: boolean;
  showDocumentLimitReachedMessage?: () => void;
};

const DocumentsUploader = ({
  canEdit,
  deliverable,
  showDocumentLimitReachedMessage,
}: DocumentUploaderProps): JSX.Element => {
  const [files, setFiles] = useState<File[]>([]);
  const { activeLocale } = useLocalization();

  const documentLimitReached = useMemo(
    () => deliverable.documents.length >= MAX_FILES_LIMIT,
    [deliverable.documents.length]
  );

  const template = useMemo(() => {
    if (activeLocale && deliverable.templateUrl) {
      return { text: strings.DOWNLOAD_TEMPLATE, url: deliverable.templateUrl };
    } else {
      return undefined;
    }
  }, [activeLocale, deliverable.templateUrl]);

  const onCloseFileUploadDialog = useCallback(() => void setFiles([]), []);

  useEffect(() => {
    if (!canEdit && documentLimitReached && showDocumentLimitReachedMessage) {
      showDocumentLimitReachedMessage();
    }
  }, [canEdit, documentLimitReached, showDocumentLimitReachedMessage]);

  return (
    <Box display='flex' flexDirection='column'>
      {files.length > 0 && (
        <FileUploadDialog deliverable={deliverable} files={files} onClose={onCloseFileUploadDialog} />
      )}
      {!documentLimitReached && (
        <FileChooser
          acceptFileType='image/*,application/*'
          chooseFileText={strings.CHOOSE_FILE}
          maxFiles={canEdit ? undefined : MAX_FILES_LIMIT - deliverable.documents.length}
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
