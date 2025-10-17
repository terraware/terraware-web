import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, IconButton, SxProps, Theme, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';

import BreadCrumbs, { Crumb } from 'src/components/BreadCrumbs';
import ImageLightbox from 'src/components/common/ImageLightbox';
import isEnabled from 'src/features';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useUser } from 'src/providers';
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

  const imageStyles = useMemo(
    () => ({
      aspectRatio: '4/3',
      backgroundColor: theme.palette.TwClrBgSecondary,
      borderColor:
        hoveredFileId === mediaFile.fileId || focusedFileId === mediaFile.fileId ? '#CC79A7' : theme.palette.TwClrBg,
      borderStyle: 'solid',
      borderWidth: '4px',
      boxSizing: 'content-box' as const,
      objectFit: 'cover' as const,
      transition: 'border 0.2s ease-in-out',
      width: '100%',
    }),
    [focusedFileId, hoveredFileId, mediaFile.fileId, theme.palette.TwClrBg, theme.palette.TwClrBgSecondary]
  );

  const infoPanelStyles = useMemo(
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

  const captionStyles = useMemo(
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

      if (mediaFile.type === 'Video') {
        alert('TODO: Implement video file download');
        return;
      }

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
    [activity.id, mediaFile.fileId, mediaFile.type]
  );

  const onClickExpand = useCallback(
    (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event?.stopPropagation();

      if (mediaFile.type === 'Video') {
        alert('TODO: Implement video lightbox');
        return;
      }

      setLightboxImageId(mediaFile.fileId);
    },
    [mediaFile.fileId, mediaFile.type, setLightboxImageId]
  );

  return (
    <Box display='inline-block' position='relative' sx={{ '&:hover .info-panel': { opacity: 1 } }} width='100%'>
      <img
        alt={mediaFile?.caption}
        id={`activity-media-item-${mediaFile.fileId}`}
        onClick={onClickMediaItem(mediaFile.fileId)}
        onMouseEnter={mediaItemHoverCallback(true)}
        onMouseLeave={mediaItemHoverCallback(false)}
        src={imageSrc}
        style={imageStyles}
      />

      <Box className='info-panel' onClick={onClickMediaItem(mediaFile.fileId)} sx={infoPanelStyles}>
        <Typography component='div' fontSize='16px' lineHeight='16px' variant='body2'>
          {activity.date}
        </Typography>

        {mediaFile.caption && (
          <Typography component='div' sx={captionStyles} variant='body2'>
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

  const [lightboxImageId, setLightboxImageId] = useState<number | undefined>(undefined);

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
    setLightboxImageId(undefined);
  }, []);

  const lightboxMediaItem = useMemo(
    () => activity.media.find((item) => item.fileId === lightboxImageId),
    [activity.media, lightboxImageId]
  );

  const lightboxImageSrc = useMemo(
    () =>
      lightboxMediaItem
        ? ACTIVITY_MEDIA_FILE_ENDPOINT.replace('{activityId}', activity.id.toString()).replace(
            '{fileId}',
            lightboxMediaItem.fileId.toString()
          )
        : '',
    [activity.id, lightboxMediaItem]
  );

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
              setLightboxImageId={setLightboxImageId}
            />
          </Grid>
        ))}

      <ImageLightbox
        imageAlt={lightboxMediaItem?.caption}
        imageSrc={lightboxImageSrc}
        isOpen={!!lightboxImageId}
        onClose={handleCloseLightbox}
      />
    </Grid>
  );
};

export default ActivityDetailView;
