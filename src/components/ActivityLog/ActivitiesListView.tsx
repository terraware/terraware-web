import React, { Fragment, type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, Grid, Pagination, Tooltip, Typography, useTheme } from '@mui/material';
import { Icon, PillList, PillListItem } from '@terraware/web-components';
import { ColumnHeader } from 'export-to-csv';

import { MapPoint } from 'src/components/NewMap/types';
import useMapDrawer from 'src/components/NewMap/useMapDrawer';
import useMapUtils from 'src/components/NewMap/useMapUtils';
import { getBoundingBoxFromPoints } from 'src/components/NewMap/utils';
import { FilterField } from 'src/components/common/FilterGroup';
import ExportTableComponent, {
  ExportTableProps,
} from 'src/components/common/SearchFiltersWrapper/ExportTableComponent';
import {
  FilterConfig,
  FilterConfigWithValues,
  defaultPillValueRenderer,
} from 'src/components/common/SearchFiltersWrapperV2';
import IconFilters from 'src/components/common/SearchFiltersWrapperV2/IconFilters';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useClientSideFilter from 'src/hooks/useClientSideFiltering';
import useFunderPortal from 'src/hooks/useFunderPortal';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { requestAdminListActivities, requestListActivities } from 'src/redux/features/activities/activitiesAsyncThunks';
import { selectActivityList, selectAdminActivityList } from 'src/redux/features/activities/activitiesSelectors';
import { requestListFunderActivities } from 'src/redux/features/funder/activities/funderActivitiesAsyncThunks';
import { selectListFunderActivitiesRequest } from 'src/redux/features/funder/activities/funderActivitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ACTIVITY_MEDIA_FILE_ENDPOINT } from 'src/services/ActivityService';
import { FUNDER_ACTIVITY_MEDIA_FILE_ENDPOINT } from 'src/services/funder/FunderActivityService';
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
import { groupActivitiesByQuarter } from 'src/utils/activityUtils';
import { CsvData } from 'src/utils/csv';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import ActivitiesEmptyState from './ActivitiesEmptyState';
import ActivityDetailView from './ActivityDetailView';
import ActivityHighlightsModal from './ActivityHighlightsModal';
import ActivityStatusBadges from './ActivityStatusBadges';
import DateRange from './FilterDateRange';
import MapSplitView from './MapSplitView';
import { TypedActivity } from './types';

type ActivityListItemProps = {
  activity: TypedActivity;
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
  const { isFunderRoute } = useFunderPortal();

  const coverPhoto = useMemo(() => activity.payload.media.find((file) => file.isCoverPhoto), [activity]);

  const activityType = useMemo(() => activityTypeLabel(activity.payload.type, strings), [activity, strings]);

  const coverPhotoURL = useMemo(() => {
    const baseUrl = activity.type === 'funder' ? FUNDER_ACTIVITY_MEDIA_FILE_ENDPOINT : ACTIVITY_MEDIA_FILE_ENDPOINT;
    return coverPhoto
      ? `${baseUrl
          .replace('{activityId}', activity.payload.id.toString())
          .replace('{fileId}', coverPhoto.fileId.toString())}?maxHeight=200&maxWidth=200`
      : '/assets/activity-media.svg';
  }, [activity, coverPhoto]);

  return (
    <Grid
      container
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      id={`activity-log-item-${activity.payload.id}`}
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
              <Typography>{activity.payload.date}</Typography>
            </Grid>
          )}
        </Box>
        <Box display='flex' justifyContent={'space-between'} alignItems={'center'}>
          <Box>{isAcceleratorRoute && <ActivityStatusBadges activity={activity} />}</Box>
          {activity.payload.isHighlight && (isAcceleratorRoute || isFunderRoute) && (
            <Tooltip title={strings.HIGHLIGHTED_ACTIVITY}>
              <Box display='inline-flex'>
                <Icon name='star' size='medium' fillColor={theme.palette.TwClrBaseYellow200} />
              </Box>
            </Tooltip>
          )}
        </Box>

        <Typography>{activity.payload.description}</Typography>
        {!isDesktop && <Typography>{activity.payload.date}</Typography>}
      </Grid>
    </Grid>
  );
};

type ActivitiesListViewProps = {
  highlightsModalOpen?: boolean;
  overrideHeightOffsetPx?: number;
  projectDealName?: string;
  projectId: number;
  setHighlightsModalOpen?: (open: boolean) => void;
  setSelectedActivity?: React.Dispatch<React.SetStateAction<TypedActivity | undefined>>;
};

const ActivitiesListView = ({
  highlightsModalOpen,
  overrideHeightOffsetPx,
  projectDealName,
  projectId,
  setHighlightsModalOpen,
  setSelectedActivity,
}: ActivitiesListViewProps): JSX.Element => {
  const { activeLocale, strings } = useLocalization();
  const mapDrawerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const { fitBounds, getCurrentViewState, jumpTo } = useMapUtils(mapRef);
  const { scrollToElementById, scrollToTop } = useMapDrawer(mapDrawerRef);
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { isFunderRoute } = useFunderPortal();
  const dispatch = useAppDispatch();
  const navigate = useSyncNavigate();
  const query = useQuery();
  const location = useStateLocation();
  const snackbar = useSnackbar();
  const theme = useTheme();

  const [initialized, setInitialized] = useState(false);
  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const [requestId, setRequestId] = useState('');
  const [activities, setActivities] = useState<TypedActivity[]>([]);
  const [focusedActivityId, setFocusedActivityId] = useState<number | undefined>(undefined);
  const [focusedFileId, setFocusedFileId] = useState<number | undefined>(undefined);
  const [hoveredActivityId, setHoveredActivityId] = useState<number | undefined>(undefined);
  const [hoveredFileId, setHoveredFileId] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const listActivitiesRequest = useAppSelector(selectActivityList(requestId));
  const adminListActivitiesRequest = useAppSelector(selectAdminActivityList(requestId));
  const funderListActivitiesRequest = useAppSelector(selectListFunderActivitiesRequest(requestId));

  const activityFilterOptions: FieldOptionsMap = useMemo(
    () => ({
      status: { partial: false, values: ACTIVITY_STATUSES },
      type: { partial: false, values: ACTIVITY_TYPES },
    }),
    []
  );

  const search = useMemo((): SearchNodePayload | undefined => {
    const searchNodeChildren: SearchNodePayload[] = [];
    if (Object.keys(filters).length > 0) {
      const filterValueChildren = Object.keys(filters)
        .filter((field: string) => (filters[field]?.values || []).length > 0)
        .map((field: string): SearchNodePayload => filters[field]);

      searchNodeChildren.push({
        operation: 'and',
        children: filterValueChildren,
      });

      return {
        operation: 'and',
        children: searchNodeChildren,
      };
    }
  }, [filters]);

  const filteredActivitiesUnsorted = useClientSideFilter(activities, search);

  const filteredActivities = useMemo(() => {
    // Ensure activities are sorted by date descending before pagination
    return [...filteredActivitiesUnsorted].sort((a, b) => {
      const dateA = new Date(a.payload.date).getTime();
      const dateB = new Date(b.payload.date).getTime();
      return dateB - dateA;
    });
  }, [filteredActivitiesUnsorted]);

  const busy = useMemo(() => {
    return (
      listActivitiesRequest?.status === 'pending' ||
      adminListActivitiesRequest?.status === 'pending' ||
      funderListActivitiesRequest?.status === 'pending'
    );
  }, [listActivitiesRequest?.status, adminListActivitiesRequest?.status, funderListActivitiesRequest?.status]);

  const reload = useCallback(() => {
    if (isAcceleratorRoute) {
      const request = dispatch(requestAdminListActivities({ includeMedia: true, projectId }));
      setRequestId(request.requestId);
    } else if (isFunderRoute) {
      const request = dispatch(requestListFunderActivities(projectId));
      setRequestId(request.requestId);
    } else {
      const request = dispatch(requestListActivities({ includeMedia: true, projectId }));
      setRequestId(request.requestId);
    }
  }, [dispatch, isAcceleratorRoute, isFunderRoute, projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (listActivitiesRequest?.status === 'error' || adminListActivitiesRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
      setInitialized(true);
    } else if (listActivitiesRequest?.status === 'success') {
      setActivities(listActivitiesRequest?.data?.map((payload) => ({ type: 'base', payload })) ?? []);
      setInitialized(true);
    } else if (adminListActivitiesRequest?.status === 'success') {
      setActivities(adminListActivitiesRequest?.data?.map((payload) => ({ type: 'admin', payload })) ?? []);
      setInitialized(true);
    } else if (funderListActivitiesRequest?.status === 'success') {
      setActivities(funderListActivitiesRequest?.data?.map((payload) => ({ type: 'funder', payload })) ?? []);
      setInitialized(true);
    }
  }, [
    adminListActivitiesRequest?.data,
    adminListActivitiesRequest?.status,
    funderListActivitiesRequest?.data,
    funderListActivitiesRequest?.status,
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
    () => activities.find((activity) => activity.payload.id === showActivityId),
    [activities, showActivityId]
  );

  useEffect(() => {
    if (setSelectedActivity) {
      setSelectedActivity(shownActivity);
    }
  }, [setSelectedActivity, shownActivity]);

  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredActivities.slice(startIndex, endIndex);
  }, [currentPage, filteredActivities, itemsPerPage]);

  const activitiesVisibleOnMap = useMemo(
    () => (showActivityId && shownActivity ? [shownActivity] : paginatedActivities),
    [paginatedActivities, shownActivity, showActivityId]
  );

  useEffect(() => {
    if (shownActivity) {
      const points = shownActivity.payload.media
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
  const groupedActivities = useMemo(
    () => groupActivitiesByQuarter(paginatedActivities, strings),
    [paginatedActivities, strings]
  );

  const totalPages = useMemo(() => {
    return Math.ceil(filteredActivities.length / itemsPerPage);
  }, [filteredActivities.length, itemsPerPage]);

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
        const media = shownActivity.payload.media.find((mediaFile) => mediaFile.fileId === fileId);
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
        : [
            {
              name: 'type',
              label: strings.TYPE,
              pillValueRenderer: (values: (string | number | null)[]) =>
                values.map((value) => activityTypeLabel(value as ActivityType, strings)).join(', '),
              type: 'multiple_selection',
            },
          ],
    [strings, isAcceleratorRoute]
  );

  const iconFilters: FilterConfig[] = useMemo(() => {
    const _filters = filterColumns.map((filter) => ({
      field: `payload.${filter.name}`,
      label: filter.label,
      options: activityFilterOptions?.[filter.name]?.values || [],
      pillValueRenderer: filter.pillValueRenderer,
    }));

    return activeLocale ? _filters : [];
  }, [activeLocale, activityFilterOptions, filterColumns]);

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
          onDeleteFilter(k);
        };

        return {
          id: key,
          label,
          value: pillValue || '',
          onRemove: () => removeFilter(key),
        };
      })
      .filter((item: PillListItem<string> | false): item is PillListItem<string> => !!item);
  }, [featuredFilters, filters, iconFilters, onDeleteFilter]);

  const exportColumnHeaders = useMemo<ColumnHeader[]>(
    () => [
      {
        key: 'date',
        displayLabel: strings.DATE,
      },
      {
        key: 'type',
        displayLabel: strings.TYPE,
      },
      {
        key: 'description',
        displayLabel: strings.DESCRIPTION,
      },
      ...(isAcceleratorRoute
        ? [
            {
              key: 'status',
              displayLabel: strings.STATUS,
            },
            {
              key: 'isHighlight',
              displayLabel: strings.HIGHLIGHTED_ACTIVITY,
            },
          ]
        : []),
    ],
    [isAcceleratorRoute, strings]
  );

  const convertActivityRow = useCallback(
    (activity: Activity): CsvData => ({
      date: activity.date,
      type: activityTypeLabel(activity.type, strings),
      description: activity.description || '',
      ...(isAcceleratorRoute
        ? {
            status: activityStatusTagLabel(activity.status, strings),
            isHighlight: activity.isHighlight ? strings.YES : strings.NO,
          }
        : {}),
    }),
    [isAcceleratorRoute, strings]
  );

  const retrieveActivities = useCallback(async () => {
    return Promise.resolve(filteredActivities as unknown as CsvData[]);
  }, [filteredActivities]);

  const exportProps: ExportTableProps | undefined = useMemo(() => {
    if (!filteredActivities || filteredActivities.length === 0) {
      return;
    }

    return {
      filename: strings.ACTIVITY_LOG,
      columnHeaders: exportColumnHeaders,
      retrieveResults: retrieveActivities,
      convertRow: convertActivityRow,
    };
  }, [convertActivityRow, exportColumnHeaders, filteredActivities, retrieveActivities, strings.ACTIVITY_LOG]);

  return (
    <>
      {highlightsModalOpen && setHighlightsModalOpen && (
        <ActivityHighlightsModal
          activities={activities}
          busy={busy}
          open={highlightsModalOpen}
          projectId={projectId}
          setOpen={setHighlightsModalOpen}
          title={projectDealName}
        />
      )}
      <Box sx={isFunderRoute ? { '& .map-drawer--body': { padding: '24px' } } : undefined}>
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
              reload={reload}
            />
          ) : activities.length === 0 && initialized && !busy ? (
            <ActivitiesEmptyState projectId={projectId} />
          ) : (
            <>
              <DateRange
                field='payload.date'
                iconFilters={
                  <IconFilters filters={iconFilters} setCurrentFilters={setFilters} currentFilters={filters} noScroll />
                }
                exportButton={exportProps && <ExportTableComponent {...exportProps} />}
                onChange={onChangeDateRange}
                onDelete={onDeleteDateRange}
                rightComponent={filterPillData.length ? <PillList data={filterPillData} /> : undefined}
                values={filters.date?.values ?? []}
              />
              {(!groupedActivities || groupedActivities.length === 0) && initialized && !busy ? (
                <Typography
                  color={theme.palette.TwClrTxt}
                  fontSize='20px'
                  fontWeight={400}
                  marginTop={theme.spacing(2)}
                >
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
                          focused={
                            activity.payload.id === focusedActivityId || activity.payload.id === hoveredActivityId
                          }
                          key={activity.payload.id}
                          onClick={getOnClickActivityListItem(activity.payload.id)}
                          onMouseEnter={setHoverActivityCallback(activity.payload.id, true)}
                          onMouseLeave={setHoverActivityCallback(activity.payload.id, false)}
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
                          Math.min(currentPage * itemsPerPage, filteredActivities.length),
                          filteredActivities.length
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
      </Box>
    </>
  );
};

export default ActivitiesListView;
