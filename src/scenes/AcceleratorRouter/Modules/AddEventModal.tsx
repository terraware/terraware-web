import React, { useEffect, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import { DatePicker, DropdownItem, MultiSelect, SelectT } from '@terraware/web-components';
import { DateTime } from 'luxon';

import AddLink from 'src/components/common/AddLink';
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

export type ProjectsSection = {
  cohort: CohortModuleWithProject;
  projectIds: string[];
};

export default function AddEventModal(props: AddEventModalProps): JSX.Element {
  const { onClose, onSave, eventToEdit, moduleId, moduleName, type } = props;
  const dispatch = useAppDispatch();
  const result = useAppSelector(selectModuleCohortsAndProjects(moduleId.toString()));
  const [availableCohorts, setAvailableCohorts] = useState<CohortModuleWithProject[]>();
  const [projectsSections, setProjectsSections] = useState<ProjectsSection[]>([{ cohort: {}, projectIds: [] }]);

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

  const getProjectsForCohort = (selectedCohort: CohortModuleWithProject) => {
    const allProjects: DropdownItem[] = [];
    selectedCohort?.participants?.forEach((pp) => {
      pp.projects.forEach((proj) => {
        allProjects.push({ label: proj.name, value: proj.id });
      });
    });

    return allProjects;
  };

  const updateProjectSectionCohort = (index: number, newCohort: CohortModuleWithProject) => {
    setProjectsSections((prev) => {
      const oldProjectSections = [...prev];
      if (oldProjectSections[index]) {
        oldProjectSections[index].cohort = newCohort;
      } else {
        oldProjectSections[index] = { cohort: newCohort, projectIds: [] };
      }

      return oldProjectSections;
    });
  };

  const onAddProject = (index: number, projectId: string) => {
    setProjectsSections((prev) => {
      const oldProjectSections = [...prev];
      if (oldProjectSections[index]) {
        oldProjectSections[index].projectIds.push(projectId);
      }

      return oldProjectSections;
    });
  };

  const onRemoveProject = (index: number, projectId: string) => {
    setProjectsSections((prev) => {
      const oldProjectSections = [...prev];
      if (oldProjectSections[index]) {
        const foundIndex = oldProjectSections[index].projectIds.findIndex((pId) => pId === projectId);
        oldProjectSections[index].projectIds.splice(foundIndex, 1);
      }

      return oldProjectSections;
    });
  };

  const addProjectsSection = () => {
    setProjectsSections((prev) => {
      const oldProjectSections = [...prev];
      oldProjectSections.push({ cohort: {}, projectIds: [] });

      return oldProjectSections;
    });
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
        <Grid item xs={12}>
          {projectsSections.map((ps, index) => {
            return (
              <Grid
                key={`proj-${index}`}
                container
                sx={{
                  borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                  paddingBottom: 2,
                }}
              >
                <Grid item xs={6} sx={{ marginTop: theme.spacing(2), paddingRight: 1 }}>
                  <SelectT<CohortModuleWithProject>
                    id='cohort'
                    label={strings.COHORT}
                    placeholder={strings.SELECT}
                    options={availableCohorts}
                    onChange={(_cohort: CohortModuleWithProject) => {
                      updateProjectSectionCohort(index, _cohort);
                    }}
                    selectedValue={ps.cohort}
                    fullWidth={true}
                    isEqual={(a: CohortModuleWithProject, b: CohortModuleWithProject) => a.id === b.id}
                    renderOption={(_cohort: CohortModuleWithProject) => _cohort?.name || ''}
                    displayLabel={(_cohort: CohortModuleWithProject) => _cohort?.name || ''}
                    toT={(name: string) => ({ name }) as unknown as CohortModuleWithProject}
                  />
                </Grid>
                <Grid item xs={6} sx={{ marginTop: theme.spacing(2), paddingLeft: 1 }}>
                  <MultiSelect
                    label={strings.PROJECT}
                    fullWidth={true}
                    onAdd={(projectId) => onAddProject(index, projectId)}
                    onRemove={(projectId) => onRemoveProject(index, projectId)}
                    options={new Map(getProjectsForCohort(ps.cohort).map((pr) => [pr.value, pr.label]))}
                    valueRenderer={(v) => v}
                    selectedOptions={ps.projectIds}
                  />
                </Grid>
              </Grid>
            );
          })}
        </Grid>
        <Grid item xs={12}>
          <AddLink id='add-cohort-project' large={true} onClick={addProjectsSection} text={strings.ADD} />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
