import { useCallback, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { FileChooser } from '@terraware/web-components';

import StatusChangeConfirmationDialog from 'src/components/DeliverableView/StatusChangeConfirmationDialog';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import FileUploadDialog from './FileUploadDialog';
import { ViewProps } from './types';

const DocumentsUploader = ({ deliverable }: ViewProps): JSX.Element => {
  const [files, setFiles] = useState<File[]>([]);
  const [statusChangeConfirmed, setStatusChangeConfirmed] = useState(false);
  const { activeLocale } = useLocalization();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const template = useMemo(() => {
    if (activeLocale && deliverable.templateUrl) {
      return { text: strings.DOWNLOAD_TEMPLATE, url: deliverable.templateUrl };
    } else {
      return undefined;
    }
  }, [activeLocale, deliverable.templateUrl]);

  // determine if the status change confirmation dialog is needed
  const showStatusChangeDialog = useMemo(() => {
    // if the status change has already been confirmed, don't show the dialog
    if (statusChangeConfirmed) {
      return false;
    }

    // participant view
    if (!isAcceleratorRoute && !['Not Submitted', 'In Review', 'Needs Translation'].includes(deliverable.status)) {
      return true;
    }

    // accelerator view
    if (isAcceleratorRoute && !['Not Submitted', 'In Review'].includes(deliverable.status)) {
      return true;
    }

    // default
    return false;
  }, [deliverable.status, isAcceleratorRoute, statusChangeConfirmed]);

  const onCloseDialog = useCallback(() => {
    setStatusChangeConfirmed(false);
    setFiles([]);
  }, []);

  const onConfirmStatusChangeDialog = useCallback(() => {
    setStatusChangeConfirmed(true);
  }, []);

  return (
    <Box display='flex' flexDirection='column'>
      {files.length > 0 &&
        (showStatusChangeDialog ? (
          <StatusChangeConfirmationDialog onClose={onCloseDialog} onConfirm={onConfirmStatusChangeDialog} />
        ) : (
          <FileUploadDialog deliverable={deliverable} files={files} onClose={onCloseDialog} />
        ))}
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
