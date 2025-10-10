import React, { useCallback, useEffect, useMemo } from 'react';

import { Box, Grid, IconButton, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';

import BreadCrumbs, { Crumb } from 'src/components/BreadCrumbs';
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

type ActivityDetailViewProps = {
  activity: Activity;
  focusedFileId?: number;
  hoveredFileId?: number;
  onMediaItemClick: (fileId: number) => () => void;
  projectId: number;
  setHoverFileCallback: (fileId: number, hover: boolean) => () => void;
};

const ActivityDetailView = ({
  activity,
  focusedFileId,
  hoveredFileId,
  onMediaItemClick,
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

  useEffect(() => {
    if (activity?.verifiedBy && !verifiedByUser) {
      void dispatch(requestGetUser(activity?.verifiedBy));
    }
  }, [activity?.verifiedBy, dispatch, verifiedByUser]);

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

  const mediaItemHoverCallback = useCallback(
    (mediaItem: ActivityMediaFile, hovered: boolean) => () => {
      if (mediaItem.geolocation && !mediaItem.isHiddenOnMap) {
        setHoverFileCallback(mediaItem.fileId, hovered);
      }
    },
    [setHoverFileCallback]
  );

  const handleDownloadClick = useCallback(
    (mediaItem: ActivityMediaFile) => (event?: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => {
      event?.stopPropagation();

      const imageURL = ACTIVITY_MEDIA_FILE_ENDPOINT.replace('{activityId}', activity.id.toString()).replace(
        '{fileId}',
        mediaItem.fileId.toString()
      );

      const link = document.createElement('a');
      link.href = imageURL;
      link.download = `activity-${activity.id}-image-${mediaItem.fileId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [activity.id]
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

      {activity.media.map((mediaItem, index) => (
        <Grid item lg={6} xs={12} key={index}>
          <Box display='inline-block' position='relative' sx={{ '&:hover .info-panel': { opacity: 1 } }} width='100%'>
            <img
              alt={mediaItem?.caption}
              id={`activity-media-item-${mediaItem.fileId}`}
              onClick={onMediaItemClick(mediaItem.fileId)}
              // Hover effects only for photos with corresponding markers
              onMouseEnter={mediaItemHoverCallback(mediaItem, true)}
              onMouseLeave={mediaItemHoverCallback(mediaItem, false)}
              src={ACTIVITY_MEDIA_FILE_ENDPOINT.replace('{activityId}', activity.id.toString()).replace(
                '{fileId}',
                mediaItem.fileId.toString()
              )}
              style={{
                aspectRatio: '4/3',
                backgroundColor: theme.palette.TwClrBgSecondary,
                borderColor:
                  hoveredFileId === mediaItem.fileId || focusedFileId === mediaItem.fileId
                    ? '#CC79A7'
                    : theme.palette.TwClrBg,
                borderStyle: 'solid',
                borderWidth: '4px',
                boxSizing: 'content-box',
                objectFit: 'cover',
                transition: 'border 0.2s ease-in-out',
                width: '100%',
              }}
            />

            <Box
              className='info-panel'
              onClick={onMediaItemClick(mediaItem.fileId)}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                bottom: '10px',
                color: 'white',
                cursor: 'pointer',
                left: '4px',
                opacity: 0,
                padding: theme.spacing(1),
                position: 'absolute',
                transition: 'opacity 0.2s ease-in-out',
                userSelect: 'none',
                width: '100%',
                zIndex: 1,
              }}
            >
              <Typography component='div' fontSize='16px' lineHeight='16px' variant='body2'>
                {activity.date}
              </Typography>

              {mediaItem.caption && (
                <Typography
                  component='div'
                  fontSize='16px'
                  lineHeight='16px'
                  marginTop={theme.spacing(1)}
                  whiteSpace='normal'
                  sx={{ wordWrap: 'break-word' }}
                  variant='body2'
                >
                  {mediaItem.caption}
                </Typography>
              )}
            </Box>

            <IconButton
              onClick={handleDownloadClick(mediaItem)}
              sx={{
                backgroundColor: '#fff',
                borderRadius: '4px',
                height: '24px',
                padding: 0,
                position: 'absolute',
                right: theme.spacing(1),
                top: theme.spacing(2),
                width: '24px',
                zIndex: 1,
                '&:hover': {
                  backgroundColor: '#eee',
                },
              }}
              title={strings.DOWNLOAD}
            >
              <Icon name='downloadFromTheCloud' />
            </IconButton>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default ActivityDetailView;
