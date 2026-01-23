import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Grid } from '@mui/material';
import { FileChooser } from '@terraware/web-components';

import { requestUploadAttachment } from 'src/redux/features/support/supportAsyncThunks';
import { useAppDispatch } from 'src/redux/store';
import strings from 'src/strings';
import { AttachmentRequest } from 'src/types/Support';

import AttachmentLimitReachedMessage from './AttachmentLimitReachedMessage';
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
    [attachments, dispatch]
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

  const attachmentLimitReached = useMemo(
    () => (maxFiles ? attachments.length >= maxFiles : false),
    [attachments.length, maxFiles]
  );

  return (
    <>
      <Grid item xs={12}>
        {!attachmentLimitReached && (
          <FileChooser
            acceptFileType={'image/*, video/*'}
            chooseFileText={strings.CHOOSE_FILE}
            maxFiles={maxFiles}
            multipleSelection
            setFiles={handleFiles}
            uploadDescription={strings.UPLOAD_FILES_DESCRIPTION}
            uploadText={strings.ATTACH_IMAGES_OR_VIDEOS}
          />
        )}
        {attachmentLimitReached && maxFiles && <AttachmentLimitReachedMessage maxFiles={maxFiles} />}
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
