import React, { useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import { Activity } from 'src/types/Activity';

import ActivityStatusBadge from './ActivityStatusBadge';

type ActivityStatusBadgesProps = {
  activity: Activity;
};

const ActivityStatusBadges = ({ activity }: ActivityStatusBadgesProps): JSX.Element => {
  const theme = useTheme();

  const isChanged = useMemo(() => {
    return (
      activity.modifiedTime &&
      activity.verifiedTime &&
      new Date(activity.modifiedTime) > new Date(activity.verifiedTime)
    );
  }, [activity.modifiedTime, activity.verifiedTime]);

  const isPublished = useMemo(() => {
    return activity.publishedTime;
  }, [activity.publishedTime]);

  return (
    <Box alignItems='center' display='flex' flexDirection='row' flexWrap='wrap' gap={1} marginY={theme.spacing(1)}>
      {isChanged && <ActivityStatusBadge status='Changed' />}
      <ActivityStatusBadge status={activity.status} />
      {/* TODO: render badge for 'Do Not Use' when applicable */}
      {isPublished && <ActivityStatusBadge status='Published' />}
    </Box>
  );
};

export default ActivityStatusBadges;
