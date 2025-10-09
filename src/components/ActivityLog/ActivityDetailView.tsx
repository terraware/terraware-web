import React, { useCallback, useEffect, useMemo } from 'react';

import { Box, Grid, IconButton, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import BreadCrumbs, { Crumb } from 'src/components/BreadCrumbs';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
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
  setHoverFileCallback: (fileId: number, hover: boolean) => () => void;
};

const ActivityDetailView = ({
  activity,
  focusedFileId,
  hoveredFileId,
  onMediaItemClick,
  setHoverFileCallback,
}: ActivityDetailViewProps): JSX.Element => {
  const { strings } = useLocalization();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const dispatch = useAppDispatch();
  const navigate = useSyncNavigate();
  const query = useQuery();
  const location = useStateLocation();
  const theme = useTheme();

  const verifiedByUser = useAppSelector(selectUser(activity.verifiedBy));

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


  return (
    <Grid container paddingY={theme.spacing(2)} spacing={2} textAlign='left'>
      <Grid item xs={12}>
        {crumbs && <BreadCrumbs crumbs={crumbs} />}
      </Grid>

      <Grid item xs={12}>
        <Box display='flex' flexDirection='row' alignItems='center'>
          <Typography fontSize='24px' fontWeight={600} lineHeight='32px'>
            {activityType}
          </Typography>
        </Box>
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
          <Box position='relative' display='inline-block' width='100%'>
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
