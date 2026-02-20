import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { DateTime } from 'luxon';

import DatePicker from 'src/components/common/DatePicker';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { requestListModuleProjects } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModuleProjects } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ModuleEventPartial, ProjectInModule } from 'src/types/Module';
import useForm from 'src/utils/useForm';

import MultiProjectsEdit from '../FundingEntities/MultiProjectsEdit';

export interface AddEventModalProps {
  onClose: () => void;
  onSave: (eventModule: ModuleEventPartial) => void;
  moduleId: number;
  type: 'One-on-One Session' | 'Workshop' | 'Live Session' | 'Recorded Session';
  moduleName: string;
  eventToEdit?: ModuleEventPartial;
}

export default function AddEventModal(props: AddEventModalProps): JSX.Element {
  const { onClose, onSave, eventToEdit, moduleId } = props;
  const dispatch = useAppDispatch();
  const result = useAppSelector(selectModuleProjects(moduleId.toString()));
  const [availableProjects, setAvailableProjects] = useState<ProjectInModule[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<{ projectId: number; dealName?: string }[]>([]);
  const [dateError, setDateError] = useState(false);

  useEffect(() => {
    if (eventToEdit?.projects && eventToEdit.projects.length > 0) {
      setSelectedProjects(
        eventToEdit.projects.map((p) => ({ projectId: Number(p.projectId), dealName: p.projectName }))
      );
    }
  }, [eventToEdit]);

  useEffect(() => {
    if (moduleId) {
      void dispatch(requestListModuleProjects(moduleId.toString()));
    }
  }, [dispatch, moduleId]);

  useEffect(() => {
    if (result?.status === 'success' && availableProjects.length === 0) {
      setAvailableProjects(result.data?.projectModules || []);
    }
  }, [result, availableProjects]);

  const theme = useTheme();

  const [record, , onChange, onChangeCallback] = useForm<ModuleEventPartial>(eventToEdit || { id: -1 });

  const save = () => {
    if (record.endTime && record.startTime) {
      const endDateDate = new Date(record.endTime);
      const startDateDate = new Date(record.startTime);
      if (endDateDate < startDateDate) {
        setDateError(true);
        return;
      }
    }

    onSave({
      ...record,
      projects: selectedProjects.map((project) => ({
        projectId: project.projectId,
        projectName: project.dealName || '',
      })),
    });
  };

  const projectOptions = useMemo(() => {
    return availableProjects.map((project) => ({
      projectId: Number(project.project_id) || -1,
      dealName: project.project_name,
    }));
  }, [availableProjects]);

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.EVENT_DETAILS}
      size='large'
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button id='save' onClick={save} label={eventToEdit ? strings.UPDATE : strings.ADD} key='button-2' />,
      ]}
      scrolled
    >
      <Grid container textAlign={'left'} spacing={2}>
        <Grid item xs={6} sx={{ marginTop: theme.spacing(2), paddingRight: 1 }}>
          <DatePicker
            id='startTime'
            label={strings.START_DATE}
            value={record.startTime}
            onDateChange={(value?: DateTime) => {
              onChange('startTime', value?.toISO());
            }}
            aria-label='date-picker'
            showTime={true}
          />
        </Grid>
        <Grid item xs={6} sx={{ marginTop: theme.spacing(2), paddingLeft: 1 }}>
          <DatePicker
            id='endTime'
            label={strings.END_DATE}
            value={record.endTime}
            onDateChange={(value?: DateTime) => {
              onChange('endTime', value?.toISO());
            }}
            aria-label='date-picker'
            showTime={true}
            errorText={record.endTime && dateError ? strings.INVALID_DATE : ''}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='meetingUrl'
            label={strings.MEETING_URL}
            type='text'
            value={record.meetingUrl}
            onChange={onChangeCallback('meetingUrl')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='recordingUrl'
            label={strings.RECORDING_URL}
            type='text'
            value={record.recordingUrl}
            onChange={onChangeCallback('recordingUrl')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='slidesUrl'
            label={strings.SLIDES_URL}
            type='text'
            value={record.slidesUrl}
            onChange={onChangeCallback('slidesUrl')}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography marginTop={2} fontSize='20px' fontWeight={600}>
            {strings.PROJECTS}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <MultiProjectsEdit
            projects={selectedProjects}
            allProjects={projectOptions}
            setProjects={setSelectedProjects}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
