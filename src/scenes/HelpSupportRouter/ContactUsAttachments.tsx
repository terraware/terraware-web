import React, { type JSX, useCallback, useMemo, useRef, useState } from 'react';

import { Grid } from '@mui/material';
import { FileChooser } from '@terraware/web-components';

import strings from 'src/strings';
import { AttachmentRequest } from 'src/types/Support';

import AttachmentLimitReachedMessage from './AttachmentLimitReachedMessage';
import AttachmentRow from './AttachmentRow';

type AttachmentsProps = {
  maxFiles?: number;
  onChange?: (attachments: AttachmentRequest[]) => void;
};

const ContactUsAttachments = ({ maxFiles, onChange }: AttachmentsProps): JSX.Element => {
  const [attachments, setAttachments] = useState<AttachmentRequest[]>([]);
  const filesById = useRef<Record<string, File>>({});

  const handleFiles = useCallback((newFiles: File[]) => {
    const newAttachments = newFiles.map((file): AttachmentRequest => {
      const id = crypto.randomUUID();
      filesById.current[id] = file;
      return { filename: file.name, requestId: id };
    });
    setAttachments((existing) => [...existing, ...newAttachments]);
  }, []);

  const removeAttachment = useCallback(
    (attachment: AttachmentRequest) => {
      delete filesById.current[attachment.requestId];
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
          file={filesById.current[attachment.requestId]}
          onRemove={removeAttachment}
          onChange={handleUpdate}
        />
      ))}
    </>
  );
};

export default ContactUsAttachments;
