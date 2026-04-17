import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import { useDocLinks } from 'src/docLinks';
import { useGenerateOrganizationSplatMutation } from 'src/queries/generated/organizationSplats';
import { useSearchOrganizationMediaFilesQuery } from 'src/queries/search/organizationMedia';
import CreateVirtualWalkthroughStep1Modal from 'src/scenes/Home/TerrawareHomeView/CreateVirtualWalkthroughStep1Modal';
import strings from 'src/strings';

type VirtualWalkthroughMessagesProps = {
  organizationId: number;
  onRetry?: () => void;
};

const VirtualWalkthroughMessages = ({
  organizationId,
  onRetry,
}: VirtualWalkthroughMessagesProps): JSX.Element | null => {
  const theme = useTheme();
  const docLinks = useDocLinks();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const { data: mediaFiles } = useSearchOrganizationMediaFilesQuery(organizationId);
  const [generateSplat] = useGenerateOrganizationSplatMutation();

  const processingCount = useMemo(
    () => mediaFiles?.filter((f) => f.splatStatus === 'Preparing').length ?? 0,
    [mediaFiles]
  );
  const hasUploadFailed = useMemo(
    () => mediaFiles?.some((f) => f.needsAttention && !f.splatStatus) ?? false,
    [mediaFiles]
  );

  const lastErroredFile = useMemo(
    () =>
      mediaFiles
        ?.filter((f) => f.splatStatus === 'Errored')
        .sort((a, b) => (b.createdTime ?? '').localeCompare(a.createdTime ?? ''))[0],
    [mediaFiles]
  );
  const hasUnableToProcess = lastErroredFile !== undefined;

  const handleRetryUpload = useCallback(() => {
    if (lastErroredFile) {
      void generateSplat({ organizationId, generateSplatRequestPayload: { fileId: lastErroredFile.fileId } });
    }
  }, [generateSplat, lastErroredFile, organizationId]);

  if (!processingCount && !hasUploadFailed && !hasUnableToProcess) {
    return null;
  }

  const uploadModal = (
    <CreateVirtualWalkthroughStep1Modal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />
  );

  const knowledgeBaseLink = (
    <Link
      fontSize='16px'
      fontWeight={400}
      to={docLinks.virtual_walkthroughs_videos_tips}
      target='_blank'
      style={{ display: 'inline' }}
    >
      {strings.KNOWLEDGE_BASE}
    </Link>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(2), marginBottom: theme.spacing(2) }}>
      {uploadModal}
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
                <Link fontSize='16px' fontWeight={400} onClick={handleRetryUpload} style={{ display: 'inline' }}>
                  {strings.RETRY_UPLOAD}
                </Link>,
                <Link
                  fontSize='16px'
                  fontWeight={400}
                  onClick={() => setUploadModalOpen(true)}
                  style={{ display: 'inline' }}
                >
                  {strings.UPLOAD_NEW_VIDEO}
                </Link>
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
