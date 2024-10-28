import React, { useEffect, useState } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { DropdownItem, Icon, MultiSelect, SelectT } from '@terraware/web-components';
import { DateTime } from 'luxon';

import AddLink from 'src/components/common/AddLink';
import DatePicker from 'src/components/common/DatePicker';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Link from 'src/components/common/Link';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { requestListModuleCohorts } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModuleCohorts } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { CohortModuleWithProject, ModuleEventPartial, ModuleEventProject } from 'src/types/Module';
import useForm from 'src/utils/useForm';

export interface AddEventModalProps {
  onClose: () => void;
  onSave: (eventModule: ModuleEventPartial) => void;
  moduleId: number;
  type: 'One-on-One Session' | 'Workshop' | 'Live Session' | 'Recorded Session';
  moduleName: string;
  eventToEdit?: ModuleEventPartial;
}

export type ProjectsSection = {
  cohort: CohortModuleWithProject;
  projectIds: string[];
};

export default function AddEventModal(props: AddEventModalProps): JSX.Element {
  const { onClose, onSave, eventToEdit, moduleId } = props;
  const dispatch = useAppDispatch();
  const result = useAppSelector(selectModuleCohorts(moduleId.toString()));
  const [availableCohorts, setAvailableCohorts] = useState<CohortModuleWithProject[]>();
  const [projectsSections, setProjectsSections] = useState<ProjectsSection[]>([{ cohort: {}, projectIds: [] }]);

  useEffect(() => {
    if (eventToEdit?.projects && eventToEdit.projects.length > 0) {
      const existingProjectsIdsByCohortId: Record<number, string[]> = {};
      const cohortsIds = new Set<number>();
      eventToEdit?.projects?.forEach((proj) => {
        if (proj.cohortId && proj.projectId) {
          cohortsIds.add(proj.cohortId);
          existingProjectsIdsByCohortId[proj.cohortId]
            ? (existingProjectsIdsByCohortId[proj.cohortId] = [
                ...existingProjectsIdsByCohortId[proj.cohortId],
                proj.projectId.toString(),
              ])
            : (existingProjectsIdsByCohortId[proj.cohortId] = [proj.projectId.toString()]);
        }
      });
      setProjectsSections(() => {
        return Array.from(cohortsIds).map((cohortId) => {
          return {
            cohort: availableCohorts?.find((c) => c.id?.toString() === cohortId.toString()),
            projectIds: existingProjectsIdsByCohortId[cohortId],
          } as ProjectsSection;
        });
      });
    }
  }, [eventToEdit, availableCohorts]);

  useEffect(() => {
    if (module?.id) {
      dispatch(requestListModuleCohorts(moduleId.toString()));
    }
  }, [module?.id]);

  useEffect(() => {
    if (result?.status === 'success') {
      let cohortsToSelect: CohortModuleWithProject[] = [];
      const cohortModules = result.data?.cohortModules;
      cohortModules?.forEach((cm) => {
        cohortsToSelect.push(cm.cohort);
      });

      const alreadySelectedCohortsIds = projectsSections.map((ps) => ps.cohort.id?.toString());

      cohortsToSelect = cohortsToSelect.filter((cTS) => !alreadySelectedCohortsIds.includes(cTS.id?.toString()));

      setAvailableCohorts(cohortsToSelect);
    }
  }, [result, projectsSections]);

  const theme = useTheme();

  const [record, , onChange] = useForm<ModuleEventPartial>(eventToEdit || { id: -1 });

  const save = () => {
    const projectsWithCohort: ModuleEventProject[] = [];
    projectsSections.forEach((ps) =>
      ps.projectIds.forEach((projId) => {
        const foundCohort = availableCohorts?.find((coh) => coh.id === ps.cohort.id);
        const allCohortProjects = foundCohort?.participants?.flatMap((p) => p.projects.flatMap((p) => p));
        const foundProject = allCohortProjects?.find((pr) => pr.id.toString() === projId.toString());
        projectsWithCohort.push({ cohortId: ps.cohort.id, projectId: Number(projId), projectName: foundProject?.name });
      })
    );

    onSave({ ...record, projects: projectsWithCohort });
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

  const removeProjectsSection = (index: number) => {
    setProjectsSections((prev) => {
      const oldProjectSections = [...prev];
      oldProjectSections.splice(index, 1);

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
          <Typography marginTop={2} fontSize='20px' fontWeight={600}>
            {strings.PROJECTS}
          </Typography>
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
                  <Grid container alignItems='center'>
                    <Grid item xs={10}>
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
                    <Grid item xs={2}>
                      <Link
                        onClick={() => removeProjectsSection(index)}
                        disabled={projectsSections.length === 1}
                        style={{ paddingTop: 3, paddingLeft: 1 }}
                      >
                        <Icon
                          name='iconSubtract'
                          style={{
                            height: '20px',
                            width: '20px',
                          }}
                        />
                      </Link>
                    </Grid>
                  </Grid>
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
