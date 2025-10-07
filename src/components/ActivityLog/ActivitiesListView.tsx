import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { requestAdminListActivities, requestListActivities } from 'src/redux/features/activities/activitiesAsyncThunks';
import { selectActivityList, selectAdminActivityList } from 'src/redux/features/activities/activitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ACTIVITY_MEDIA_FILE_ENDPOINT } from 'src/services/ActivityService';
import { ACTIVITY_TYPES, Activity, activityTypeLabel } from 'src/types/Activity';
import { FieldNodePayload, FieldOptionsMap, SearchNodePayload } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import useMapDrawer from '../NewMap/useMapDrawer';
import useMapUtils from '../NewMap/useMapUtils';
import { FilterField } from '../common/FilterGroup';
import { FilterConfig } from '../common/SearchFiltersWrapperV2';
import IconFilters from '../common/SearchFiltersWrapperV2/IconFilters';
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
      ? `${ACTIVITY_MEDIA_FILE_ENDPOINT.replace('{activityId}', activity.id.toString()).replace(
          '{fileId}',
          coverPhoto.fileId.toString()
        )}?maxHeight=200&maxWidth=200`
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
  const mapRef = useRef<MapRef | null>(null);
  const { easeTo, getCurrentViewState } = useMapUtils(mapRef);
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
  const [results, setResults] = useState<Activity[]>([]);
  const [resultsRequestId, setResultsRequestId] = useState('');
  const [focusedActivityId, setFocusedActivityId] = useState<number | undefined>(undefined);
  const [focusedFileId, setFocusedFileId] = useState<number | undefined>(undefined);
  const [hoveredActivityId, setHoveredActivityId] = useState<number | undefined>(undefined);
  const [hoveredFileId, setHoveredFileId] = useState<number | undefined>(undefined);

  const { scrollToElementById } = useMapDrawer(mapDrawerRef);

  const listActivitiesRequest = useAppSelector(selectActivityList(requestId));
  const adminListActivitiesRequest = useAppSelector(selectAdminActivityList(requestId));

  const listResultsActivitiesRequest = useAppSelector(selectActivityList(resultsRequestId));
  const adminListResultsActivitiesRequest = useAppSelector(selectAdminActivityList(resultsRequestId));

  const [filterOptions, setFilterOptions] = useState<FieldOptionsMap>({});

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
  }, [activeLocale, dispatch, filters, isAcceleratorRoute, projectId]);

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

  useEffect(() => {
    if (showActivityId !== undefined) {
      // Entering one activity details, set focus to the selected activity
      setFocusedActivityId(showActivityId);
    } else {
      // Existing one activity detailed view. Clear file states
      setFocusedFileId(undefined);
    }
  }, [showActivityId]);

  const shownActivity = useMemo(
    () => activities.find((activity) => activity.id === showActivityId),
    [activities, showActivityId]
  );

  const activitiesVisibleOnMap = useMemo(
    () => (showActivityId && shownActivity ? [shownActivity] : activities),
    [activities, shownActivity, showActivityId]
  );

  useEffect(() => {
    if (listResultsActivitiesRequest?.status === 'error' || adminListResultsActivitiesRequest?.status === 'error') {
      setBusy(false);
      snackbar.toastError(strings.GENERIC_ERROR);
    } else if (
      listResultsActivitiesRequest?.status === 'success' ||
      adminListResultsActivitiesRequest?.status === 'success'
    ) {
      setBusy(false);
      setResults((listResultsActivitiesRequest?.data || adminListResultsActivitiesRequest?.data || []) as Activity[]);

      const result = {} as FieldOptionsMap;

      result.type = { partial: false, values: ACTIVITY_TYPES };
      result.isVerified = { partial: false, values: [strings.YES, strings.NO] };

      setFilterOptions(result);
    }
  }, [adminListResultsActivitiesRequest, listResultsActivitiesRequest, snackbar, strings]);

  useEffect(() => {
    setBusy(true);

    const searchNodeChildren: SearchNodePayload[] = [];
    if (Object.keys(filters).length > 0) {
      const filterValueChildren = Object.keys(filters)
        .filter((field: string) => field !== 'isVerified' && (filters[field]?.values || []).length > 0)
        .map((field: string): SearchNodePayload => filters[field]);

      if (filters.isVerified) {
        const searchValues: (string | null)[] = [];
        const selectedValues = filters.isVerified.values as string[];
        if (selectedValues.find((s) => s === strings.YES)) {
          searchValues.push(strings.BOOLEAN_TRUE);
        }
        if (selectedValues.find((s) => s === strings.NO)) {
          searchValues.push(strings.BOOLEAN_FALSE);
          searchValues.push(null);
        }
        const newNode: FieldNodePayload = {
          operation: 'field',
          field: 'isVerified',
          type: 'Exact',
          values: searchValues,
        };
        filterValueChildren.push(newNode);
      }

      searchNodeChildren.push({
        operation: 'and',
        children: filterValueChildren,
      });
    }

    const search: SearchNodePayload = {
      operation: 'and',
      children: searchNodeChildren,
    };

    if (isAcceleratorRoute) {
      const request = dispatch(
        requestAdminListActivities({ includeMedia: true, locale: activeLocale || undefined, projectId, search })
      );
      setResultsRequestId(request.requestId);
    } else {
      const request = dispatch(
        requestListActivities({ includeMedia: true, locale: activeLocale || undefined, projectId, search })
      );
      setResultsRequestId(request.requestId);
    }
  }, [activeLocale, activities, dispatch, filters, isAcceleratorRoute, projectId, strings]);

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
    (filter: SearchNodePayload) => onFilterChange('date', filter),
    [onFilterChange]
  );

  const onDeleteDateRange = useCallback(() => onDeleteFilter('date'), [onDeleteFilter]);

  // group activities by quarter and year
  const groupedActivities = useMemo(() => {
    const groups: Record<string, Activity[]> = {};

    results.forEach((activity) => {
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
  }, [results, strings]);

  const activityMarkerHighlighted = useCallback(
    (activityId: number, fileId: number) => {
      if (showActivityId !== undefined) {
        // One activity is selected
        return fileId === focusedFileId || fileId === hoveredFileId;
      } else {
        return activityId === focusedActivityId || activityId === hoveredActivityId;
      }
    },
    [focusedActivityId, focusedFileId, hoveredActivityId, hoveredFileId, showActivityId]
  );

  const onActivityMarkerClick = useCallback(
    (activityId: number, fileId: number) => {
      if (showActivityId !== undefined) {
        // One activity is selected
        if (focusedFileId === fileId) {
          setFocusedFileId(undefined);
        } else {
          setFocusedFileId(fileId);
          scrollToElementById(`activity-media-item-${fileId}`);
        }
      } else {
        if (focusedActivityId === activityId) {
          setFocusedActivityId(undefined);
        } else {
          setFocusedActivityId(activityId);
          scrollToElementById(`activity-log-item-${activityId}`);
        }
      }
    },
    [focusedActivityId, focusedFileId, scrollToElementById, showActivityId]
  );

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

  const onMediaItemClick = useCallback(
    (fileId: number) => () => {
      if (shownActivity) {
        if (focusedFileId === fileId) {
          setFocusedFileId(undefined);
          return;
        }
        setFocusedFileId(fileId);
        const media = shownActivity.media.find((mediaFile) => mediaFile.fileId === fileId);
        const viewState = getCurrentViewState();
        if (media && !media.isHiddenOnMap && media.geolocation && viewState) {
          easeTo({
            latitude: media.geolocation.coordinates[1],
            longitude: media.geolocation.coordinates[0],
            zoom: viewState.zoom,
          });
        }
      }
    },
    [shownActivity, easeTo, focusedFileId, getCurrentViewState]
  );

  // update url and navigation history when navigating to activity detail view
  const getOnClickActivityListItem = useCallback(
    (activityId: number) => () => {
      query.set('activityId', activityId.toString());
      navigate(getLocation(location.pathname, location, query.toString()));
    },
    [location, navigate, query]
  );

  const filterColumns = useMemo<FilterField[]>(
    () =>
      activeLocale
        ? isAcceleratorRoute
          ? [
              { name: 'type', label: strings.TYPE, type: 'multiple_selection' },
              { name: 'isVerified', label: strings.VERIFIED, type: 'multiple_selection' },
            ]
          : [{ name: 'type', label: strings.TYPE, type: 'multiple_selection' }]
        : [],
    [activeLocale, strings, isAcceleratorRoute]
  );

  const iconFilters: FilterConfig[] = useMemo(() => {
    const _filters = filterColumns.map((filter) => ({
      field: filter.name,
      label: filter.label,
      options: filterOptions?.[filter.name]?.values || [],
    }));

    return activeLocale ? _filters : [];
  }, [activeLocale, filterColumns, filterOptions]);

  return (
    <MapSplitView
      activities={activitiesVisibleOnMap} // TODO: Use visible activities after pagination/filtering
      activityMarkerHighlighted={activityMarkerHighlighted}
      drawerRef={mapDrawerRef}
      mapRef={mapRef}
      onActivityMarkerClick={onActivityMarkerClick}
      projectId={projectId}
    >
      {showActivityId && shownActivity ? (
        <ActivityDetailView
          activity={shownActivity}
          focusedFileId={focusedFileId}
          hoveredFileId={hoveredFileId}
          onMediaItemClick={onMediaItemClick}
          setHoverFileCallback={setHoverFileCallback}
        />
      ) : activities.length === 0 && !busy ? (
        <ActivitiesEmptyState projectId={projectId} />
      ) : (
        <>
          <Box display={'flex'}>
            <DateRange
              field='date'
              onChange={onChangeDateRange}
              onDelete={onDeleteDateRange}
              values={filters.date?.values ?? []}
            />
            <IconFilters filters={iconFilters} setCurrentFilters={setFilters} currentFilters={filters} noScroll />
          </Box>
          {(!groupedActivities || groupedActivities.length === 0) && !busy ? (
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
