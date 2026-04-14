import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import { useDocLinks } from 'src/docLinks';
import strings from 'src/strings';

type VirtualWalkthroughMessagesProps = {
  processingCount?: number;
  hasUploadFailed?: boolean;
  hasUnableToProcess?: boolean;
  onRetry?: () => void;
  onRetryUpload?: () => void;
  onUploadNew?: () => void;
};

const VirtualWalkthroughMessages = ({
  processingCount = 0,
  hasUploadFailed = false,
  hasUnableToProcess = false,
  onRetry,
  onRetryUpload,
  onUploadNew,
}: VirtualWalkthroughMessagesProps): JSX.Element | null => {
  const theme = useTheme();
  const docLinks = useDocLinks();

  if (!processingCount && !hasUploadFailed && !hasUnableToProcess) {
    return null;
  }

  const knowledgeBaseLink = (
    <Link fontSize='16px' fontWeight={400} to={docLinks.knowledge_base} target='_blank' style={{ display: 'inline' }}>
      {strings.KNOWLEDGE_BASE}
    </Link>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(2), marginBottom: theme.spacing(2) }}>
      {hasUploadFailed && (
        <Message
          title={strings.VIDEO_UPLOAD_FAILED}
          body={
            <Typography fontSize='16px' component='span' sx={{ display: 'inline' }}>
              {strings.formatString(
                strings.VIDEO_UPLOAD_FAILED_DESCRIPTION,
                onRetry ? (
                  <Link fontSize='16px' fontWeight={400} onClick={onRetry} style={{ display: 'inline' }}>
                    {strings.RETRY}
                  </Link>
                ) : (
                  strings.RETRY
                ),
                knowledgeBaseLink
              )}
            </Typography>
          }
          priority='critical'
          type='page'
        />
      )}

      {processingCount > 0 && (
        <Message
          title={strings.VIDEO_PROCESSING}
          body={strings.formatString(strings.VIDEO_PROCESSING_DESCRIPTION, processingCount) as string}
          priority='info'
          type='page'
        />
      )}

      {hasUnableToProcess && (
        <Message
          title={strings.VIDEO_UNABLE_TO_PROCESS}
          body={
            <Typography fontSize='16px' component='span' sx={{ display: 'inline' }}>
              {strings.formatString(
                strings.VIDEO_UNABLE_TO_PROCESS_DESCRIPTION,
                knowledgeBaseLink,
                onRetryUpload ? (
                  <Link fontSize='16px' fontWeight={400} onClick={onRetryUpload} style={{ display: 'inline' }}>
                    {strings.RETRY_UPLOAD}
                  </Link>
                ) : (
                  strings.RETRY_UPLOAD
                ),
                onUploadNew ? (
                  <Link fontSize='16px' fontWeight={400} onClick={onUploadNew} style={{ display: 'inline' }}>
                    {strings.UPLOAD_NEW_VIDEO}
                  </Link>
                ) : (
                  strings.UPLOAD_NEW_VIDEO
                )
              )}
            </Typography>
          }
          priority='warning'
          type='page'
        />
      )}
    </Box>
  );
};

export default VirtualWalkthroughMessages;
