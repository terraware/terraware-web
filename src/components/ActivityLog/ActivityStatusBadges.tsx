import React, { useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import ActivityStatusBadge from './ActivityStatusBadge';
import { TypedActivity } from './types';

type ActivityStatusBadgesProps = {
  activity: TypedActivity;
};

const ActivityStatusBadges = ({ activity }: ActivityStatusBadgesProps): JSX.Element => {
  const theme = useTheme();

  const isChanged = useMemo(() => {
    if (activity.type === 'funder' || activity.type === 'base') {
      return false;
    }
    return (
      activity.payload.modifiedTime &&
      activity.payload.verifiedTime &&
      new Date(activity.payload.modifiedTime) > new Date(activity.payload.verifiedTime)
    );
  }, [activity]);

  const isPublished = useMemo(() => {
    if (activity.type === 'funder' || activity.type === 'base') {
      return false;
    }

    return activity.payload.publishedTime;
  }, [activity]);

  return (
    <Box alignItems='center' display='flex' flexDirection='row' flexWrap='wrap' gap={1} marginY={theme.spacing(1)}>
      {isChanged && <ActivityStatusBadge status='Changed' />}
      {activity.type === 'admin' && <ActivityStatusBadge status={activity.payload.status} />}
      {/* TODO: render badge for 'Do Not Use' when applicable */}
      {isPublished && <ActivityStatusBadge status='Published' />}
    </Box>
  );
};

export default ActivityStatusBadges;
