import React, { useEffect } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';

import Button from 'src/components/common/button/Button';
import { selectSupportUploadAttachmentRequest } from 'src/redux/features/support/supportSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AttachmentRequest } from 'src/types/Support';

import AttachmentStatusBadge from './AttachmentStatusBadge';

type AttachmentRowProps = {
  attachment: AttachmentRequest;
  onChange?: (attachment: AttachmentRequest) => void;
  onRemove?: (attachment: AttachmentRequest) => void;
};

const AttachmentRow = ({ attachment, onChange, onRemove }: AttachmentRowProps) => {
  const theme = useTheme();

  const attachmentRequest = useAppSelector(selectSupportUploadAttachmentRequest(attachment.requestId));

  useEffect(() => {
    const temporaryAttachmentId =
      attachmentRequest.status === 'success' && attachmentRequest.data
        ? attachmentRequest.data[0].temporaryAttachmentId
        : undefined;

    const newAttachment = { ...attachment, status: attachmentRequest.status, temporaryAttachmentId };
    if (newAttachment !== attachment && onChange) {
      onChange(newAttachment);
    }
  }, [attachment, attachmentRequest, onChange]);

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
          label={strings.REMOVE}
          onClick={() => {
            onRemove && onRemove(attachment);
          }}
        />
      </Grid>
    </Grid>
  );
};

export default AttachmentRow;
