import React, { useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import ImageLightbox from 'src/components/common/ImageLightbox';
import MediaItem, { MediaFile } from 'src/components/common/MediaItem';
import { ObservationMonitoringPlotPhoto, getPositionLabel, getQuadratLabel } from 'src/types/Observations';

const PHOTO_URL = '/api/v1/tracking/observations/{observationId}/plots/{monitoringPlotId}/photos/{fileId}';
const MEDIA_URL = '/api/v1/tracking/observations/{observationId}/plots/{plotId}/media/{fileId}';

export type MonitoringPlotPhotosWithActionsProps = {
  observationId: number;
  monitoringPlotId: number;
  monitoringPlotName?: string;
  plantingSiteName?: string;
  photos?: ObservationMonitoringPlotPhoto[];
};

export default function MonitoringPlotPhotosWithActions({
  observationId,
  monitoringPlotId,
  monitoringPlotName,
  plantingSiteName,
  photos,
}: MonitoringPlotPhotosWithActionsProps): JSX.Element {
  const theme = useTheme();
  const [lightboxFileId, setLightboxFileId] = useState<number | undefined>(undefined);

  const rootMediaUrl = useMemo(
    () =>
      MEDIA_URL.replace('{observationId}', observationId.toString()).replace('{plotId}', monitoringPlotId.toString()),
    [observationId, monitoringPlotId]
  );

  const rootPhotoUrl = useMemo(
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

  const getStaticPhotoUrl = useCallback(
    (fileId: number) => {
      const url = rootPhotoUrl.replace('{fileId}', fileId.toString());
      return url;
    },
    [rootPhotoUrl]
  );

  const getMediaUrl = useCallback(
    (fileId: number) => {
      const url = rootMediaUrl.replace('{fileId}', fileId.toString());
      return url;
    },
    [rootMediaUrl]
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
              imageSrc={getStaticPhotoUrl(mediaFile.fileId)}
              downloadUrl={getMediaUrl(mediaFile.fileId)}
              onExpand={handleExpand}
              observationId={observationId}
              plotId={monitoringPlotId}
              plantingSiteName={plantingSiteName}
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
