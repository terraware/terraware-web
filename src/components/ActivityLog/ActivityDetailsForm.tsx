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
import {
  requestAdminCreateActivity,
  requestAdminGetActivity,
  requestAdminUpdateActivity,
  requestCreateActivity,
  requestDeleteActivity,
  requestGetActivity,
  requestSyncActivityMedia,
  requestUpdateActivity,
} from 'src/redux/features/activities/activitiesAsyncThunks';
import {
  selectActivityCreate,
  selectActivityDelete,
  selectActivityGet,
  selectActivityUpdate,
  selectAdminActivityCreate,
  selectAdminActivityGet,
  selectAdminActivityUpdate,
  selectSyncActivityMedia,
} from 'src/redux/features/activities/activitiesSelectors';
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
import ActivityStatusBadges from './ActivityStatusBadges';
import DeleteActivityModal from './DeleteActivityModal';
import MapSplitView from './MapSplitView';
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
  const [activity, setActivity] = useState<TypedActivity>();
  const [record, setRecord, onChange, onChangeCallback] = useForm<FormRecord>(undefined);
  const [mediaItems, setMediaItems] = useState<ActivityMediaItem[]>([]);
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [syncMediaRequestId, setSyncMediaRequestId] = useState('');
  const [getActivityRequestId, setGetActivityRequestId] = useState('');
  const [saveActivityRequestId, setSaveActivityRequestId] = useState('');
  const [deleteActivityRequestId, setDeleteActivityRequestId] = useState('');
  const [busy, setBusy] = useState<boolean>(false);
  const [deleteActivityModalOpen, setDeleteActivityModalOpen] = useState<boolean>(false);

  const getActivityRequest = useAppSelector(selectActivityGet(getActivityRequestId));
  const adminGetActivityRequest = useAppSelector(selectAdminActivityGet(getActivityRequestId));
  const createActivityRequest = useAppSelector(selectActivityCreate(saveActivityRequestId));
  const adminCreateActivityRequest = useAppSelector(selectAdminActivityCreate(saveActivityRequestId));
  const updateActivityRequest = useAppSelector(selectActivityUpdate(saveActivityRequestId));
  const adminUpdateActivityRequest = useAppSelector(selectAdminActivityUpdate(saveActivityRequestId));
  const syncActivityMediaRequest = useAppSelector(selectSyncActivityMedia(syncMediaRequestId));
  const deleteActivityRequest = useAppSelector(selectActivityDelete(deleteActivityRequestId));

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

  const navToActivityLog = useCallback(() => {
    const editingActivityId = isEditing ? activityId : undefined;

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
  }, [
    activityId,
    goToAcceleratorActivityLog,
    goToActivityLog,
    goToAcceleratorProject,
    isAcceleratorRoute,
    isEditing,
    projectId,
    source,
  ]);

  const validateForm = useCallback((): boolean => {
    if (!record?.date || !record?.description || !record?.type) {
      return false;
    }

    const newMediaFiles = mediaItems.filter((item): item is NewActivityMediaItem => item.type === 'new');
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
  }, [record, mediaItems, snackbar, strings]);

  const saveActivity = useCallback(() => {
    if (!validateForm()) {
      setValidateFields(true);
      return;
    }

    setBusy(true);

    if (isEditing && isAcceleratorRoute && activity) {
      // admin update activity
      const request = dispatch(
        requestAdminUpdateActivity({
          activityId: activity.payload.id,
          activity: {
            ...activity.payload,
            date: record?.date as string,
            description: record?.description as string,
            isHighlight: !!record?.isHighlight,
            status: record?.status as AdminActivityPayload['status'],
            type: record?.type as AdminActivityPayload['type'],
          } as AdminActivityPayload,
        })
      );
      setSaveActivityRequestId(request.requestId);
    } else if (isEditing && !isAcceleratorRoute && activity) {
      // update activity
      const request = dispatch(
        requestUpdateActivity({
          activityId: activity.payload.id,
          activity: {
            ...activity.payload,
            date: record?.date as string,
            description: record?.description as string,
            type: record?.type as ActivityPayload['type'],
          } as ActivityPayload,
        })
      );
      setSaveActivityRequestId(request.requestId);
    } else if (!isEditing && isAcceleratorRoute) {
      // admin create activity
      const request = dispatch(
        requestAdminCreateActivity({
          date: record?.date as string,
          description: record?.description as string,
          isHighlight: !!record?.isHighlight,
          projectId,
          status: record?.status as AdminCreateActivityRequestPayload['status'],
          type: record?.type as AdminCreateActivityRequestPayload['type'],
        })
      );
      setSaveActivityRequestId(request.requestId);
    } else {
      // create activity
      const request = dispatch(
        requestCreateActivity({
          date: record?.date as string,
          description: record?.description as string,
          projectId,
          type: record?.type as CreateActivityRequestPayload['type'],
        })
      );
      setSaveActivityRequestId(request.requestId);
    }
  }, [activity, dispatch, isAcceleratorRoute, isEditing, projectId, record, validateForm]);

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
          })
        );
        setSyncMediaRequestId(request.requestId);
      } else {
        // No media operations needed
        setBusy(false);
        navToActivityLog();
      }
    },
    [dispatch, mediaItems, setBusy, navToActivityLog]
  );

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

  // get activity for editing
  useEffect(() => {
    if (isEditing && activityId && !activity) {
      if (isAcceleratorRoute) {
        const request = dispatch(requestAdminGetActivity(activityId));
        setGetActivityRequestId(request.requestId);
      } else {
        const request = dispatch(requestGetActivity(activityId));
        setGetActivityRequestId(request.requestId);
      }
    }
  }, [activity, activityId, dispatch, isAcceleratorRoute, isEditing]);

  // handle get activity responses
  useEffect(() => {
    if (getActivityRequest?.status === 'error' || adminGetActivityRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    } else if (getActivityRequest?.status === 'success' && getActivityRequest?.data) {
      setActivity({ type: 'base', payload: getActivityRequest.data });
    } else if (adminGetActivityRequest?.status === 'success' && adminGetActivityRequest?.data) {
      setActivity({ type: 'admin', payload: adminGetActivityRequest.data });
    }
  }, [getActivityRequest, adminGetActivityRequest, snackbar, strings.GENERIC_ERROR]);

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

  // handle create activity responses
  useEffect(() => {
    if (createActivityRequest?.status === 'error' || adminCreateActivityRequest?.status === 'error') {
      setBusy(false);
      snackbar.toastError(strings.GENERIC_ERROR);
      setValidateFields(false);
    } else if (createActivityRequest?.status === 'success' || adminCreateActivityRequest?.status === 'success') {
      syncMediaFiles((createActivityRequest?.data?.id || adminCreateActivityRequest?.data?.id) as number);
    }
  }, [
    adminCreateActivityRequest,
    createActivityRequest,
    navToActivityLog,
    snackbar,
    strings.GENERIC_ERROR,
    syncMediaFiles,
  ]);

  // handle update activity responses
  useEffect(() => {
    if (updateActivityRequest?.status === 'error' || adminUpdateActivityRequest?.status === 'error') {
      setBusy(false);
      snackbar.toastError(strings.GENERIC_ERROR);
      setValidateFields(false);
    } else if (updateActivityRequest?.status === 'success' || adminUpdateActivityRequest?.status === 'success') {
      syncMediaFiles(activityId as number);
    }
  }, [activityId, adminUpdateActivityRequest, snackbar, strings.GENERIC_ERROR, updateActivityRequest, syncMediaFiles]);

  // handle sync media responses
  useEffect(() => {
    if (syncActivityMediaRequest?.status === 'error') {
      setBusy(false);
      snackbar.toastError(strings.GENERIC_ERROR);
      navToActivityLog();
    } else if (syncActivityMediaRequest?.status === 'success') {
      setBusy(false);
      navToActivityLog();
    }
  }, [navToActivityLog, snackbar, strings.GENERIC_ERROR, syncActivityMediaRequest]);

  // handle delete activity responses
  useEffect(() => {
    if (deleteActivityRequest?.status === 'error') {
      setBusy(false);
      snackbar.toastError(strings.GENERIC_ERROR);
    } else if (deleteActivityRequest?.status === 'success') {
      setBusy(false);
      snackbar.toastSuccess(strings.ACTIVITY_DELETED);
      navToActivityLog();
    }
  }, [deleteActivityRequest, navToActivityLog, setBusy, snackbar, strings]);

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

  const dispatchDeleteActivityRequest = useCallback(() => {
    if (!activityId) {
      return;
    }

    setDeleteActivityModalOpen(false);
    setBusy(true);

    const request = dispatch(requestDeleteActivity(activityId));
    setDeleteActivityRequestId(request.requestId);
  }, [activityId, dispatch]);

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
      onSave={saveActivity}
      saveButtonText={strings.SAVE}
      saveID='saveActivity'
      style={{ paddingBottom: '4px' }}
    >
      <DeleteActivityModal
        open={deleteActivityModalOpen}
        onClose={handleCloseDeleteActivityModal}
        onSubmit={dispatchDeleteActivityRequest}
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

            <Grid item lg={6} xs={12}>
              <Dropdown
                errorText={validateFields && !record?.type ? strings.REQUIRED_FIELD : ''}
                fullWidth
                label={strings.ACTIVITY_TYPE}
                onChange={onChangeActivityType}
                options={activityTypeOptions}
                required
                selectedValue={record.type}
              />
            </Grid>

            <Grid item lg={5} xs={12}>
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
            </Grid>

            <Grid item xs={12}>
              <Textfield
                errorText={validateFields && !record?.description ? strings.REQUIRED_FIELD : ''}
                id='description'
                label={strings.DESCRIPTION}
                onChange={onChangeCallback('description')}
                required
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
              mediaItems={mediaItems}
              onClickMediaItem={onFileClicked}
              onChangeMediaItems={setMediaItems}
            />
          </Grid>
        </MapSplitView>
      </Card>
    </PageForm>
  );
}
