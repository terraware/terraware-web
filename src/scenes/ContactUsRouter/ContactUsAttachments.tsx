import React, { useCallback, useState } from 'react';

import { Grid } from '@mui/material';
import { FileChooser } from '@terraware/web-components';

import { requestUploadAttachment } from 'src/redux/features/support/supportAsyncThunks';
import { useAppDispatch } from 'src/redux/store';
import strings from 'src/strings';
import { AttachmentRequest } from 'src/types/Support';

import AttachmentRow from './AttachmentRow';

type AttachmentsProps = {
  maxFiles?: number;
  onChange?: (attachments: AttachmentRequest[]) => void;
};

const ContactUsAttachments = ({ maxFiles, onChange }: AttachmentsProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [attachments, setAttachments] = useState<AttachmentRequest[]>([]);

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      const newAttachments = newFiles.map((file) => {
        const dispatched = dispatch(requestUploadAttachment(file));
        return { filename: file.name, requestId: dispatched.requestId };
      });
      setAttachments([...attachments, ...newAttachments]);
    },
    [attachments]
  );

  const removeAttachment = useCallback(
    (attachment: AttachmentRequest) => {
      const newAttachments = attachments.filter((existing) => existing.requestId !== attachment.requestId);
      setAttachments(newAttachments);
      if (onChange) {
        onChange(newAttachments);
      }
    },
    [attachments, onChange]
  );

  const handleUpdate = useCallback(
    (attachment: AttachmentRequest) => {
      const newAttachments = attachments.map((existing) =>
        existing.requestId === attachment.requestId ? attachment : existing
      );
      setAttachments(newAttachments);
      if (onChange) {
        onChange(newAttachments);
      }
    },
    [attachments, onChange]
  );

  return (
    <>
      <Grid item xs={12}>
        <FileChooser
          chooseFileText={strings.CHOOSE_FILE}
          maxFiles={maxFiles}
          multipleSelection
          setFiles={handleFiles}
          uploadDescription={strings.UPLOAD_FILES_DESCRIPTION}
          uploadText={strings.UPLOAD_FILES_TITLE}
        />
      </Grid>
      {attachments.map((attachment) => (
        <AttachmentRow
          key={attachment.requestId}
          attachment={attachment}
          onRemove={removeAttachment}
          onChange={handleUpdate}
        />
      ))}
    </>
  );
};

export default ContactUsAttachments;
