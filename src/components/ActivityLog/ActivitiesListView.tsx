import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { requestAdminListActivities, requestListActivities } from 'src/redux/features/activities/activitiesAsyncThunks';
import { selectActivityList, selectAdminActivityList } from 'src/redux/features/activities/activitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ACTIVITY_MEDIA_FILE_ENDPOINT } from 'src/services/ActivityService';
import { Activity, activityTypeLabel } from 'src/types/Activity';
import { SearchNodePayload } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import useMapDrawer from '../NewMap/useMapDrawer';
import ActivitiesEmptyState from './ActivitiesEmptyState';
import ActivityDetailView from './ActivityDetailView';
import ActivityStatusBadge from './ActivityStatusBadge';
import DateRange from './FilterDateRange';
import MapSplitView from './MapSplitView';

type ActivityListItemProps = {
  activity: Activity;
  focused?: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

const ActivityListItem = ({ activity, focused, onClick, onMouseEnter, onMouseLeave }: ActivityListItemProps) => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const coverPhoto = useMemo(() => activity.media.find((file) => file.isCoverPhoto), [activity.media]);

  const activityType = useMemo(() => activityTypeLabel(activity.type, strings), [activity.type, strings]);

  const isChanged = useMemo(() => {
    return (
      activity.modifiedTime && activity.createdTime && new Date(activity.modifiedTime) > new Date(activity.createdTime)
    );
  }, [activity.modifiedTime, activity.createdTime]);

  const coverPhotoURL = useMemo(() => {
    return coverPhoto
      ? ACTIVITY_MEDIA_FILE_ENDPOINT.replace('{activityId}', activity.id.toString()).replace(
          '{fileId}',
          coverPhoto.fileId.toString()
        )
      : '/assets/activity-media.svg';
  }, [activity.id, coverPhoto]);

  return (
    <Grid
      container
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      id={`activity-log-item-${activity.id}`}
      onClick={onClick}
      paddingY={theme.spacing(2)}
      sx={{
        backgroundColor: focused ? theme.palette.TwClrBgSecondary : undefined,
        borderBottom: '1px solid',
        borderColor: theme.palette.TwClrBrdrTertiary,
      }}
    >
      <Grid item paddingRight={theme.spacing(2)} xs='auto'>
        <img
          alt={coverPhoto?.caption}
          height='100'
          src={coverPhotoURL}
          style={{
            backgroundColor: theme.palette.TwClrBgSecondary,
            objectFit: 'cover',
          }}
          width='100'
        />
      </Grid>

      <Grid item xs={true}>
        <Typography color={theme.palette.TwClrTxtBrand} fontSize='20px' fontWeight='600' lineHeight='28px'>
          {activityType}
        </Typography>

        {isAcceleratorRoute && (
          <Box marginY={theme.spacing(1)}>
            {isChanged && <ActivityStatusBadge status='Changed' />}
            <ActivityStatusBadge status={activity.isVerified ? 'Verified' : 'Not Verified'} />
            {/* TODO: render badge for 'Do Not Use' when applicable */}
            {/* TODO: render badge for 'Published' when applicable */}
          </Box>
        )}

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
  const mapDrawerRef = useRef<HTMLDivElement | null>(null);
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const dispatch = useAppDispatch();
  const navigate = useSyncNavigate();
  const query = useQuery();
  const location = useStateLocation();
  const snackbar = useSnackbar();
  const theme = useTheme();

  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const [requestId, setRequestId] = useState('');
  const [busy, setBusy] = useState<boolean>(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [focusedActivityId, setFocusedActivityId] = useState<number | undefined>(undefined);
  const [focusedFileId, setFocusedFileId] = useState<number | undefined>(undefined);
  const [hoveredActivityId, setHoveredActivityId] = useState<number | undefined>(undefined);
  const [hoveredFileId, setHoveredFileId] = useState<number | undefined>(undefined);

  const { scrollToElementById } = useMapDrawer(mapDrawerRef);

  const listActivitiesRequest = useAppSelector(selectActivityList(requestId));
  const adminListActivitiesRequest = useAppSelector(selectAdminActivityList(requestId));

  useEffect(() => {
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
    if (listActivitiesRequest?.status === 'pending' || adminListActivitiesRequest?.status === 'pending') {
      setBusy(true);
      setActivities([]);
    } else if (listActivitiesRequest?.status === 'error' || adminListActivitiesRequest?.status === 'error') {
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

  const showActivityId = useMemo(() => {
    const activityIdParam = query.get('activityId');
    return activityIdParam ? Number(activityIdParam) : undefined;
  }, [query]);

  const shownActivity = useMemo(
    () => activities.find((activity) => activity.id === showActivityId),
    [activities, showActivityId]
  );

  const activitiesVisibleOnMap = useMemo(
    () => (showActivityId && shownActivity ? [shownActivity] : activities),
    [activities, shownActivity, showActivityId]
  );

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

  const activityMarkerHighlighted = useCallback(
    (activityId: number, fileId: number) => {
      const ids = [focusedActivityId, focusedFileId, hoveredActivityId, hoveredFileId];
      return ids.includes(activityId) || ids.includes(fileId);
    },
    [focusedActivityId, focusedFileId, hoveredActivityId, hoveredFileId]
  );

  const onActivityMarkerClick = useCallback((activityId: number, fileId: number) => {
    setFocusedActivityId((prevValue) => (prevValue === activityId ? undefined : activityId));
    setFocusedFileId((prevValue) => (prevValue === fileId ? undefined : fileId));
  }, []);

  const setHoverActivityCallback = useCallback(
    (activityId: number, hover: boolean) => () => {
      setHoveredActivityId(hover ? activityId : undefined);
    },
    []
  );

  const setHoverFileCallback = useCallback(
    (fileId: number, hover: boolean) => () => {
      setHoveredFileId(hover ? fileId : undefined);
    },
    []
  );

  // update url and navigation history when navigating to activity detail view
  const getOnClickActivityListItem = useCallback(
    (activityId: number) => () => {
      query.set('activityId', activityId.toString());
      navigate(getLocation(location.pathname, location, query.toString()));
    },
    [location, navigate, query]
  );

  useEffect(() => {
    if (focusedActivityId !== undefined) {
      scrollToElementById(`activity-log-item-${focusedActivityId}`);
    }
  }, [focusedActivityId, scrollToElementById]);

  return (
    <MapSplitView
      activities={activitiesVisibleOnMap} // TODO: Use visible activities after pagination/filtering
      activityMarkerHighlighted={activityMarkerHighlighted}
      drawerRef={mapDrawerRef}
      onActivityMarkerClick={onActivityMarkerClick}
      projectId={projectId}
    >
      {showActivityId && shownActivity ? (
        <ActivityDetailView
          activity={shownActivity}
          hoveredFileId={hoveredFileId}
          setHoverFileCallback={setHoverFileCallback}
        />
      ) : activities.length === 0 && !busy ? (
        <ActivitiesEmptyState projectId={projectId} />
      ) : (
        <>
          <DateRange
            field='dateRange'
            onChange={onChangeDateRange}
            onDelete={onDeleteDateRange}
            values={filters.dateRange?.values ?? []}
          />
          {groupedActivities.length === 0 && !busy ? (
            <Typography color={theme.palette.TwClrTxt} fontSize='20px' fontWeight={400} marginTop={theme.spacing(2)}>
              {strings.NO_ACTIVITIES_TO_SHOW}
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
                  <ActivityListItem
                    activity={activity}
                    focused={activity.id === focusedActivityId || activity.id === hoveredActivityId}
                    key={activity.id}
                    onClick={getOnClickActivityListItem(activity.id)}
                    onMouseEnter={setHoverActivityCallback(activity.id, true)}
                    onMouseLeave={setHoverActivityCallback(activity.id, false)}
                  />
                ))}
              </Fragment>
            ))
          )}
        </>
      )}
    </MapSplitView>
  );
};

export default ActivitiesListView;
