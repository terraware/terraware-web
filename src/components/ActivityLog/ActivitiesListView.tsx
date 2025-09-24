import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import { requestAdminListActivities, requestListActivities } from 'src/redux/features/activities/activitiesAsyncThunks';
import { selectActivityList, selectAdminActivityList } from 'src/redux/features/activities/activitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Activity } from 'src/types/Activity';
import { SearchNodePayload } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';

import ActivityStatusBadge from './ActivityStatusBadge';
import DateRange from './FilterDateRange';
import MapSplitView from './MapSplitView';

type ActivityListItemProps = {
  activity: Activity;
  focused?: boolean;
};

const ActivityListItem = ({ activity, focused }: ActivityListItemProps) => {
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();

  const coverPhoto = useMemo(() => activity.media.find((file) => file.isCoverPhoto), [activity.media]);

  const isChanged = useMemo(() => {
    return (
      activity.modifiedTime && activity.createdTime && new Date(activity.modifiedTime) > new Date(activity.createdTime)
    );
  }, [activity.modifiedTime, activity.createdTime]);

  return (
    <Grid
      container
      id={`activity-log-item-${activity.id}`}
      paddingY={theme.spacing(2)}
      sx={{
        backgroundColor: focused ? theme.palette.TwClrBgSecondary : undefined,
        borderBottom: '1px solid',
        borderColor: theme.palette.TwClrBrdrTertiary,
      }}
    >
      <Grid item paddingRight={theme.spacing(2)} xs='auto'>
        {/* TODO: add image src & alt text */}
        {coverPhoto ? (
          <img alt={coverPhoto.caption} src='https://placehold.co/100' />
        ) : (
          <img alt='' src='https://placehold.co/100' />
        )}
      </Grid>

      <Grid item xs={true}>
        <Typography color={theme.palette.TwClrTxtBrand} fontSize='20px' fontWeight='600' lineHeight='28px'>
          {activity.type}
        </Typography>

        <Box marginY={theme.spacing(1)}>
          {isChanged && <ActivityStatusBadge status='Changed' />}
          <ActivityStatusBadge status={activity.isVerified ? 'Verified' : 'Not Verified'} />
          {/* TODO: render badge for 'Do Not Use' when applicable */}
          {/* TODO: render badge for 'Published' when applicable */}
        </Box>

        <Typography>{activity.description}</Typography>
        {!isDesktop && <Typography>{activity.date}</Typography>}
      </Grid>

      {isDesktop && (
        <Grid item xs='auto'>
          <Typography>{activity.date}</Typography>
        </Grid>
      )}
    </Grid>
  );
};

type ActivitiesListViewProps = {
  projectId: number;
};

const ActivitiesListView = ({ projectId }: ActivitiesListViewProps): JSX.Element => {
  const { activeLocale, strings } = useLocalization();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const theme = useTheme();

  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const [requestId, setRequestId] = useState('');
  const [busy, setBusy] = useState<boolean>(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [focusedActivityId, setFocusedActivityId] = useState<number | undefined>(undefined);

  const listActivitiesRequest = useAppSelector(selectActivityList(requestId));
  const adminListActivitiesRequest = useAppSelector(selectAdminActivityList(requestId));

  useEffect(() => {
    if (!projectId) {
      return;
    }

    if (isAcceleratorRoute) {
      const request = dispatch(
        requestAdminListActivities({ includeMedia: true, locale: activeLocale || undefined, projectId })
      );
      setRequestId(request.requestId);
    } else {
      const request = dispatch(
        requestListActivities({ includeMedia: true, locale: activeLocale || undefined, projectId })
      );
      setRequestId(request.requestId);
    }
  }, [activeLocale, dispatch, isAcceleratorRoute, projectId]);

  useEffect(() => {
    if (listActivitiesRequest?.status === 'error' || adminListActivitiesRequest?.status === 'error') {
      setBusy(false);
      snackbar.toastError(strings.GENERIC_ERROR);
    } else if (listActivitiesRequest?.status === 'success' || adminListActivitiesRequest?.status === 'success') {
      setBusy(false);
      setActivities((listActivitiesRequest?.data || adminListActivitiesRequest?.data || []) as Activity[]);
    }
  }, [
    adminListActivitiesRequest?.data,
    adminListActivitiesRequest?.status,
    listActivitiesRequest?.data,
    listActivitiesRequest?.status,
    snackbar,
    strings.GENERIC_ERROR,
  ]);

  const onDeleteFilter = useCallback(
    (key: string) => {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    },
    [filters, setFilters]
  );

  const onFilterChange = useCallback(
    (key: string, filter: SearchNodePayload) => {
      if (filter.values.length) {
        setFilters({ ...filters, [key]: filter });
      } else {
        onDeleteFilter(key);
      }
    },
    [filters, onDeleteFilter, setFilters]
  );

  // const clearFilters = useCallback(() => setFilters({}), [setFilters]);

  const onChangeDateRange = useCallback(
    (filter: SearchNodePayload) => onFilterChange('dateRange', filter),
    [onFilterChange]
  );

  const onDeleteDateRange = useCallback(() => onDeleteFilter('dateRange'), [onDeleteFilter]);

  // group activities by quarter and year
  const groupedActivities = useMemo(() => {
    const groups: Record<string, Activity[]> = {};

    activities.forEach((activity) => {
      const date = new Date(activity.date);
      const year = date.getFullYear();
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      const quarterKey = strings.formatString(strings.QUARTER_YEAR, quarter, year)?.toString() || '';

      if (!groups[quarterKey]) {
        groups[quarterKey] = [];
      }
      groups[quarterKey].push(activity);
    });

    // sort quarters in descending order (most recent first)
    const sortedQuarters = Object.keys(groups).sort((a, b) => {
      const [aQuarter, aYear] = a.split(' ');
      const [bQuarter, bYear] = b.split(' ');

      if (aYear !== bYear) {
        return parseInt(bYear, 10) - parseInt(aYear, 10);
      }
      return parseInt(bQuarter.substring(1), 10) - parseInt(aQuarter.substring(1), 10);
    });

    // sort activities within each quarter by date (most recent first)
    sortedQuarters.forEach((quarterKey) => {
      groups[quarterKey].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    return sortedQuarters.map((quarterKey) => ({
      quarter: quarterKey,
      activities: groups[quarterKey],
    }));
  }, [activities, strings]);

  return (
    <MapSplitView>
      <DateRange
        field='dateRange'
        onChange={onChangeDateRange}
        onDelete={onDeleteDateRange}
        values={filters.dateRange?.values ?? []}
      />
      {groupedActivities.length === 0 && !busy ? (
        <Typography color={theme.palette.TwClrTxt} fontSize='16px' fontWeight={500} marginTop={theme.spacing(2)}>
          TODO: Show empty state for no results
        </Typography>
      ) : (
        groupedActivities.map(({ quarter, activities: groupActivities }) => (
          <Fragment key={quarter}>
            <Typography
              color={theme.palette.TwClrTxt}
              fontSize='20px'
              fontWeight={600}
              lineHeight='28px'
              marginY={theme.spacing(1)}
            >
              {quarter}
            </Typography>

            {groupActivities.map((activity) => (
              <ActivityListItem activity={activity} focused={activity.id === focusedActivityId} key={activity.id} />
            ))}
          </Fragment>
        ))
      )}
    </MapSplitView>
  );
};

export default ActivitiesListView;
