import React, { useEffect, useRef } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Button from 'src/components/common/button/Button';
import { useUploadAttachmentMutation } from 'src/queries/generated/support';
import { Statuses } from 'src/redux/features/asyncUtils';
import strings from 'src/strings';
import { AttachmentRequest } from 'src/types/Support';

import AttachmentStatusBadge from './AttachmentStatusBadge';

type AttachmentRowProps = {
  attachment: AttachmentRequest;
  file: File;
  onChange?: (attachment: AttachmentRequest) => void;
  onRemove?: (attachment: AttachmentRequest) => void;
};

const AttachmentRow = ({ attachment, file, onChange, onRemove }: AttachmentRowProps) => {
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();

  const { filename, requestId } = attachment;

  const [upload, uploadResult] = useUploadAttachmentMutation();
  const uploadStarted = useRef(false);

  useEffect(() => {
    if (!uploadStarted.current) {
      uploadStarted.current = true;
      void upload({ file });
    }
  }, [upload, file]);

  useEffect(() => {
    const status: Statuses = uploadResult.isSuccess ? 'success' : uploadResult.isError ? 'error' : 'pending';
    const temporaryAttachmentId = uploadResult.isSuccess
      ? uploadResult.data.attachments[0]?.temporaryAttachmentId
      : undefined;

    const newAttachment: AttachmentRequest = {
      filename,
      requestId,
      status,
      temporaryAttachmentId,
    };
    if (newAttachment.status !== attachment.status && onChange) {
      onChange(newAttachment);
    }
  }, [uploadResult, onChange, attachment.status, filename, requestId]);

  return (
    <Grid
      container
      columnSpacing={theme.spacing(2)}
      marginTop={theme.spacing(2)}
      alignItems={'center'}
      justifyContent={'flex-start'}
      flexWrap={'nowrap'}
    >
      <Grid item flexGrow={0}>
        <AttachmentStatusBadge status={attachment.status ?? 'pending'} />
      </Grid>
      <Grid item flexBasis={'content'} flexGrow={0} overflow={'hidden'} textOverflow={'ellipsis'}>
        <Typography
          display={'inline'}
          fontSize={'16px'}
          fontWeight={600}
          lineHeight={'24px'}
          paddingInlineEnd={theme.spacing(2)}
          whiteSpace={'nowrap'}
        >
          {attachment.filename}
        </Typography>
      </Grid>
      <Grid item flexGrow={0} marginLeft={'auto'}>
        <Button
          priority={'secondary'}
          icon={'iconTrashCan'}
          label={isDesktop ? strings.REMOVE : undefined}
          onClick={() => onRemove && onRemove(attachment)}
        />
      </Grid>
    </Grid>
  );
};

export default AttachmentRow;
