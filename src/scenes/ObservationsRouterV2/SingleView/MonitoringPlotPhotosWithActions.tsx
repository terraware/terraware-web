import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import ImageLightbox from 'src/components/common/ImageLightbox';
import MediaItem, { MediaFile } from 'src/components/common/MediaItem';
import { API_PATHS } from 'src/constants';
import useOrganizationFeatures from 'src/hooks/useOrganizationFeatures';
import { useLocalization } from 'src/providers/hooks';
import {
  useGenerateObservationSplatFileMutation,
  useListObservationSplatsQuery,
} from 'src/queries/generated/observationSplats';
import { ObservationMonitoringPlotPhoto, getPositionLabel, getQuadratLabel } from 'src/types/Observations';
import useSnackbar from 'src/utils/useSnackbar';

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
  const { strings } = useLocalization();
  const theme = useTheme();
  const orgFeatures = useOrganizationFeatures();
  const [lightboxFileId, setLightboxFileId] = useState<number | undefined>(undefined);
  const [generateObservationSplatFile] = useGenerateObservationSplatFileMutation();
  const snackbar = useSnackbar();
  const { data } = useListObservationSplatsQuery({ observationId });
  const observationSplats = useMemo(() => data?.splats || [], [data]);

  const isVirtualPlotsEnabled = !!orgFeatures?.virtualWalkthrough?.enabled;

  const rootMediaUrl = useMemo(
    () =>
      API_PATHS.OBSERVATION_PLOT_MEDIA.replace('{observationId}', observationId.toString()).replace(
        '{plotId}',
        monitoringPlotId.toString()
      ),
    [observationId, monitoringPlotId]
  );

  const rootPhotoUrl = useMemo(
    () =>
      API_PATHS.OBSERVATION_PLOT_PHOTO.replace('{observationId}', observationId.toString()).replace(
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

  const createVirtualPlot = useCallback(
    (fileId: number) => () => {
      void (async () => {
        const response = await generateObservationSplatFile({
          observationId,
          generateSplatRequestPayload: { fileId },
        });

        if ('error' in response) {
          snackbar.toastError();
        }
      })();
    },
    [observationId, generateObservationSplatFile, snackbar]
  );

  return (
    <>
      <Box display='grid' gridTemplateColumns='repeat(auto-fill, minmax(213px, 1fr))' gap={2}>
        {mediaFiles.map((mediaFile) => {
          const splat = observationSplats.find((_splat) => _splat.fileId === mediaFile.fileId);

          return (
            <Box key={mediaFile.fileId} position='relative'>
              {!!monitoringPlotName && mediaFile.position && (
                <Typography color={theme.palette.TwClrBaseBlack}>
                  {monitoringPlotName} {getPositionLabel(mediaFile.position, strings)}
                </Typography>
              )}
              {mediaFile.isQuadrat && (
                <Typography color={theme.palette.TwClrBaseBlack}>
                  {getQuadratLabel(mediaFile.position, strings)}
                </Typography>
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
              {isVirtualPlotsEnabled && mediaFile.type === 'Video' && (
                <Button
                  label={strings.CREATE_VIRTUAL_PLOT}
                  priority='secondary'
                  type='passive'
                  onClick={createVirtualPlot(mediaFile.fileId)}
                  sx={{ width: '100%' }}
                  disabled={splat?.status === 'Preparing'}
                />
              )}
            </Box>
          );
        })}
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
