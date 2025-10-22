import React, { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, IconButton, SxProps, Theme, Typography, useTheme } from '@mui/material';
import MuxPlayer from '@mux/mux-player-react';
import { Button, Icon } from '@terraware/web-components';

import BreadCrumbs, { Crumb } from 'src/components/BreadCrumbs';
import ImageLightbox from 'src/components/common/ImageLightbox';
import isEnabled from 'src/features';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useUser } from 'src/providers';
import { requestGetActivityMediaStream } from 'src/redux/features/activities/activitiesAsyncThunks';
import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { selectUser } from 'src/redux/features/user/usersSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ACTIVITY_MEDIA_FILE_ENDPOINT } from 'src/services/ActivityService';
import { Activity, ActivityMediaFile, activityTypeLabel } from 'src/types/Activity';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import ActivityStatusBadges from './ActivityStatusBadges';

type ActivityMediaItemProps = {
  activity: Activity;
  focusedFileId?: number;
  hoveredFileId?: number;
  mediaFile: ActivityMediaFile;
  onClickMediaItem: (fileId: number) => () => void;
  setHoverFileCallback: (fileId: number, hover: boolean) => () => void;
  setLightboxImageId: (fileId: number | undefined) => void;
};

const ActivityMediaItem = ({
  activity,
  focusedFileId,
  hoveredFileId,
  mediaFile,
  onClickMediaItem,
  setHoverFileCallback,
  setLightboxImageId,
}: ActivityMediaItemProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();

  const [imageLoadError, setImageLoadError] = useState<boolean>(false);

  const imageStyles: CSSProperties = useMemo(
    () => ({
      aspectRatio: 4 / 3,
      backgroundColor: theme.palette.TwClrBgSecondary,
      borderColor:
        hoveredFileId === mediaFile.fileId || focusedFileId === mediaFile.fileId ? '#CC79A7' : theme.palette.TwClrBg,
      borderStyle: 'solid',
      borderWidth: '4px',
      boxSizing: 'content-box',
      objectFit: 'cover',
      transition: 'border 0.2s ease-in-out',
      width: '100%',
    }),
    [focusedFileId, hoveredFileId, mediaFile.fileId, theme.palette.TwClrBg, theme.palette.TwClrBgSecondary]
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

  const imageSrc = useMemo(
    () =>
      ACTIVITY_MEDIA_FILE_ENDPOINT.replace('{activityId}', activity.id.toString()).replace(
        '{fileId}',
        mediaFile.fileId.toString()
      ),
    [activity.id, mediaFile.fileId]
  );

  const mediaItemHoverCallback = useCallback(
    (hovered: boolean) => () => {
      if (mediaFile.geolocation && !mediaFile.isHiddenOnMap) {
        setHoverFileCallback(mediaFile.fileId, hovered);
      }
    },
    [mediaFile, setHoverFileCallback]
  );

  const onClickDownload = useCallback(
    (event?: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => {
      event?.stopPropagation();

      const imageURL = ACTIVITY_MEDIA_FILE_ENDPOINT.replace('{activityId}', activity.id.toString()).replace(
        '{fileId}',
        mediaFile.fileId.toString()
      );

      const link = document.createElement('a');
      link.href = imageURL;
      link.download = `activity-${activity.id}-image-${mediaFile.fileId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [activity.id, mediaFile.fileId]
  );

  const onClickExpand = useCallback(
    (event?: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event?.stopPropagation();
      setLightboxImageId(mediaFile.fileId);
    },
    [mediaFile.fileId, setLightboxImageId]
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

  const handleImageError = useCallback(() => {
    setImageLoadError(true);
  }, []);

  // if this is a video and the thumbnail failed to load (likely a 412 error during processing)
  if (mediaFile.type === 'Video' && imageLoadError) {
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
    <Box display='inline-block' position='relative' sx={{ '&:hover .info-panel': { opacity: 1 } }} width='100%'>
      <img
        alt={mediaFile?.caption}
        id={`activity-media-item-${mediaFile.fileId}`}
        onClick={onClickMediaItem(mediaFile.fileId)}
        onError={handleImageError}
        onMouseEnter={mediaItemHoverCallback(true)}
        onMouseLeave={mediaItemHoverCallback(false)}
        src={imageSrc}
        style={imageStyles}
      />

      {mediaFile.type === 'Video' && (
        <Box onClick={onClickExpand} sx={playButtonOverlayStyles}>
          <img alt='Play video' src='/assets/play-button-overlay.svg' style={{ width: '100%', height: '100%' }} />
        </Box>
      )}

      <Box className='info-panel' onClick={onClickMediaItem(mediaFile.fileId)} sx={infoPanelStyles}>
        <Typography component='div' fontSize='16px' lineHeight='16px'>
          {activity.date}
        </Typography>

        {mediaFile.caption && (
          <Typography component='div' sx={captionStyles}>
            {mediaFile.caption}
          </Typography>
        )}
      </Box>

      <IconButton
        onClick={onClickDownload}
        sx={[iconButtonStyles, { right: theme.spacing(5) }]}
        title={strings.DOWNLOAD}
      >
        <Icon name='downloadFromTheCloud' />
      </IconButton>

      <IconButton onClick={onClickExpand} sx={iconButtonStyles} title={strings.EXPAND}>
        <Icon name='expand' />
      </IconButton>
    </Box>
  );
};

type ActivityDetailViewProps = {
  activity: Activity;
  focusedFileId?: number;
  hoveredFileId?: number;
  onClickMediaItem: (fileId: number) => () => void;
  projectId: number;
  setHoverFileCallback: (fileId: number, hover: boolean) => () => void;
};

const ActivityDetailView = ({
  activity,
  focusedFileId,
  hoveredFileId,
  onClickMediaItem,
  projectId,
  setHoverFileCallback,
}: ActivityDetailViewProps): JSX.Element => {
  const { strings } = useLocalization();
  const { isAllowed } = useUser();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const dispatch = useAppDispatch();
  const navigate = useSyncNavigate();
  const query = useQuery();
  const location = useStateLocation();
  const theme = useTheme();
  const { goToAcceleratorActivityEdit, goToActivityEdit } = useNavigateTo();

  const verifiedByUser = useAppSelector(selectUser(activity.verifiedBy));
  const isAllowedEditActivities = isAllowed('EDIT_ACTIVITIES');

  const [lightboxMediaFileId, setLightboxMediaFileId] = useState<number | undefined>(undefined);
  const [getActivityMediaStreamRequestId, setGetActivityMediaStreamRequestId] = useState<string | undefined>();
  const [mediaStream, setMediaStream] = useState<{ playbackId: string; playbackToken: string } | undefined>();

  const getActivityMediaStreamRequest = useAppSelector((state) =>
    getActivityMediaStreamRequestId ? state.activityMediaStreamGet[getActivityMediaStreamRequestId] : undefined
  );

  useEffect(() => {
    if (activity?.verifiedBy && !verifiedByUser) {
      void dispatch(requestGetUser(activity?.verifiedBy));
    }
  }, [activity?.verifiedBy, dispatch, verifiedByUser]);

  const isActivityVideoSupportEnabled = useMemo(() => isEnabled('Activity Video Support'), []);

  const verifiedByLabel = useMemo(() => {
    const verifiedByName = verifiedByUser
      ? `${verifiedByUser?.firstName ?? ''} ${verifiedByUser?.lastName ?? ''}`.trim() || verifiedByUser.email
      : '';

    return verifiedByName ? strings.formatString(strings.VERIFIED_BY, verifiedByName) : '';
  }, [strings, verifiedByUser]);

  const activityType = useMemo(() => activityTypeLabel(activity.type, strings), [activity.type, strings]);

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: strings.PROJECT_ACTIVITY,
        onClick: () => {
          query.delete('activityId');
          navigate(getLocation(location.pathname, location, query.toString()));
        },
      },
    ],
    [location, navigate, query, strings.PROJECT_ACTIVITY]
  );

  const goToProjectActivityEdit = useCallback(() => {
    if (!projectId || !activity.id) {
      return;
    }

    if (isAcceleratorRoute) {
      goToAcceleratorActivityEdit(projectId, activity.id);
    } else {
      goToActivityEdit(projectId, activity.id);
    }
  }, [goToAcceleratorActivityEdit, goToActivityEdit, isAcceleratorRoute, projectId, activity.id]);

  const handleCloseLightbox = useCallback(() => {
    setLightboxMediaFileId(undefined);
    setMediaStream(undefined);
  }, []);

  const lightboxMediaFile = useMemo(
    () => activity.media.find((item) => item.fileId === lightboxMediaFileId),
    [activity.media, lightboxMediaFileId]
  );

  const lightboxImageSrc = useMemo(
    () =>
      lightboxMediaFile
        ? ACTIVITY_MEDIA_FILE_ENDPOINT.replace('{activityId}', activity.id.toString()).replace(
            '{fileId}',
            lightboxMediaFile.fileId.toString()
          )
        : '',
    [activity.id, lightboxMediaFile]
  );

  useEffect(() => {
    if (activity && lightboxMediaFile?.type === 'Video') {
      const request = dispatch(
        requestGetActivityMediaStream({ activityId: activity.id, fileId: lightboxMediaFile.fileId })
      );
      setGetActivityMediaStreamRequestId(request.requestId);
    }
  }, [activity, dispatch, lightboxMediaFile]);

  useEffect(() => {
    if (getActivityMediaStreamRequest?.status === 'success' && getActivityMediaStreamRequest?.data) {
      const { playbackId, playbackToken } = getActivityMediaStreamRequest.data;
      setMediaStream({ playbackId, playbackToken });
    }
  }, [getActivityMediaStreamRequest]);

  return (
    <Grid container paddingY={theme.spacing(2)} spacing={2} textAlign='left'>
      <Grid item md={8} xs={12}>
        {crumbs && (
          <Box marginBottom={theme.spacing(2)}>
            <BreadCrumbs crumbs={crumbs} />
          </Box>
        )}

        <Box display='flex' flexDirection='row' alignItems='center'>
          <Typography fontSize='24px' fontWeight={600} lineHeight='32px'>
            {activityType}
          </Typography>
        </Box>
      </Grid>

      <Grid item md={4} xs={12} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
        {isAllowedEditActivities && (
          <Button
            disabled={!projectId}
            icon='iconEdit'
            label={strings.EDIT_ACTIVITY}
            onClick={goToProjectActivityEdit}
            size='medium'
            sx={{ whiteSpace: 'nowrap' }}
          />
        )}
      </Grid>

      {isAcceleratorRoute && (
        <Grid item xs={12}>
          <ActivityStatusBadges activity={activity} />
        </Grid>
      )}

      <Grid item xs={12}>
        <Typography>
          {activity.date} {verifiedByLabel}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography>{activity.description}</Typography>
      </Grid>

      {activity.media
        .filter((mediaFile) => mediaFile.type === 'Photo' || isActivityVideoSupportEnabled)
        .map((mediaFile, index) => (
          <Grid item key={index} lg={6} xs={12}>
            <ActivityMediaItem
              activity={activity}
              focusedFileId={focusedFileId}
              hoveredFileId={hoveredFileId}
              mediaFile={mediaFile}
              onClickMediaItem={onClickMediaItem}
              setHoverFileCallback={setHoverFileCallback}
              setLightboxImageId={setLightboxMediaFileId}
            />
          </Grid>
        ))}

      <ImageLightbox
        altComponent={
          mediaStream ? (
            <MuxPlayer
              accentColor={theme.palette.TwClrBgBrand}
              autoPlay
              playbackId={mediaStream.playbackId}
              playbackToken={mediaStream.playbackToken}
              style={{
                aspectRatio: 16 / 9,
                width: '100%',
              }}
            />
          ) : undefined
        }
        imageAlt={lightboxMediaFile?.caption}
        imageSrc={lightboxImageSrc}
        isOpen={!!lightboxMediaFileId}
        onClose={handleCloseLightbox}
      />
    </Grid>
  );
};

export default ActivityDetailView;
