import React, { useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import ImageLightbox from 'src/components/common/ImageLightbox';
import MediaItem, { MediaFile } from 'src/components/common/MediaItem';
import { ObservationMonitoringPlotPhoto, getPositionLabel, getQuadratLabel } from 'src/types/Observations';

const PHOTO_URL = '/api/v1/tracking/observations/{observationId}/plots/{monitoringPlotId}/photos/{fileId}';

export type MonitoringPlotPhotosWithActionsProps = {
  observationId: number;
  monitoringPlotId: number;
  monitoringPlotName?: string;
  photos?: ObservationMonitoringPlotPhoto[];
};

export default function MonitoringPlotPhotosWithActions({
  observationId,
  monitoringPlotId,
  monitoringPlotName,
  photos,
}: MonitoringPlotPhotosWithActionsProps): JSX.Element {
  const theme = useTheme();
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
        position: photo.position,
        isQuadrat: photo.type === 'Quadrat',
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
            {!!monitoringPlotName && mediaFile.position && (
              <Typography color={theme.palette.TwClrBaseBlack}>
                {monitoringPlotName} {getPositionLabel(mediaFile.position)}
              </Typography>
            )}
            {mediaFile.isQuadrat && (
              <Typography color={theme.palette.TwClrBaseBlack}>{getQuadratLabel(mediaFile.position)}</Typography>
            )}
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
