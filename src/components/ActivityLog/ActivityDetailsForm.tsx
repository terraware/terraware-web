import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, Checkbox, Dropdown, DropdownItem, Icon, Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { getTodaysDateFormatted } from '@terraware/web-components/utils/date';
import { DateTime } from 'luxon';

import Card from 'src/components/common/Card';
import DatePicker from 'src/components/common/DatePicker';
import PageForm from 'src/components/common/PageForm';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useAcceleratorProjects } from 'src/hooks/useAcceleratorProjects';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useProjects } from 'src/hooks/useProjects';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization, useUser } from 'src/providers/hooks';
import { baseApi } from 'src/queries/baseApi';
import {
  useAdminCreateActivityMutation,
  useAdminUpdateActivityMutation,
  useCreateActivityMutation,
  useDeleteActivityMutation,
  useLazyAdminGetActivityQuery,
  useLazyGetActivityQuery,
  useUpdateActivityMutation,
} from 'src/queries/generated/activities';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { QueryTagTypes } from 'src/queries/tags';
import { requestSyncActivityMedia } from 'src/redux/features/activities/activitiesAsyncThunks';
import { selectSyncActivityMedia } from 'src/redux/features/activities/activitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import {
  ACTIVITY_STATUSES,
  ACTIVITY_TYPES,
  Activity,
  ActivityPayload,
  ActivityStatus,
  ActivityType,
  AdminActivityPayload,
  AdminCreateActivityRequestPayload,
  CreateActivityRequestPayload,
  UpdateActivityRequestPayload,
  activityStatusTagLabel,
  activityTypeLabel,
} from 'src/types/Activity';
import { isObservationActivity } from 'src/utils/activityUtils';
import { getObservationSpeciesLivePlantsCount } from 'src/utils/observation';
import useForm from 'src/utils/useForm';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { useUserTimeZone } from 'src/utils/useTimeZoneUtils';

import useMapDrawer from '../NewMap/useMapDrawer';
import useMapUtils from '../NewMap/useMapUtils';
import ActivityMediaForm, {
  ActivityMediaItem,
  ExistingActivityMediaItem,
  NewActivityMediaItem,
} from './ActivityMediaForm';
import ActivityStatField from './ActivityStatField';
import ActivityStatusBadges from './ActivityStatusBadges';
import DeleteActivityModal from './DeleteActivityModal';
import MapSplitView from './MapSplitView';
import ObservationStatsPanel from './ObservationStatsPanel';
import { TypedActivity } from './types';

interface ActivityDetailsFormProps {
  activityId?: number;
  projectId: number;
}

type SavableActivity = (CreateActivityRequestPayload | UpdateActivityRequestPayload) & Activity;

type FormRecord = Partial<SavableActivity> | undefined;

export default function ActivityDetailsForm({ activityId, projectId }: ActivityDetailsFormProps): JSX.Element {
  const { strings } = useLocalization();
  const { isAllowed } = useUser();

  const userTimeZone = useUserTimeZone();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { acceleratorProjects } = useAcceleratorProjects();
  const { selectedProject } = useProjects({ projectId });
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const navigate = useSyncNavigate();
  const { goToAcceleratorActivityLog, goToActivityLog, goToAcceleratorProject } = useNavigateTo();
  const location = useStateLocation();
  const query = useQuery();

  const [source, setSource] = useState<string | null>();
  const [record, setRecord, onChange, onChangeCallback] = useForm<FormRecord>(undefined);
  const [mediaItems, setMediaItems] = useState<ActivityMediaItem[]>([]);
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [syncMediaRequestId, setSyncMediaRequestId] = useState('');
  const [busy, setBusy] = useState<boolean>(false);
  const [deleteActivityModalOpen, setDeleteActivityModalOpen] = useState<boolean>(false);

  const [fetchAdminActivity, { currentData: adminGetData, isError: adminGetError }] = useLazyAdminGetActivityQuery();
  const [fetchActivity, { currentData: getData, isError: getError }] = useLazyGetActivityQuery();

  useEffect(() => {
    if (!activityId) {
      return;
    }
    if (isAcceleratorRoute) {
      void fetchAdminActivity(activityId, true);
    } else {
      void fetchActivity(activityId, true);
    }
  }, [activityId, fetchActivity, fetchAdminActivity, isAcceleratorRoute]);

  const activity = useMemo<TypedActivity | undefined>(() => {
    if (adminGetData?.activity) {
      return { type: 'admin', payload: adminGetData.activity };
    }
    if (getData?.activity) {
      return { type: 'base', payload: getData.activity };
    }
    return undefined;
  }, [adminGetData, getData]);

  const isObsActivity = useMemo(() => isObservationActivity(activity?.payload ?? {}), [activity]);

  const { data: observationResultsData } = useGetObservationResultsQuery(
    { observationId: activity?.payload.observation?.observationId as number },
    { skip: !activity?.payload.observation?.observationId }
  );

  const obsSpecies = useMemo(
    () =>
      observationResultsData?.observation.species?.length
        ? observationResultsData.observation.species
        : observationResultsData?.observation.adHocPlot?.species,
    [observationResultsData]
  );

  const observationLivePlants = useMemo(() => getObservationSpeciesLivePlantsCount(obsSpecies), [obsSpecies]);

  const observationPlantDensity =
    observationResultsData?.observation.plantingDensity ??
    observationResultsData?.observation.adHocPlot?.plantingDensity;

  const observationSurvivalRate =
    observationResultsData?.observation.survivalRate ?? observationResultsData?.observation.adHocPlot?.survivalRate;

  const { obsPlotNumberToIdMap, obsPlotOptions } = useMemo(() => {
    const plotNumberToIdMap: Record<number, number> = {};
    const plotOptions: { plotId: number; plotNumber: number }[] = [];
    const obs = observationResultsData?.observation;
    if (obs) {
      obs.strata?.forEach((stratum) =>
        stratum.substrata?.forEach((substratum) =>
          substratum.monitoringPlots?.forEach((plot) => {
            plotNumberToIdMap[plot.monitoringPlotNumber] = plot.monitoringPlotId;
            plotOptions.push({ plotId: plot.monitoringPlotId, plotNumber: plot.monitoringPlotNumber });
          })
        )
      );
      if (obs.adHocPlot) {
        plotNumberToIdMap[obs.adHocPlot.monitoringPlotNumber] = obs.adHocPlot.monitoringPlotId;
        plotOptions.push({ plotId: obs.adHocPlot.monitoringPlotId, plotNumber: obs.adHocPlot.monitoringPlotNumber });
      }
    }
    return { obsPlotNumberToIdMap: plotNumberToIdMap, obsPlotOptions: plotOptions };
  }, [observationResultsData]);

  const obsMonthYear = useMemo(() => {
    if (!isObsActivity || !activity?.payload.date) {
      return undefined;
    }
    const dt = DateTime.fromISO(activity.payload.date);
    return dt.isValid ? dt.toFormat('LLLL yyyy') : undefined;
  }, [activity, isObsActivity]);

  const obsIsAdHoc = activity?.payload.observation?.isAdHoc ?? false;
  const obsPlotNumber = activity?.payload.observation?.monitoringPlotNumber;

  const obsTitle = useMemo(() => {
    if (!isObsActivity) {
      return undefined;
    }
    if (obsIsAdHoc) {
      return obsPlotNumber !== undefined
        ? `${strings.AD_HOC} ${strings.OBSERVATION}: ${strings.PLOT} ${obsPlotNumber}`
        : undefined;
    }
    return obsMonthYear ? `${strings.OBSERVATION}: ${obsMonthYear}` : undefined;
  }, [isObsActivity, obsIsAdHoc, obsMonthYear, obsPlotNumber, strings]);

  const syncActivityMediaRequest = useAppSelector(selectSyncActivityMedia(syncMediaRequestId));

  const [adminCreateActivity] = useAdminCreateActivityMutation();
  const [createActivity] = useCreateActivityMutation();
  const [adminUpdateActivity] = useAdminUpdateActivityMutation();
  const [updateActivity] = useUpdateActivityMutation();
  const [deleteActivity] = useDeleteActivityMutation();

  const [focusedFileId, setFocusedFileId] = useState<number>();
  const mapRef = useRef<MapRef | null>(null);
  const mapDrawerRef = useRef<HTMLDivElement | null>(null);
  const { getCurrentViewState, jumpTo } = useMapUtils(mapRef);
  const { scrollToElementById } = useMapDrawer(mapDrawerRef);

  const organization = useMemo(
    () => (isAcceleratorRoute ? undefined : selectedOrganization),
    [isAcceleratorRoute, selectedOrganization]
  );

  const isAllowedDeleteActivitiesNonPublished = useMemo(
    () => isAllowed('DELETE_ACTIVITIES_NON_PUBLISHED', { organization }),
    [isAllowed, organization]
  );

  const isAllowedDeleteActivitiesPublished = useMemo(() => {
    return isAllowed('DELETE_ACTIVITIES_PUBLISHED', { organization });
  }, [isAllowed, organization]);

  useEffect(() => {
    const _source = query.get('source');
    if (_source) {
      setSource(_source);
      query.delete('source');
      navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
    }
  }, [query, location, navigate]);

  const isEditing = useMemo(() => activityId !== undefined, [activityId]);

  const selectedAcceleratorProject = useMemo(() => {
    return acceleratorProjects.find((p) => p.projectId === projectId);
  }, [projectId, acceleratorProjects]);

  const projectName = useMemo(
    () => (isAcceleratorRoute ? selectedAcceleratorProject?.dealName : selectedProject?.name) || '',
    [isAcceleratorRoute, selectedAcceleratorProject?.dealName, selectedProject?.name]
  );

  const secondaryHeader = useMemo(
    () => (isEditing ? strings.EDIT_ACTIVITY : strings.ADD_ACTIVITY),
    [isEditing, strings]
  );

  const primaryHeader = useMemo(
    () =>
      projectName
        ? strings.formatString(
            isEditing ? strings.EDITING_ACTIVITY_FOR_PROJECT : strings.ADD_ACTIVITY_FOR_PROJECT,
            projectName
          )
        : secondaryHeader,
    [projectName, strings, isEditing, secondaryHeader]
  );

  const navToActivityLog = useCallback(
    (afterDelete = false) => {
      const editingActivityId = isEditing && !afterDelete ? activityId : undefined;

      if (
        isAcceleratorRoute &&
        source === APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', projectId.toString())
      ) {
        goToAcceleratorProject(projectId, editingActivityId, 'activityLog');
      } else if (isAcceleratorRoute) {
        goToAcceleratorActivityLog(editingActivityId);
      } else {
        goToActivityLog(editingActivityId);
      }
    },
    [
      activityId,
      goToAcceleratorActivityLog,
      goToActivityLog,
      goToAcceleratorProject,
      isAcceleratorRoute,
      isEditing,
      projectId,
      source,
    ]
  );

  const validateForm = useCallback((): boolean => {
    if (!record?.date || (!isObsActivity && !record?.description) || !record?.type) {
      return false;
    }

    const newMediaFiles = mediaItems.filter((item): item is NewActivityMediaItem => item.type === 'new');

    if (isObsActivity && newMediaFiles.some((item) => item.data.monitoringPlotId === undefined)) {
      return false;
    }
    const MAX_FILE_SIZE_GB = 5;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_GB * 1024 * 1024 * 1024;

    for (const mediaItem of newMediaFiles) {
      const file = mediaItem.data.file;

      if (file.size > MAX_FILE_SIZE_BYTES) {
        snackbar.toastError(strings.formatString(strings.FILE_TOO_LARGE, file.name, `${MAX_FILE_SIZE_GB}`));
        return false;
      }
    }

    return true;
  }, [isObsActivity, record, mediaItems, snackbar, strings]);

  const syncMediaFiles = useCallback(
    (newActivityId: number) => {
      // Only sync if there are any media operations to perform
      const hasMediaOperations = mediaItems.some(
        (item) => item.type === 'new' || (item.type === 'existing' && (item.isDeleted || item.isModified))
      );

      if (hasMediaOperations) {
        const request = dispatch(
          requestSyncActivityMedia({
            activityId: newActivityId,
            mediaItems,
            observationId: activity?.payload.observation?.observationId,
            plotNumberToIdMap: obsPlotNumberToIdMap,
          })
        );
        setSyncMediaRequestId(request.requestId);
      } else {
        // No media operations needed
        setBusy(false);
        navToActivityLog();
      }
    },
    [
      dispatch,
      mediaItems,
      setBusy,
      navToActivityLog,
      activity?.payload.observation?.observationId,
      obsPlotNumberToIdMap,
    ]
  );

  const saveActivity = useCallback(async () => {
    if (!validateForm()) {
      setValidateFields(true);
      return;
    }

    setBusy(true);

    try {
      if (isEditing && isAcceleratorRoute && activity) {
        // admin update activity
        await adminUpdateActivity({
          id: activity.payload.id,
          adminUpdateActivityRequestPayload: {
            date: isObsActivity ? activity.payload.date : (record?.date as string),
            description: record?.description as string,
            isHighlight: !!record?.isHighlight,
            status: record?.status as AdminActivityPayload['status'],
            type: isObsActivity ? activity.payload.type : (record?.type as AdminActivityPayload['type']),
          },
        }).unwrap();
        syncMediaFiles(activity.payload.id);
      } else if (isEditing && !isAcceleratorRoute && activity) {
        // update activity
        await updateActivity({
          activityId: activity.payload.id,
          updateActivityRequestPayload: {
            date: isObsActivity ? activity.payload.date : (record?.date as string),
            description: record?.description as string,
            status: (activity.payload as ActivityPayload).status,
            type: isObsActivity ? activity.payload.type : (record?.type as ActivityPayload['type']),
          },
        }).unwrap();
        syncMediaFiles(activity.payload.id);
      } else if (!isEditing && isAcceleratorRoute) {
        // admin create activity
        const result = await adminCreateActivity({
          date: record?.date as string,
          description: record?.description as string,
          isHighlight: !!record?.isHighlight,
          projectId,
          status: record?.status as AdminCreateActivityRequestPayload['status'],
          type: record?.type as AdminCreateActivityRequestPayload['type'],
        }).unwrap();
        syncMediaFiles(result.activity.id);
      } else {
        // create activity
        const result = await createActivity({
          date: record?.date as string,
          description: record?.description as string,
          projectId,
          type: record?.type as CreateActivityRequestPayload['type'],
        }).unwrap();
        syncMediaFiles(result.activity.id);
      }
    } catch {
      setBusy(false);
      snackbar.toastError(strings.GENERIC_ERROR);
      setValidateFields(false);
    }
  }, [
    activity,
    adminCreateActivity,
    adminUpdateActivity,
    createActivity,
    isAcceleratorRoute,
    isEditing,
    isObsActivity,
    projectId,
    record,
    snackbar,
    strings.GENERIC_ERROR,
    syncMediaFiles,
    updateActivity,
    validateForm,
  ]);

  // initialize record, if creating new
  useEffect(() => {
    if (record || isEditing) {
      return;
    }

    const newActivity: Partial<FormRecord> = {
      date: getTodaysDateFormatted(),
      description: '',
      isHighlight: false,
      projectId,
    };

    setRecord({ ...newActivity });
  }, [isEditing, projectId, record, selectedOrganization, setRecord]);

  // show error if get activity fails
  useEffect(() => {
    if (adminGetError || getError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [adminGetError, getError, snackbar, strings.GENERIC_ERROR]);

  // reset record with fetched activity data when editing
  useEffect(() => {
    if (isEditing && activity) {
      const activityRecord: Partial<FormRecord> = {
        date: activity.payload.date,
        description: activity.payload.description,
        id: activity.payload.id,
        isHighlight: activity.payload.isHighlight,
        projectId,
        status: activity.type === 'admin' ? activity.payload.status : undefined,
        type: activity.payload.type,
      };
      setRecord({ ...activityRecord });
    }
  }, [isEditing, activity, setRecord, projectId]);

  // populate existing media files when editing
  useEffect(() => {
    if (isEditing && activity && activity.payload.media) {
      const existingMediaItems: ActivityMediaItem[] = activity.payload.media
        .map((mediaItem) => ({
          data: mediaItem,
          isDeleted: false,
          isModified: false,
          type: 'existing' as const,
        }))
        .sort((a, b) => a.data.listPosition - b.data.listPosition);
      setMediaItems(existingMediaItems);
    }
  }, [isEditing, activity]);

  // handle sync media responses
  useEffect(() => {
    if (syncActivityMediaRequest?.status === 'error') {
      setBusy(false);
      snackbar.toastError(strings.GENERIC_ERROR);
      navToActivityLog();
    } else if (syncActivityMediaRequest?.status === 'success') {
      if (activityId !== undefined) {
        dispatch(
          baseApi.util.invalidateTags([
            { type: QueryTagTypes.Activities, id: activityId },
            { type: QueryTagTypes.Activities, id: 'LIST' },
          ])
        );
      }
      setBusy(false);
      navToActivityLog();
    }
  }, [activityId, dispatch, navToActivityLog, snackbar, strings.GENERIC_ERROR, syncActivityMediaRequest]);

  const activityTypeOptions = useMemo(() => {
    return ACTIVITY_TYPES.map((activityType: ActivityType) => ({
      label: activityTypeLabel(activityType, strings),
      value: activityType,
    }));
  }, [strings]);

  const onChangeActivityType = useCallback(
    (value: string | number | null): void => {
      onChange('type', value as SavableActivity['type']);
    },
    [onChange]
  );

  const onChangeDate = useCallback(
    (value?: DateTime<boolean> | undefined): void => {
      onChange('date', value?.toFormat('yyyy-MM-dd'));
    },
    [onChange]
  );

  const onChangeIsHighlight = useCallback(
    (value: boolean): void => {
      onChange('isHighlight', value);
    },
    [onChange]
  );

  const onChangeStatus = useCallback(
    (value: any): void => {
      onChange('status', value as ActivityStatus);
    },
    [onChange]
  );

  const activityStatusOptions = useMemo(
    (): DropdownItem[] =>
      ACTIVITY_STATUSES.map((status) => ({
        label: activityStatusTagLabel(status, strings),
        value: status,
      })),
    [strings]
  );

  const activityMarkerHighlighted = useCallback(
    (_: number, fileId: number) => {
      return fileId === focusedFileId;
    },
    [focusedFileId]
  );

  const onActivityMarkerClick = useCallback(
    (_: number, fileId: number) => {
      if (focusedFileId === fileId) {
        setFocusedFileId(undefined);
      } else {
        setFocusedFileId(fileId);
        scrollToElementById(`activity-media-item-${fileId}`);
      }
    },
    [focusedFileId, scrollToElementById]
  );

  const onFileClicked = useCallback(
    (fileId: number) => () => {
      if (activity) {
        const media = activity.payload.media.find((mediaFile) => mediaFile.fileId === fileId);
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
    [activity, jumpTo, getCurrentViewState]
  );

  const handleDeleteActivity = useCallback(() => {
    setDeleteActivityModalOpen(true);
  }, []);

  const handleCloseDeleteActivityModal = useCallback(() => {
    setDeleteActivityModalOpen(false);
  }, []);

  const dispatchDeleteActivityRequest = useCallback(async () => {
    if (!activityId) {
      return;
    }

    setDeleteActivityModalOpen(false);
    setBusy(true);

    try {
      await deleteActivity(activityId).unwrap();
      setBusy(false);
      snackbar.toastSuccess(strings.ACTIVITY_DELETED);
      navToActivityLog(true);
    } catch {
      setBusy(false);
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [activityId, deleteActivity, navToActivityLog, snackbar, strings]);

  const activityWithMedia = useMemo(() => {
    if (activity) {
      const media = mediaItems
        .filter((file): file is ExistingActivityMediaItem => file.type === 'existing' && !file.isDeleted)
        .map((file) => file.data);

      return { ...activity, media };
    }
  }, [activity, mediaItems]);

  if (!record) {
    return <></>;
  }

  return (
    <PageForm
      busy={busy}
      cancelID='cancelSaveActivity'
      onCancel={navToActivityLog}
      onSave={() => void saveActivity()}
      saveButtonText={strings.SAVE}
      saveID='saveActivity'
      style={{ paddingBottom: '4px' }}
    >
      <DeleteActivityModal
        open={deleteActivityModalOpen}
        onClose={handleCloseDeleteActivityModal}
        onSubmit={() => void dispatchDeleteActivityRequest()}
      />
      <Box
        alignItems={isMobile ? 'flex-start' : 'center'}
        display='flex'
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent='space-between'
        marginBottom='2px'
        marginTop='2px'
        paddingLeft={theme.spacing(4)}
      >
        <Typography fontSize='24px' fontWeight={600} lineHeight='32px' variant='h1'>
          {primaryHeader}
        </Typography>
      </Box>

      <Card
        style={{
          borderRadius: theme.spacing(1),
          padding: theme.spacing(3),
          width: '100%',
        }}
      >
        <MapSplitView
          activities={isEditing && activityWithMedia ? [activityWithMedia] : []}
          activityMarkerHighlighted={activityMarkerHighlighted}
          drawerRef={mapDrawerRef}
          heightOffsetPx={264}
          mapRef={mapRef}
          projectId={projectId}
          onActivityMarkerClick={onActivityMarkerClick}
        >
          <Grid container spacing={2} textAlign='left'>
            <Grid item xs={12} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              {isEditing && activity && isAllowedDeleteActivitiesNonPublished && (
                <Button
                  label={strings.DELETE_ACTIVITY}
                  onClick={handleDeleteActivity}
                  priority='secondary'
                  type='destructive'
                  disabled={
                    activity.type === 'admin' && !!activity.payload.publishedTime && !isAllowedDeleteActivitiesPublished
                  }
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <Box
                display='flex'
                alignItems={isMobile ? 'start' : 'center'}
                flexDirection={isMobile ? 'column' : 'row'}
              >
                <Typography fontSize='20px' fontWeight='bold' variant='h2'>
                  {secondaryHeader}
                </Typography>
                {isAcceleratorRoute && isEditing && activity && (
                  <Box display='flex' alignItems={'center'} paddingTop={isMobile ? theme.spacing(3) : 0}>
                    <Box paddingLeft={isMobile ? 0 : theme.spacing(3)} paddingRight={theme.spacing(3)}>
                      <ActivityStatusBadges activity={activity} />
                    </Box>
                    {activity.payload.isHighlight && (
                      <Icon name='star' size='medium' fillColor={theme.palette.TwClrBaseYellow200} />
                    )}
                  </Box>
                )}
              </Box>
            </Grid>

            {isObsActivity && obsMonthYear && (
              <Grid item xs={12}>
                <Box display='flex' alignItems='flex-start' gap={1}>
                  <Icon name='info' fillColor={theme.palette.TwClrTxtSecondary} size='medium' />
                  <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px'>
                    {strings.formatString(strings.OBSERVATION_ACTIVITY_AUTO_CREATED_INFO, obsMonthYear)}
                  </Typography>
                </Box>
              </Grid>
            )}

            {isObsActivity && obsTitle && (
              <Grid item xs={12}>
                <Typography fontSize='16px' fontWeight={500}>
                  {obsTitle}
                </Typography>
              </Grid>
            )}

            <Grid item lg={6} xs={12}>
              {isObsActivity ? (
                <ActivityStatField
                  title={strings.ACTIVITY_TYPE}
                  contents={record.type ? activityTypeLabel(record.type, strings) : ''}
                  isEditing
                />
              ) : (
                <Box display='flex' alignItems='center' gap={1}>
                  <Box flex={1}>
                    <Dropdown
                      errorText={validateFields && !record?.type && !isObsActivity ? strings.REQUIRED_FIELD : ''}
                      fullWidth
                      label={strings.ACTIVITY_TYPE}
                      onChange={onChangeActivityType}
                      options={activityTypeOptions}
                      required
                      selectedValue={record.type}
                    />
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item lg={5} xs={12}>
              {isObsActivity ? (
                <ActivityStatField title={strings.DATE} contents={record.date ?? ''} isEditing />
              ) : (
                <Box display='flex' alignItems='center' gap={1}>
                  <Box flex={1}>
                    <DatePicker
                      aria-label={strings.DATE}
                      defaultTimeZone={userTimeZone?.id}
                      errorText={validateFields && !record?.date ? strings.REQUIRED_FIELD : ''}
                      id='date'
                      label={strings.DATE_REQUIRED}
                      onDateChange={onChangeDate}
                      sx={{ '& .MuiInputBase-input': { paddingRight: 0 } }}
                      value={record.date}
                    />
                  </Box>
                </Box>
              )}
            </Grid>

            {isObsActivity && (
              <ObservationStatsPanel
                isEditing
                livePlants={observationLivePlants}
                plantDensity={observationPlantDensity}
                survivalRate={observationSurvivalRate}
              />
            )}

            <Grid item xs={12}>
              <Textfield
                errorText={validateFields && !record?.description && !isObsActivity ? strings.REQUIRED_FIELD : ''}
                id='description'
                label={strings.DESCRIPTION}
                onChange={onChangeCallback('description')}
                required={!isObsActivity}
                sx={{ '& .textfield-value': { minHeight: '80px' } }}
                type='textarea'
                value={record?.description}
              />
            </Grid>

            {isAcceleratorRoute && (
              <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Dropdown
                  required
                  label={strings.STATUS}
                  onChange={onChangeStatus}
                  selectedValue={record?.status}
                  options={activityStatusOptions}
                  fullWidth
                />
              </Grid>
            )}

            {isAcceleratorRoute && (
              <Grid
                item
                xs={12}
                sm={6}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  marginTop: isMobile ? 0 : '8px',
                }}
              >
                <Checkbox
                  id='isHighlight'
                  label={strings.MAKE_HIGHLIGHT}
                  name='isHighlight'
                  onChange={onChangeIsHighlight}
                  value={record?.isHighlight}
                />
              </Grid>
            )}

            <ActivityMediaForm
              activityId={activityId}
              focusedFileId={focusedFileId}
              isAdHoc={obsIsAdHoc}
              mediaItems={mediaItems}
              obsConfirmContext={
                isObsActivity && obsMonthYear && projectName ? { monthYear: obsMonthYear, projectName } : undefined
              }
              observationId={activity?.payload.observation?.observationId}
              plotOptions={obsPlotOptions}
              onClickMediaItem={onFileClicked}
              onChangeMediaItems={setMediaItems}
              validateFields={validateFields}
            />
          </Grid>
        </MapSplitView>
      </Card>
    </PageForm>
  );
}
