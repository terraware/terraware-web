import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Checkbox, Dropdown, Textfield } from '@terraware/web-components';
import { getTodaysDateFormatted } from '@terraware/web-components/utils/date';
import { DateTime } from 'luxon';

import Card from 'src/components/common/Card';
import DatePicker from 'src/components/common/DatePicker';
import PageForm from 'src/components/common/PageForm';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useParticipants } from 'src/hooks/useParticipants';
import { useProjects } from 'src/hooks/useProjects';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import {
  requestAdminCreateActivity,
  requestAdminGetActivity,
  requestAdminUpdateActivity,
  requestCreateActivity,
  requestGetActivity,
  requestSyncActivityMedia,
  requestUpdateActivity,
} from 'src/redux/features/activities/activitiesAsyncThunks';
import {
  selectActivityCreate,
  selectActivityGet,
  selectActivityUpdate,
  selectAdminActivityCreate,
  selectAdminActivityGet,
  selectAdminActivityUpdate,
  selectSyncActivityMedia,
} from 'src/redux/features/activities/activitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import {
  ACTIVITY_TYPES,
  Activity,
  ActivityPayload,
  ActivityType,
  AdminActivityPayload,
  AdminCreateActivityRequestPayload,
  CreateActivityRequestPayload,
  UpdateActivityRequestPayload,
  activityTypeLabel,
} from 'src/types/Activity';
import useForm from 'src/utils/useForm';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import ActivityMediaForm, { ActivityMediaItem } from './ActivityMediaForm';
import MapSplitView from './MapSplitView';

interface ActivityDetailsFormProps {
  activityId?: number;
  projectId: number;
}

type SavableActivity = (CreateActivityRequestPayload | UpdateActivityRequestPayload) & Activity;

type FormRecord = Partial<SavableActivity> | undefined;

export default function ActivityDetailsForm({ activityId, projectId }: ActivityDetailsFormProps): JSX.Element {
  const { strings } = useLocalization();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { availableParticipants } = useParticipants();
  const { selectedProject } = useProjects({ projectId });
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const navigate = useSyncNavigate();
  const { goToAcceleratorActivityLog, goToActivityLog, goToParticipantProject } = useNavigateTo();

  const location = useStateLocation();
  const query = useQuery();

  const [source, setSource] = useState<string | null>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [record, setRecord, onChange, onChangeCallback] = useForm<FormRecord>(undefined);
  const [mediaFiles, setMediaFiles] = useState<ActivityMediaItem[]>([]);
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [syncMediaRequestId, setSyncMediaRequestId] = useState('');
  const [getActivityRequestId, setGetActivityRequestId] = useState('');
  const [saveActivityRequestId, setSaveActivityRequestId] = useState('');
  const [busy, setBusy] = useState<boolean>(false);

  const getActivityRequest = useAppSelector(selectActivityGet(getActivityRequestId));
  const adminGetActivityRequest = useAppSelector(selectAdminActivityGet(getActivityRequestId));

  const createActivityRequest = useAppSelector(selectActivityCreate(saveActivityRequestId));
  const adminCreateActivityRequest = useAppSelector(selectAdminActivityCreate(saveActivityRequestId));
  const updateActivityRequest = useAppSelector(selectActivityUpdate(saveActivityRequestId));
  const adminUpdateActivityRequest = useAppSelector(selectAdminActivityUpdate(saveActivityRequestId));

  const syncActivityMediaRequest = useAppSelector(selectSyncActivityMedia(syncMediaRequestId));

  useEffect(() => {
    const _source = query.get('source');
    if (_source) {
      setSource(_source);
      query.delete('source');
      navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
    }
  }, [query, location, navigate]);

  const isEditing = useMemo(() => activityId !== undefined, [activityId]);

  const selectedParticipantProject = useMemo(() => {
    return availableParticipants
      .flatMap((participant) =>
        participant.projects.map((project) => ({
          dealName: project.projectDealName,
          id: project.projectId,
          name: project.projectName,
          organizationId: project.organizationId,
          participantId: participant.id,
        }))
      )
      .find((p) => p.id === projectId);
  }, [availableParticipants, projectId]);

  const projectName = useMemo(
    () => (isAcceleratorRoute ? selectedParticipantProject?.dealName : selectedProject?.name) || '',
    [isAcceleratorRoute, selectedParticipantProject?.dealName, selectedProject?.name]
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
    if (isAcceleratorRoute && !source) {
      goToAcceleratorActivityLog();
    } else if (isAcceleratorRoute && source === 'profile') {
      goToParticipantProject(projectId);
    } else {
      goToActivityLog();
    }
  }, [goToAcceleratorActivityLog, goToActivityLog, goToParticipantProject, isAcceleratorRoute, projectId, source]);

  const validateForm = useCallback((): boolean => !!record?.date && !!record?.description && !!record?.type, [record]);

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
          activityId: activity.id,
          activity: {
            ...activity,
            date: record?.date as string,
            description: record?.description as string,
            isHighlight: !!record?.isHighlight,
            isVerified: !!record?.isVerified,
            type: record?.type as AdminActivityPayload['type'],
          } as AdminActivityPayload,
        })
      );
      setSaveActivityRequestId(request.requestId);
    } else if (isEditing && !isAcceleratorRoute && activity) {
      // update activity
      const request = dispatch(
        requestUpdateActivity({
          activityId: activity.id,
          activity: {
            ...activity,
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
          isVerified: !!record?.isVerified,
          projectId,
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
      const hasMediaOperations = mediaFiles.some(
        (item) => item.type === 'new' || (item.type === 'existing' && (item.isDeleted || item.isModified))
      );

      if (hasMediaOperations) {
        const request = dispatch(
          requestSyncActivityMedia({
            activityId: newActivityId,
            mediaItems: mediaFiles,
          })
        );
        setSyncMediaRequestId(request.requestId);
      } else {
        // No media operations needed
        setBusy(false);
        navToActivityLog();
      }
    },
    [dispatch, mediaFiles, setBusy, navToActivityLog]
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
      isVerified: false,
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
      setActivity(getActivityRequest.data as Activity);
    } else if (adminGetActivityRequest?.status === 'success' && adminGetActivityRequest?.data) {
      setActivity(adminGetActivityRequest.data as Activity);
    }
  }, [getActivityRequest, adminGetActivityRequest, snackbar, strings.GENERIC_ERROR]);

  // reset record with fetched activity data when editing
  useEffect(() => {
    if (isEditing && activity) {
      const activityRecord: Partial<FormRecord> = {
        date: activity.date,
        description: activity.description,
        id: activity.id,
        isHighlight: activity.isHighlight,
        isVerified: activity.isVerified,
        projectId,
        type: activity.type,
      };
      setRecord({ ...activityRecord });
    }
  }, [isEditing, activity, setRecord, projectId]);

  // populate existing media files when editing
  useEffect(() => {
    if (isEditing && activity && activity.media) {
      const existingMediaItems: ActivityMediaItem[] = activity.media.map((mediaFile) => ({
        data: mediaFile,
        isDeleted: false,
        isModified: false,
        type: 'existing' as const,
      }));
      setMediaFiles(existingMediaItems);
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

  const onChangeIsVerified = useCallback(
    (value: boolean): void => {
      onChange('isVerified', value);
    },
    [onChange]
  );

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
    >
      <Box marginBottom='32px' marginTop='2px' paddingLeft={theme.spacing(4)}>
        <Typography fontSize='24px' fontWeight={600} lineHeight='32px' variant='h1'>
          {primaryHeader}
        </Typography>
      </Box>

      <Card
        style={{
          borderRadius: theme.spacing(1),
          minHeight: '100vh',
          padding: theme.spacing(3),
          width: '100%',
        }}
      >
        <MapSplitView projectId={projectId}>
          <Typography fontSize='20px' fontWeight='bold' marginBottom='24px' variant='h2'>
            {secondaryHeader}
          </Typography>
          <Grid container spacing={2} textAlign='left'>
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
              <Grid item xs={12}>
                <Checkbox
                  id='verified'
                  label={strings.VERIFIED}
                  name='verified'
                  onChange={onChangeIsVerified}
                  value={record?.isVerified}
                />
              </Grid>
            )}

            <ActivityMediaForm activityId={activityId} mediaFiles={mediaFiles} onMediaFilesChange={setMediaFiles} />
          </Grid>
        </MapSplitView>
      </Card>
    </PageForm>
  );
}
