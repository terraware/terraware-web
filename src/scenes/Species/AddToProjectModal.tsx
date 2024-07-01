import React, { useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { Dropdown, SelectT } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { getSpeciesNativeCategoryOptions } from 'src/types/ParticipantProjectSpecies';
import { Project } from 'src/types/Project';
import useForm from 'src/utils/useForm';

export interface AddToProjectModalProps {
  onClose: (reload?: boolean) => void;
  onSubmit: (projectsSpeciesAdded: ProjectSpecies[]) => void;
  projects: Project[];
}

export type ProjectSpecies = {
  project: Project;
  nativeCategory?: string;
};

export default function AddToProjectModal(props: AddToProjectModalProps): JSX.Element {
  const { onClose, onSubmit, projects } = props;
  const theme = useTheme();

  const [projectsSpeciesAdded, setProjectsSpeciesAdded] = useForm<ProjectSpecies[]>([{ project: projects[0] }]);
  const [error, setError] = useState('');

  const save = () => {
    if (projectsSpeciesAdded.length > 0) {
      if (!projectsSpeciesAdded.every((ps) => ps.nativeCategory)) {
        setError(strings.REQUIRED_FIELD);
        return;
      }

      onSubmit(projectsSpeciesAdded);
      onClose();
    }
  };

  const { activeLocale } = useLocalization();

  const onAddProjectSpecies = () => {
    const updatedProjects = [...projectsSpeciesAdded];
    updatedProjects.push({ project: projects[0] });

    setProjectsSpeciesAdded(updatedProjects);
  };

  const onProjectSpeciesChange = (id: string, value: any, index: number) => {
    const updatedProjects = [...projectsSpeciesAdded];
    if (id === 'nativeCategory') {
      updatedProjects[index].nativeCategory = value;
    } else {
      updatedProjects[index].project = value;
    }

    setProjectsSpeciesAdded(updatedProjects);
  };

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.ADD_TO_PROJECT}
      size='small'
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          type='passive'
          onClick={() => onClose()}
          priority='secondary'
          key='button-1'
        />,
        <Button id='save' onClick={save} label={strings.ADD} key='button-2' />,
      ]}
    >
      <Grid container textAlign={'left'}>
        {projectsSpeciesAdded.map((ps, index) => {
          return (
            <Box
              sx={{
                borderBottom:
                  projectsSpeciesAdded.length > 1 ? `1px solid ${theme.palette.TwClrBaseGray300}` : undefined,
                paddingBottom: 2,
                marginBottom: 2,
              }}
              key={`project-${index}`}
            >
              <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
                <SelectT<Project>
                  id='project'
                  label={strings.PROJECT}
                  placeholder={strings.SELECT}
                  options={projects || []}
                  onChange={(project) => onProjectSpeciesChange('project', project, index)}
                  selectedValue={ps.project}
                  fullWidth={true}
                  isEqual={(a: Project, b: Project) => a.id === b.id}
                  renderOption={(project: Project) => project?.name || ''}
                  displayLabel={(project: Project) => project?.name || ''}
                  toT={(name: string) => ({ name }) as Project}
                  required
                />
              </Grid>
              <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
                <Dropdown
                  id='nativeCategory'
                  selectedValue={ps?.nativeCategory}
                  onChange={(value) => onProjectSpeciesChange('nativeCategory', value, index)}
                  options={getSpeciesNativeCategoryOptions(activeLocale)}
                  label={strings.NATIVE_NON_NATIVE}
                  aria-label={strings.NATIVE_NON_NATIVE}
                  placeholder={strings.SELECT}
                  fixedMenu
                  required
                  fullWidth={true}
                  errorText={error && !ps.nativeCategory ? error : ''}
                />
              </Grid>
            </Box>
          );
        })}

        {projectsSpeciesAdded.length < projects.length && (
          <Button
            label={strings.ADD_PROJECT}
            type='productive'
            priority='ghost'
            onClick={onAddProjectSpecies}
            icon='iconAdd'
          />
        )}
      </Grid>
    </DialogBox>
  );
}
