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
import {
  ACTIVITY_TYPES,
  Activity,
  ActivityType,
  CreateActivityRequestPayload,
  UpdateActivityRequestPayload,
  activityTypeLabel,
} from 'src/types/Activity';
import useForm from 'src/utils/useForm';

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
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { availableParticipants } = useParticipants();
  const { selectedProject } = useProjects({ projectId });
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { goToAcceleratorActivityLog, goToActivityLog } = useNavigateTo();

  const [record, setRecord, onChange, onChangeCallback] = useForm<FormRecord>(undefined);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

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

  // initialize record, if creating new
  useEffect(() => {
    if (record) {
      return;
    }

    const newActivity: Partial<CreateActivityRequestPayload> = {
      date: getTodaysDateFormatted(),
      description: '',
      projectId,
    };

    setRecord({ ...newActivity });
  }, [projectId, record, selectedOrganization, setRecord]);

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
      cancelID='cancelSaveActivity'
      onCancel={navToActivityLog}
      onSave={navToActivityLog}
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
                id='date'
                label={strings.DATE_REQUIRED}
                onDateChange={onChangeDate}
                sx={{ '& .MuiInputBase-input': { paddingRight: 0 } }}
                value={record.date}
              />
            </Grid>

            <Grid item xs={12}>
              <Textfield
                id='description'
                label={strings.DESCRIPTION}
                onChange={onChangeCallback('description')}
                required
                sx={{ '& .textfield-value': { minHeight: '80px' } }}
                type='textarea'
                value={record?.description}
              />
            </Grid>

            <Grid item xs={12}>
              <Checkbox
                id='verified'
                label={strings.VERIFIED}
                name='verified'
                onChange={onChangeIsVerified}
                value={record?.isVerified}
              />
            </Grid>

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
