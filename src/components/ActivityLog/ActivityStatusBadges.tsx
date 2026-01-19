import React, { type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import { ActivityStatusTag } from 'src/types/Activity';

import ActivityStatusBadge from './ActivityStatusBadge';
import { TypedActivity } from './types';

type ActivityStatusBadgesProps = {
  activity: TypedActivity;
};

const ActivityStatusBadges = ({ activity }: ActivityStatusBadgesProps): JSX.Element => {
  const theme = useTheme();

  const isChangedAfterPublished = useMemo(() => {
    if (activity.type === 'funder' || activity.type === 'base') {
      return false;
    }
    return (
      activity.payload.modifiedTime &&
      activity.payload.publishedTime &&
      new Date(activity.payload.modifiedTime) > new Date(activity.payload.publishedTime)
    );
  }, [activity]);

  const isPublished = useMemo(() => {
    if (activity.type === 'funder' || activity.type === 'base') {
      return false;
    }

    return activity.payload.publishedTime;
  }, [activity]);

  const status = useMemo((): ActivityStatusTag | undefined => {
    if (activity.type === 'admin') {
      if (activity.payload.status === 'Not Verified' && activity.payload.verifiedTime) {
        return 'Project Updated';
      }
      return activity.payload.status;
    }
  }, [activity]);

  return (
    <Box alignItems='center' display='flex' flexDirection='row' flexWrap='wrap' gap={1} marginY={theme.spacing(1)}>
      {isChangedAfterPublished && <ActivityStatusBadge status='Unpublished Changes' />}
      {status && <ActivityStatusBadge status={status} />}
      {/* TODO: render badge for 'Do Not Use' when applicable */}
      {isPublished && <ActivityStatusBadge status='Published' />}
    </Box>
  );
};

export default ActivityStatusBadges;
