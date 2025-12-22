import React, { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, IconButton, SxProps, Theme, Typography, useTheme } from '@mui/material';
import MuxPlayer from '@mux/mux-player-react';
import { Icon } from '@terraware/web-components';

import ImageLightbox from 'src/components/common/ImageLightbox';
import { useLocalization } from 'src/providers';
import { useLazyGetObservationMediaStreamQuery } from 'src/queries/generated/observations';
import { ObservationMonitoringPlotPosition } from 'src/types/Observations';

export type MediaFile = {
  fileId: number;
  fileName: string;
  caption?: string;
  type: 'Photo' | 'Video';
  position?: ObservationMonitoringPlotPosition;
  isQuadrat: boolean;
};

export type MediaItemProps = {
  mediaFile: MediaFile;
  imageSrc: string;
  onDownload?: (fileId: number) => void;
  onExpand: (fileId: number) => void;
  onImageError?: () => void;
  downloadUrl?: string;
  observationId?: number;
  plotId?: number;
  plantingSiteName?: string;
};

const MediaItem = ({
  mediaFile,
  imageSrc,
  onDownload,
  onExpand,
  onImageError,
  downloadUrl,
  observationId,
  plotId,
  plantingSiteName,
}: MediaItemProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();

  const [isPreconditionFailedError, setIsPreconditionFailedError] = useState<boolean>(false);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<{ playbackId: string; playbackToken: string } | undefined>();
  const [getObservationMediaStream, { data: mediaStreamData, error: mediaStreamError }] =
    useLazyGetObservationMediaStreamQuery();

  const imageStyles: CSSProperties = useMemo(
    () => ({
      aspectRatio: 4 / 3,
      backgroundColor: theme.palette.TwClrBgSecondary,
      borderColor: theme.palette.TwClrBg,
      borderStyle: 'solid',
      borderWidth: '4px',
      boxSizing: 'content-box',
      cursor: 'pointer',
      objectFit: 'cover',
      transition: 'border 0.2s ease-in-out',
      width: '100%',
      height: '160px',
    }),
    [theme.palette.TwClrBg, theme.palette.TwClrBgSecondary]
  );

  const infoPanelStyles: SxProps<Theme> = useMemo(
    () => ({
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      bottom: '10px',
      color: '#fff',
      cursor: 'pointer',
      left: '4px',
      opacity: 0,
      padding: theme.spacing(1),
      position: 'absolute',
      transition: 'opacity 0.2s ease-in-out',
      userSelect: 'none',
      width: '100%',
      zIndex: 1,
    }),
    [theme]
  );

  const captionStyles: SxProps<Theme> = useMemo(
    () => ({
      fontSize: '16px',
      lineHeight: '16px',
      marginTop: theme.spacing(1),
      whiteSpace: 'normal',
      wordWrap: 'break-word',
    }),
    [theme]
  );

  const iconButtonStyles: SxProps<Theme> = useMemo(
    () => ({
      backgroundColor: '#fff',
      borderRadius: '4px',
      height: '24px',
      padding: 0,
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(2),
      width: '24px',
      zIndex: 2,
      '&:hover': { backgroundColor: '#eee' },
    }),
    [theme]
  );

  const playButtonOverlayStyles: SxProps<Theme> = useMemo(
    () => ({
      cursor: 'pointer',
      height: '80px',
      left: '50%',
      position: 'absolute',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      transition: 'transform 0.2s ease-in-out',
      width: '80px',
      zIndex: 1,
      '&:hover': {
        transform: 'translate(-50%, -50%) scale(1.1)',
      },
    }),
    []
  );

  const processingFallbackStyles: SxProps<Theme> = useMemo(
    () => ({
      alignItems: 'center',
      aspectRatio: 4 / 3,
      backgroundColor: theme.palette.TwClrBaseGray100,
      borderColor: theme.palette.TwClrBg,
      borderStyle: 'solid',
      borderWidth: '4px',
      boxSizing: 'content-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      textAlign: 'center',
      width: '100%',
    }),
    [theme]
  );

  const onClickDownload = useCallback(
    (event?: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => {
      event?.stopPropagation();

      if (onDownload) {
        onDownload(mediaFile.fileId);
      } else if (downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${plantingSiteName}_plot${plotId}_${mediaFile.fileName}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    [downloadUrl, mediaFile.fileId, mediaFile.fileName, onDownload, plotId, plantingSiteName]
  );

  const onClickExpand = useCallback(
    (event?: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event?.stopPropagation();

      // For videos, open lightbox and fetch stream
      if (mediaFile.type === 'Video' && observationId && plotId) {
        setLightboxOpen(true);
        void getObservationMediaStream({
          observationId,
          plotId,
          fileId: mediaFile.fileId,
        });
      } else {
        // For photos, use the parent's expand handler
        onExpand(mediaFile.fileId);
      }
    },
    [mediaFile.fileId, mediaFile.type, observationId, plotId, getObservationMediaStream, onExpand]
  );

  const handleCloseLightbox = useCallback(() => {
    setLightboxOpen(false);
    setMediaStream(undefined);
  }, []);

  const handleImageError = useCallback(() => {
    // only check for 412 error if this is a video
    if (mediaFile.type === 'Video' && observationId && plotId) {
      // Try to fetch the media stream to check if video is processing (412 error)
      void getObservationMediaStream({
        observationId,
        plotId,
        fileId: mediaFile.fileId,
      });
    }
    if (onImageError) {
      onImageError();
    }
  }, [getObservationMediaStream, mediaFile.fileId, mediaFile.type, observationId, onImageError, plotId]);

  useEffect(() => {
    if (mediaStreamError) {
      // Check if the error is a 412 (Precondition Failed) - video is still processing
      const error = mediaStreamError as { status?: number };
      if (error.status === 412) {
        setIsPreconditionFailedError(true);

        // retry after one minute
        const timeoutId = setTimeout(() => {
          setIsPreconditionFailedError(false);
        }, 60000);

        return () => {
          clearTimeout(timeoutId);
        };
      }
    }
  }, [mediaStreamError]);

  useEffect(() => {
    if (mediaStreamData) {
      const { playbackId, playbackToken } = mediaStreamData;
      setMediaStream({ playbackId, playbackToken });
    }
  }, [mediaStreamData]);

  // only show processing fallback if this is a video with a 412 error
  if (mediaFile.type === 'Video' && isPreconditionFailedError) {
    return (
      <Box sx={processingFallbackStyles}>
        <Typography fontSize='14px' fontWeight={600}>
          {strings.VIDEO_PROCESSING}
        </Typography>

        <img alt={strings.LOADING} height='24px' src='/assets/loading.gif' style={{ margin: '24px 0' }} width='24px' />

        <Typography fontSize='12px' fontWeight={400}>
          {strings.YOUR_VIDEO_IS_PROCESSING}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        display='inline-block'
        position='relative'
        id={`media-item-${mediaFile.fileId}`}
        sx={{ '&:hover .info-panel': { opacity: 1 } }}
        width='100%'
      >
        <img
          alt={mediaFile?.caption}
          onClick={onClickExpand}
          onError={handleImageError}
          src={imageSrc}
          style={imageStyles}
        />

        {mediaFile.type === 'Video' && (
          <Box onClick={onClickExpand} sx={playButtonOverlayStyles}>
            <img
              alt={strings.PLAY_VIDEO}
              src='/assets/play-button-overlay.svg'
              style={{ width: '100%', height: '100%' }}
            />
          </Box>
        )}

        {mediaFile.caption && (
          <Box className='info-panel' onClick={onClickExpand} sx={infoPanelStyles}>
            <Typography component='div' sx={captionStyles}>
              {mediaFile.caption}
            </Typography>
          </Box>
        )}

        {(onDownload || downloadUrl) && (
          <IconButton
            onClick={onClickDownload}
            sx={[iconButtonStyles, { right: theme.spacing(5) }]}
            title={strings.DOWNLOAD}
          >
            <Icon name='downloadFromTheCloud' />
          </IconButton>
        )}

        <IconButton onClick={onClickExpand} sx={iconButtonStyles} title={strings.EXPAND}>
          <Icon name='expand' />
        </IconButton>
      </Box>

      <ImageLightbox
        altComponent={
          mediaStream ? (
            <MuxPlayer
              accentColor={theme.palette.TwClrBgBrand}
              autoPlay
              metadata={{
                video_title: `Media video (File ID: ${mediaFile.fileId})`,
              }}
              playbackId={mediaStream.playbackId}
              playbackToken={mediaStream.playbackToken}
              style={{
                aspectRatio: 16 / 9,
                height: '80vh',
                maxWidth: '80vw',
                width: 'auto',
              }}
            />
          ) : undefined
        }
        imageAlt={mediaFile.caption}
        imageSrc={imageSrc}
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
      />
    </>
  );
};

export default MediaItem;
