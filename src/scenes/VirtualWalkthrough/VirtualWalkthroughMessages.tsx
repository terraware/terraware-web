import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import { useDocLinks } from 'src/docLinks';
import { useUser } from 'src/providers';
import { useGenerateOrganizationSplatMutation } from 'src/queries/generated/organizationSplats';
import { useSearchVirtualWalkthroughsQuery } from 'src/queries/search/virtualWalkthroughs';
import CreateVirtualWalkthroughStep1Modal from 'src/scenes/Home/TerrawareHomeView/CreateVirtualWalkthroughStep1Modal';
import strings from 'src/strings';

const PREF_UPLOAD_FAILED_IDS = 'virtualWalkthrough.dismissedUploadFailedIds';
const PREF_ERRORED_FILE_IDS = 'virtualWalkthrough.dismissedErroredFileIds';

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
  const [dismissedProcessingIds, setDismissedProcessingIds] = useState<number[]>([]);

  const { userPreferences, updateUserPreferences } = useUser();
  const { data: mediaFiles } = useSearchVirtualWalkthroughsQuery(organizationId);
  const [generateSplat] = useGenerateOrganizationSplatMutation();

  const processingFiles = useMemo(
    () => mediaFiles?.filter((f) => f.splatStatus === 'Preparing') ?? [],
    [mediaFiles]
  );
  const processingCount = processingFiles.length;

  const hasNewProcessingFiles = useMemo(
    () => processingFiles.some((f) => !dismissedProcessingIds.includes(f.fileId)),
    [processingFiles, dismissedProcessingIds]
  );

  const dismissedUploadFailedIds = useMemo(
    () => (userPreferences[PREF_UPLOAD_FAILED_IDS] as number[] | undefined) ?? [],
    [userPreferences]
  );

  const uploadFailedFiles = useMemo(
    () => mediaFiles?.filter((f) => f.needsAttention && !f.splatStatus) ?? [],
    [mediaFiles]
  );

  const hasUploadFailed = useMemo(
    () => uploadFailedFiles.some((f) => !dismissedUploadFailedIds.includes(f.fileId)),
    [dismissedUploadFailedIds, uploadFailedFiles]
  );

  const erroredFiles = useMemo(
    () => mediaFiles?.filter((f) => f.splatStatus === 'Errored') ?? [],
    [mediaFiles]
  );

  const lastErroredFile = useMemo(
    () => [...erroredFiles].sort((a, b) => (b.createdTime ?? '').localeCompare(a.createdTime ?? ''))[0],
    [erroredFiles]
  );

  const dismissedErroredIds = useMemo(
    () => (userPreferences[PREF_ERRORED_FILE_IDS] as number[] | undefined) ?? [],
    [userPreferences]
  );

  const hasUnableToProcess = useMemo(
    () => erroredFiles.some((f) => !dismissedErroredIds.includes(f.fileId)),
    [erroredFiles, dismissedErroredIds]
  );

  const handleRetryUpload = useCallback(() => {
    if (lastErroredFile) {
      void generateSplat({ organizationId, generateSplatRequestPayload: { fileId: lastErroredFile.fileId } });
    }
  }, [generateSplat, lastErroredFile, organizationId]);

  const handleDismissUploadFailed = useCallback(() => {
    const newIds = [...dismissedUploadFailedIds, ...uploadFailedFiles.map((f) => f.fileId)];
    void updateUserPreferences({ ...userPreferences, [PREF_UPLOAD_FAILED_IDS]: newIds });
  }, [dismissedUploadFailedIds, updateUserPreferences, uploadFailedFiles, userPreferences]);

  const handleDismissErrored = useCallback(() => {
    const newIds = [...dismissedErroredIds, ...erroredFiles.map((f) => f.fileId)];
    void updateUserPreferences({ ...userPreferences, [PREF_ERRORED_FILE_IDS]: newIds });
  }, [dismissedErroredIds, erroredFiles, updateUserPreferences, userPreferences]);

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
          showCloseButton
          onClose={handleDismissUploadFailed}
        />
      )}

      {processingCount > 0 && hasNewProcessingFiles && (
        <Message
          title={strings.VIDEO_PROCESSING}
          body={strings.formatString(strings.VIDEO_PROCESSING_DESCRIPTION, processingCount) as string}
          priority='info'
          type='page'
          showCloseButton
          onClose={() => setDismissedProcessingIds((prev) => [...prev, ...processingFiles.map((f) => f.fileId)])}
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
          showCloseButton
          onClose={handleDismissErrored}
        />
      )}
    </Box>
  );
};

export default VirtualWalkthroughMessages;
