import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Checkbox, Dropdown, FileChooser, Textfield } from '@terraware/web-components';
import { getTodaysDateFormatted } from '@terraware/web-components/utils/date';
import { DateTime } from 'luxon';

import Card from 'src/components/common/Card';
import DatePicker from 'src/components/common/DatePicker';
import PageForm from 'src/components/common/PageForm';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useParticipants } from 'src/hooks/useParticipants';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { requestAdminCreateActivity, requestCreateActivity } from 'src/redux/features/activities/activitiesAsyncThunks';
import { selectActivityCreate, selectAdminActivityCreate } from 'src/redux/features/activities/activitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import {
  ACTIVITY_TYPES,
  Activity,
  ActivityType,
  AdminCreateActivityRequestPayload,
  CreateActivityRequestPayload,
  UpdateActivityRequestPayload,
  activityTypeLabel,
} from 'src/types/Activity';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import MapSplitView from './MapSplitView';

interface ActivityDetailsFormProps {
  activityId?: number;
  projectId: number;
}

type SavableActivity = (CreateActivityRequestPayload | UpdateActivityRequestPayload) & Activity;

type FormRecord = Partial<SavableActivity> | undefined;

const MAX_FILES = 20;

export default function ActivityDetailsForm({ activityId, projectId }: ActivityDetailsFormProps): JSX.Element {
  const { strings } = useLocalization();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { availableParticipants } = useParticipants();
  const { selectedProject } = useProjects({ projectId });
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { goToAcceleratorActivityLog, goToActivityLog } = useNavigateTo();

  const [record, setRecord, onChange, onChangeCallback] = useForm<FormRecord>(undefined);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [requestId, setRequestId] = useState('');
  const [busy, setBusy] = useState<boolean>(false);

  const createActivityRequest = useAppSelector(selectActivityCreate(requestId));
  const adminCreateActivityRequest = useAppSelector(selectAdminActivityCreate(requestId));

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
    if (isAcceleratorRoute) {
      goToAcceleratorActivityLog();
    } else {
      goToActivityLog();
    }
  }, [goToAcceleratorActivityLog, goToActivityLog, isAcceleratorRoute]);

  const validateForm = useCallback((): boolean => !!record?.date && !!record?.description && !!record?.type, [record]);

  const saveActivity = useCallback(() => {
    if (!validateForm()) {
      setValidateFields(true);
      return;
    }

    setBusy(true);

    if (isEditing && isAcceleratorRoute) {
      // admin update activity
    } else if (isEditing && !isAcceleratorRoute) {
      // update activity
    } else if (!isEditing && isAcceleratorRoute) {
      // admin create activity
      const request = dispatch(
        requestAdminCreateActivity({
          date: record?.date as string,
          description: record?.description,
          isHighlight: !!record?.isHighlight,
          isVerified: !!record?.isVerified,
          projectId,
          type: record?.type as AdminCreateActivityRequestPayload['type'],
        })
      );
      setRequestId(request.requestId);
    } else {
      // create activity
      const request = dispatch(
        requestCreateActivity({
          date: record?.date as string,
          description: record?.description,
          projectId,
          type: record?.type as CreateActivityRequestPayload['type'],
        })
      );
      setRequestId(request.requestId);
    }
  }, [dispatch, isAcceleratorRoute, isEditing, projectId, record, validateForm]);

  // initialize record, if creating new
  useEffect(() => {
    if (record) {
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
  }, [projectId, record, selectedOrganization, setRecord]);

  useEffect(() => {
    if (createActivityRequest?.status === 'error' || adminCreateActivityRequest?.status === 'error') {
      setBusy(false);
      snackbar.toastError(strings.GENERIC_ERROR);
      setValidateFields(false);
    } else if (createActivityRequest?.status === 'success' || adminCreateActivityRequest?.status === 'success') {
      setBusy(false);
      navToActivityLog();
    }
  }, [adminCreateActivityRequest?.status, createActivityRequest, navToActivityLog, snackbar, strings.GENERIC_ERROR]);

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

  const onSetFiles = useCallback((files: File[]) => {
    setMediaFiles((prevFiles) => [...prevFiles, ...files]);
  }, []);

  const fileLimitReached = useMemo(() => (MAX_FILES ? mediaFiles.length >= MAX_FILES : false), [mediaFiles.length]);

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
        <MapSplitView>
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

            <Grid item xs={12}>
              {!fileLimitReached && (
                <FileChooser
                  acceptFileType='image/*, video/*'
                  chooseFileText={strings.CHOOSE_FILE}
                  maxFiles={20}
                  multipleSelection
                  setFiles={onSetFiles}
                  uploadDescription={strings.UPLOAD_FILES_DESCRIPTION}
                  uploadText={strings.ATTACH_IMAGES_OR_VIDEOS}
                />
              )}
            </Grid>

            {/* TODO: render media items */}
          </Grid>
        </MapSplitView>
      </Card>
    </PageForm>
  );
}
