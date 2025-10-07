import React, { useCallback, useEffect, useMemo } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

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

import ActivityStatusBadge from './ActivityStatusBadge';

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

  const isChanged = useMemo(() => {
    return (
      activity.modifiedTime && activity.createdTime && new Date(activity.modifiedTime) > new Date(activity.createdTime)
    );
  }, [activity.modifiedTime, activity.createdTime]);

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
          {isChanged && <ActivityStatusBadge status='Changed' />}
          <ActivityStatusBadge status={activity.isVerified ? 'Verified' : 'Not Verified'} />
          {/* TODO: render badge for 'Do Not Use' when applicable */}
          {/* TODO: render badge for 'Published' when applicable */}
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
        </Grid>
      ))}
    </Grid>
  );
};

export default ActivityDetailView;
