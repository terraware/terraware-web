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
      activity.modifiedTime && activity.verifiedTime && new Date(activity.modifiedTime) > new Date(activity.verifiedTime)
    );
  }, [activity.modifiedTime, activity.verifiedTime]);

  return (
    <Box alignItems='center' display='flex' flexDirection='row' flexWrap='wrap' gap={1} marginY={theme.spacing(1)}>
      {isChanged && <ActivityStatusBadge status='Changed' />}
      <ActivityStatusBadge status={activity.isVerified ? 'Verified' : 'Not Verified'} />
      {/* TODO: render badge for 'Do Not Use' when applicable */}
      {/* TODO: render badge for 'Published' when applicable */}
    </Box>
  );
};

export default ActivityStatusBadges;
