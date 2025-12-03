import React, { useCallback, useMemo, useState } from 'react';

import { Box } from '@mui/material';

import ImageLightbox from 'src/components/common/ImageLightbox';
import MediaItem, { MediaFile } from 'src/components/common/MediaItem';
import { ObservationMonitoringPlotPhoto } from 'src/types/Observations';

const PHOTO_URL = '/api/v1/tracking/observations/{observationId}/plots/{monitoringPlotId}/photos/{fileId}';

export type MonitoringPlotPhotosWithActionsProps = {
  observationId: number;
  monitoringPlotId: number;
  photos?: ObservationMonitoringPlotPhoto[];
};

export default function MonitoringPlotPhotosWithActions({
  observationId,
  monitoringPlotId,
  photos,
}: MonitoringPlotPhotosWithActionsProps): JSX.Element {
  const [lightboxFileId, setLightboxFileId] = useState<number | undefined>(undefined);

  const rootUrl = useMemo(
    () =>
      PHOTO_URL.replace('{observationId}', observationId.toString()).replace(
        '{monitoringPlotId}',
        monitoringPlotId.toString()
      ),
    [observationId, monitoringPlotId]
  );

  const mediaFiles: MediaFile[] = useMemo(
    () =>
      (photos ?? []).map((photo: ObservationMonitoringPlotPhoto) => ({
        fileId: photo.fileId,
        fileName: photo.fileId.toString(),
        caption: photo.caption,
        type: photo.mediaKind,
      })),
    [photos]
  );

  const getMediaUrl = useCallback(
    (fileId: number, raw?: boolean) => {
      const url = rootUrl.replace('{fileId}', fileId.toString());
      return raw ? `${url}?raw=true` : url;
    },
    [rootUrl]
  );

  const handleExpand = useCallback((fileId: number) => {
    setLightboxFileId(fileId);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxFileId(undefined);
  }, []);

  const lightboxMediaFile = useMemo(
    () => mediaFiles.find((file) => file.fileId === lightboxFileId),
    [mediaFiles, lightboxFileId]
  );

  const lightboxImageSrc = useMemo(
    () => (lightboxFileId ? getMediaUrl(lightboxFileId) : ''),
    [lightboxFileId, getMediaUrl]
  );

  return (
    <>
      <Box display='grid' gridTemplateColumns='repeat(auto-fill, minmax(213px, 1fr))' gap={2}>
        {mediaFiles.map((mediaFile) => (
          <Box key={mediaFile.fileId} position='relative'>
            <MediaItem
              mediaFile={mediaFile}
              imageSrc={getMediaUrl(mediaFile.fileId)}
              downloadUrl={getMediaUrl(mediaFile.fileId, true)}
              onExpand={handleExpand}
              observationId={observationId}
              plotId={monitoringPlotId}
            />
          </Box>
        ))}
      </Box>

      <ImageLightbox
        imageAlt={lightboxMediaFile?.caption}
        imageSrc={lightboxImageSrc}
        isOpen={!!lightboxFileId}
        onClose={handleCloseLightbox}
      />
    </>
  );
}
