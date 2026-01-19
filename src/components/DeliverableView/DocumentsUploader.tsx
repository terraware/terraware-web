import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { FileChooser } from '@terraware/web-components';

import StatusChangeConfirmationDialog from 'src/components/DeliverableView/StatusChangeConfirmationDialog';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { DeliverableStatusTypeWithOverdue } from 'src/types/Deliverables';

import FileUploadDialog from './FileUploadDialog';
import { ViewProps } from './types';

type DocumentUploaderProps = ViewProps & {
  deliverableStatusesToIgnore: DeliverableStatusTypeWithOverdue[];
  maxFiles?: number;
};

const DocumentsUploader = ({
  deliverable,
  deliverableStatusesToIgnore,
  maxFiles,
}: DocumentUploaderProps): JSX.Element => {
  const [files, setFiles] = useState<File[]>([]);
  const [statusChangeConfirmed, setStatusChangeConfirmed] = useState(false);
  const { activeLocale } = useLocalization();

  const template = useMemo(() => {
    if (activeLocale && deliverable.templateUrl) {
      return { text: strings.DOWNLOAD_TEMPLATE, url: deliverable.templateUrl };
    } else {
      return undefined;
    }
  }, [activeLocale, deliverable.templateUrl]);

  const showStatusChangeDialog = useMemo(() => {
    // if the status change has already been confirmed, don't show the dialog
    if (statusChangeConfirmed) {
      return false;
    }

    // if the deliverable status is *not* in the list of statuses that do not require confirmation, show the dialog
    if (!deliverableStatusesToIgnore.includes(deliverable.status)) {
      return true;
    }

    // default
    return false;
  }, [deliverable.status, deliverableStatusesToIgnore, statusChangeConfirmed]);

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
        chooseFileText={strings.CHOOSE_FILE}
        maxFiles={maxFiles}
        multipleSelection
        setFiles={setFiles}
        template={template}
        uploadDescription={strings.UPLOAD_FILES_DESCRIPTION}
        uploadText={strings.UPLOAD_FILES_TITLE}
      />
    </Box>
  );
};

export default DocumentsUploader;
