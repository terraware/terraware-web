import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, Grid, Pagination, Typography, useTheme } from '@mui/material';
import { Icon, PillList, PillListItem } from '@terraware/web-components';

import isEnabled from 'src/features';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { requestAdminListActivities, requestListActivities } from 'src/redux/features/activities/activitiesAsyncThunks';
import { selectActivityList, selectAdminActivityList } from 'src/redux/features/activities/activitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ACTIVITY_MEDIA_FILE_ENDPOINT } from 'src/services/ActivityService';
import {
  ACTIVITY_STATUSES,
  ACTIVITY_TYPES,
  Activity,
  ActivityStatus,
  ActivityType,
  activityStatusTagLabel,
  activityTypeLabel,
} from 'src/types/Activity';
import { FieldOptionsMap, SearchNodePayload } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import { MapPoint } from '../NewMap/types';
import useMapDrawer from '../NewMap/useMapDrawer';
import useMapUtils from '../NewMap/useMapUtils';
import { getBoundingBoxFromPoints } from '../NewMap/utils';
import { FilterField } from '../common/FilterGroup';
import { FilterConfig, FilterConfigWithValues, defaultPillValueRenderer } from '../common/SearchFiltersWrapperV2';
import IconFilters from '../common/SearchFiltersWrapperV2/IconFilters';
import ActivitiesEmptyState from './ActivitiesEmptyState';
import ActivityDetailView from './ActivityDetailView';
import ActivityStatusBadges from './ActivityStatusBadges';
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
  const isActivityHighlightEnabled = isEnabled('Activity Log Highlights');

  const coverPhoto = useMemo(() => activity.media.find((file) => file.isCoverPhoto), [activity.media]);

  const activityType = useMemo(() => activityTypeLabel(activity.type, strings), [activity.type, strings]);

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
        cursor: 'pointer',
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
        <Box display='flex' justifyContent={'space-between'} alignItems={'center'}>
          <Typography color={theme.palette.TwClrTxtBrand} fontSize='20px' fontWeight='600' lineHeight='28px'>
            {activityType}
          </Typography>
          {isDesktop && (
            <Grid item xs='auto'>
              <Typography>{activity.date}</Typography>
            </Grid>
          )}
        </Box>
        <Box display='flex' justifyContent={'space-between'} alignItems={'center'}>
          <Box>{isAcceleratorRoute && <ActivityStatusBadges activity={activity} />}</Box>
          {activity.isHighlight && isAcceleratorRoute && isActivityHighlightEnabled && (
            <Icon name='star' size='medium' fillColor={theme.palette.TwClrBaseYellow200} />
          )}
        </Box>

        <Typography>{activity.description}</Typography>
        {!isDesktop && <Typography>{activity.date}</Typography>}
      </Grid>
    </Grid>
  );
};

type ActivitiesListViewProps = {
  overrideHeightOffsetPx?: number;
  projectId: number;
};

const ActivitiesListView = ({ overrideHeightOffsetPx, projectId }: ActivitiesListViewProps): JSX.Element => {
  const { activeLocale, strings } = useLocalization();
  const mapDrawerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const { fitBounds, getCurrentViewState, jumpTo } = useMapUtils(mapRef);
  const { scrollToElementById, scrollToTop } = useMapDrawer(mapDrawerRef);
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const dispatch = useAppDispatch();
  const navigate = useSyncNavigate();
  const query = useQuery();
  const location = useStateLocation();
  const snackbar = useSnackbar();
  const theme = useTheme();

  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const [filterOptions, setFilterOptions] = useState<FieldOptionsMap>({});
  const [requestId, setRequestId] = useState('');
  const [busy, setBusy] = useState<boolean>(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [results, setResults] = useState<Activity[]>([]);
  const [resultsRequestId, setResultsRequestId] = useState('');
  const [focusedActivityId, setFocusedActivityId] = useState<number | undefined>(undefined);
  const [focusedFileId, setFocusedFileId] = useState<number | undefined>(undefined);
  const [hoveredActivityId, setHoveredActivityId] = useState<number | undefined>(undefined);
  const [hoveredFileId, setHoveredFileId] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const listActivitiesRequest = useAppSelector(selectActivityList(requestId));
  const adminListActivitiesRequest = useAppSelector(selectAdminActivityList(requestId));
  const listResultsActivitiesRequest = useAppSelector(selectActivityList(resultsRequestId));
  const adminListResultsActivitiesRequest = useAppSelector(selectAdminActivityList(resultsRequestId));

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
      // Exiting one activity detailed view, clear focused & hovered states
      setFocusedActivityId(undefined);
      setFocusedFileId(undefined);
      setHoveredActivityId(undefined);
      setHoveredFileId(undefined);
    }
  }, [showActivityId]);

  const shownActivity = useMemo(
    () => activities.find((activity) => activity.id === showActivityId),
    [activities, showActivityId]
  );

  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return results.slice(startIndex, endIndex);
  }, [results, currentPage, itemsPerPage]);

  const activitiesVisibleOnMap = useMemo(
    () => (showActivityId && shownActivity ? [shownActivity] : paginatedActivities),
    [paginatedActivities, shownActivity, showActivityId]
  );

  useEffect(() => {
    if (shownActivity) {
      const points = shownActivity.media
        .map((_media): MapPoint | undefined => {
          if (!_media.isHiddenOnMap && _media.geolocation) {
            return {
              lat: _media.geolocation.coordinates[1],
              lng: _media.geolocation.coordinates[0],
            };
          }
        })
        .filter((point): point is MapPoint => point !== undefined);

      if (points.length > 0) {
        const bbox = getBoundingBoxFromPoints(points);
        fitBounds(bbox);
      }
    }
  }, [fitBounds, shownActivity]);

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

      const activityFilterOptions = {
        status: { partial: false, values: ACTIVITY_STATUSES },
        type: { partial: false, values: ACTIVITY_TYPES },
      } as FieldOptionsMap;

      setFilterOptions(activityFilterOptions);
    }
  }, [adminListResultsActivitiesRequest, listResultsActivitiesRequest, snackbar, strings]);

  useEffect(() => {
    setBusy(true);

    const searchNodeChildren: SearchNodePayload[] = [];
    if (Object.keys(filters).length > 0) {
      const filterValueChildren = Object.keys(filters)
        .filter((field: string) => (filters[field]?.values || []).length > 0)
        .map((field: string): SearchNodePayload => filters[field]);

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

    paginatedActivities.forEach((activity) => {
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
  }, [paginatedActivities, strings]);

  const totalPages = useMemo(() => {
    return Math.ceil(results.length / itemsPerPage);
  }, [results.length, itemsPerPage]);

  const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

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

  const onClickMediaItem = useCallback(
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
          jumpTo({
            latitude: media.geolocation.coordinates[1],
            longitude: media.geolocation.coordinates[0],
            zoom: viewState.zoom,
          });
        }
      }
    },
    [shownActivity, jumpTo, focusedFileId, getCurrentViewState]
  );

  // update url and navigation history when navigating to activity detail view
  const getOnClickActivityListItem = useCallback(
    (activityId: number) => () => {
      query.set('activityId', activityId.toString());
      navigate(getLocation(location.pathname, location, query.toString()));
      scrollToTop();
    },
    [location, navigate, query, scrollToTop]
  );

  const filterColumns = useMemo<FilterField[]>(
    () =>
      isAcceleratorRoute
        ? [
            {
              name: 'type',
              label: strings.TYPE,
              pillValueRenderer: (values: (string | number | null)[]) =>
                values.map((value) => activityTypeLabel(value as ActivityType, strings)).join(', '),
              type: 'multiple_selection',
            },
            {
              name: 'status',
              label: strings.STATUS,
              pillValueRenderer: (values: (string | number | null)[]) =>
                values.map((value) => activityStatusTagLabel(value as ActivityStatus, strings)).join(', '),
              type: 'multiple_selection',
            },
          ]
        : [{ name: 'type', label: strings.TYPE, type: 'multiple_selection' }],
    [strings, isAcceleratorRoute]
  );

  const iconFilters: FilterConfig[] = useMemo(() => {
    const _filters = filterColumns.map((filter) => ({
      field: filter.name,
      label: filter.label,
      options: filterOptions?.[filter.name]?.values || [],
      pillValueRenderer: filter.pillValueRenderer,
    }));

    return activeLocale ? _filters : [];
  }, [activeLocale, filterColumns, filterOptions]);

  const featuredFilters: FilterConfigWithValues[] = useMemo(() => {
    const fFilters: FilterConfigWithValues[] = [
      {
        field: 'date',
        label: strings.DATE,
        options: [],
        pillValueRenderer: (values: (string | number | null)[]) => values.map((value) => value).join(', '),
        renderOption: (value: string | number) => value.toString(),
      },
    ];

    return fFilters;
  }, [strings]);

  const filterPillData = useMemo(() => {
    return Object.keys(filters)
      .map((key): PillListItem<string> | false => {
        // If there are no values, there should be no pill
        if (!filters[key] || (filters[key].values || []).length === 0) {
          return false;
        }

        const filterConfig = [...(iconFilters || []), ...(featuredFilters || [])].find(
          (filter: FilterConfig) => filter.field === key
        );

        if (!filterConfig) {
          // Should not be possible, a filter must be present at this point
          return false;
        }

        const pillValue = filterConfig.pillValueRenderer
          ? filterConfig.pillValueRenderer(filters[key].values)
          : defaultPillValueRenderer(filters[key].values);
        const label = filterConfig.label;

        const removeFilter = (k: string) => {
          const result = { ...filters };
          delete result[k];
          setFilters(result);
        };

        return {
          id: key,
          label,
          value: pillValue || '',
          onRemove: () => removeFilter(key),
        };
      })
      .filter((item: PillListItem<string> | false): item is PillListItem<string> => !!item);
  }, [featuredFilters, filters, iconFilters]);

  return (
    <MapSplitView
      activities={activitiesVisibleOnMap}
      activityMarkerHighlighted={activityMarkerHighlighted}
      drawerRef={mapDrawerRef}
      mapRef={mapRef}
      heightOffsetPx={overrideHeightOffsetPx ?? 256}
      onActivityMarkerClick={onActivityMarkerClick}
      projectId={projectId}
    >
      {showActivityId && shownActivity ? (
        <ActivityDetailView
          activity={shownActivity}
          focusedFileId={focusedFileId}
          hoveredFileId={hoveredFileId}
          onClickMediaItem={onClickMediaItem}
          projectId={projectId}
          setHoverFileCallback={setHoverFileCallback}
        />
      ) : activities.length === 0 && !busy ? (
        <ActivitiesEmptyState projectId={projectId} />
      ) : (
        <>
          <DateRange
            field='date'
            iconFilters={
              <IconFilters filters={iconFilters} setCurrentFilters={setFilters} currentFilters={filters} noScroll />
            }
            onChange={onChangeDateRange}
            onDelete={onDeleteDateRange}
            rightComponent={filterPillData.length ? <PillList data={filterPillData} /> : undefined}
            values={filters.date?.values ?? []}
          />
          {(!groupedActivities || groupedActivities.length === 0) && !busy ? (
            <Typography color={theme.palette.TwClrTxt} fontSize='20px' fontWeight={400} marginTop={theme.spacing(2)}>
              {strings.NO_ACTIVITIES_TO_SHOW}
            </Typography>
          ) : (
            <>
              {groupedActivities.map(({ quarter, activities: groupActivities }) => (
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
              ))}
              {totalPages > 1 && (
                <Box display='flex' justifyContent='center' marginTop={theme.spacing(3)} alignItems='center'>
                  <Typography fontSize={'14px'} paddingRight={'8px'}>
                    {strings.formatString(
                      strings.PAGINATION_FOOTER_RANGE,
                      (currentPage - 1) * itemsPerPage + 1,
                      Math.min(currentPage * itemsPerPage, results.length),
                      results.length
                    )}
                  </Typography>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    sx={{
                      '.MuiButtonBase-root.MuiPaginationItem-root.Mui-selected': {
                        backgroundColor: theme.palette.TwClrBgGhostActive,
                        borderRadius: '4px',
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}
    </MapSplitView>
  );
};

export default ActivitiesListView;
