import React, { useEffect, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import { DatePicker, Dropdown, DropdownItem, SelectT } from '@terraware/web-components';
import { DateTime } from 'luxon';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { requestListModuleCohortsAndProjects } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModuleCohortsAndProjects } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { CohortModuleWithProject, ModuleEvent } from 'src/types/Module';
import useForm from 'src/utils/useForm';

export interface AddEventModalProps {
  onClose: () => void;
  onSave: (eventModule: ModuleEvent) => void;
  moduleId: number;
  type: 'One-on-One Session' | 'Workshop' | 'Live Session' | 'Recorded Session';
  moduleName: string;
  eventToEdit?: ModuleEvent;
}

export default function AddEventModal(props: AddEventModalProps): JSX.Element {
  const { onClose, onSave, eventToEdit, moduleId, moduleName, type } = props;
  const dispatch = useAppDispatch();
  const result = useAppSelector(selectModuleCohortsAndProjects(moduleId.toString()));
  const [availableCohorts, setAvailableCohorts] = useState<CohortModuleWithProject[]>();
  const [selectedCohort, setSelectedCohort] = useState<CohortModuleWithProject>();
  const [selectedProject, setSelectedProject] = useState<string>();

  useEffect(() => {
    if (module?.id) {
      dispatch(requestListModuleCohortsAndProjects(moduleId.toString()));
    }
  }, [module?.id]);

  useEffect(() => {
    if (result?.status === 'success') {
      const cohortsToSelect: CohortModuleWithProject[] = [];
      const cohortModules = result.data?.cohortModules;
      cohortModules?.forEach((cm) => {
        cohortsToSelect.push(cm.cohort);
      });

      setAvailableCohorts(cohortsToSelect);
    }
  }, [result]);

  const theme = useTheme();

  const [record, , onChange] = useForm<ModuleEvent>(
    eventToEdit || { id: -1, moduleId: moduleId, type: type, moduleName: moduleName, status: 'Not Started' }
  );

  const save = () => {
    onSave(record);
  };

  const getProjectsForCohort = () => {
    const allProjects: DropdownItem[] = [];
    selectedCohort?.participants.forEach((pp) => {
      pp.projects.forEach((proj) => {
        allProjects.push({ label: proj.name, value: proj.id });
      });
    });

    return allProjects;
  };

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
        <Button id='save' onClick={save} label={strings.ADD} key='button-2' />,
      ]}
    >
      <Grid container textAlign={'left'} spacing={2}>
        <Grid item xs={6} sx={{ marginTop: theme.spacing(2), paddingRight: 1 }}>
          <DatePicker
            id='startTime'
            label={strings.START_DATE}
            value={record.startTime}
            onDateChange={(value?: DateTime) => {
              onChange('startTime', value?.toFormat('yyyy-MM-dd'));
            }}
            aria-label='date-picker'
          />
        </Grid>
        <Grid item xs={6} sx={{ marginTop: theme.spacing(2), paddingLeft: 1 }}>
          <DatePicker
            id='endTime'
            label={strings.END_DATE}
            value={record.endTime}
            onDateChange={(value) => {
              onChange('endTime', value?.toFormat('yyyy-MM-dd'));
            }}
            aria-label='date-picker'
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='meetingUrl'
            label={strings.MEETING_URL}
            type='text'
            value={record.meetingUrl}
            onChange={(value: unknown) => onChange('meetingUrl', value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='recordingUrl'
            label={strings.RECORDING_URL}
            type='text'
            value={record.recordingUrl}
            onChange={(value: unknown) => onChange('recordingUrl', value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='slidesUrl'
            label={strings.SLIDES_URL}
            type='text'
            value={record.slidesUrl}
            onChange={(value: unknown) => onChange('slidesUrl', value)}
          />
        </Grid>
        <Grid item xs={6} sx={{ marginTop: theme.spacing(2), paddingRight: 1 }}>
          <SelectT<CohortModuleWithProject>
            id='cohort'
            label={strings.COHORT}
            placeholder={strings.SELECT}
            options={availableCohorts}
            onChange={(_cohort: CohortModuleWithProject) => {
              setSelectedCohort(_cohort);
            }}
            selectedValue={selectedCohort}
            fullWidth={true}
            isEqual={(a: CohortModuleWithProject, b: CohortModuleWithProject) => a.id === b.id}
            renderOption={(_cohort: CohortModuleWithProject) => _cohort?.name || ''}
            displayLabel={(_cohort: CohortModuleWithProject) => _cohort?.name || ''}
            toT={(name: string) => ({ name }) as unknown as CohortModuleWithProject}
            required
          />
        </Grid>
        <Grid item xs={6} sx={{ marginTop: theme.spacing(2), paddingLeft: 1 }}>
          <Dropdown
            required
            label={strings.PROJECT}
            onChange={(projId: string) => setSelectedProject(projId)}
            selectedValue={selectedProject}
            options={getProjectsForCohort()}
            fullWidth={true}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
