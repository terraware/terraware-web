import React, { type JSX, useMemo, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { SelectT } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import { Project } from 'src/types/Project';

export interface AddSpeciesToProjectModalProps {
  onClose: () => void;
  onAdd: (projectIds: number[]) => void;
  availableProjects: Project[];
}

export default function AddSpeciesToProjectModal({
  onClose,
  onAdd,
  availableProjects,
}: AddSpeciesToProjectModalProps): JSX.Element {
  const theme = useTheme();

  const [selectedProjects, setSelectedProjects] = useState<(Project | undefined)[]>([availableProjects[0]]);
  const [error, setError] = useState('');

  const availableForRow = useMemo(
    () => (index: number) => {
      const selectedElsewhere = selectedProjects
        .filter((_, i) => i !== index)
        .map((project) => project?.id)
        .filter((id): id is number => id !== undefined);
      return availableProjects.filter((project) => !selectedElsewhere.includes(project.id));
    },
    [availableProjects, selectedProjects]
  );

  const onProjectChange = (project: Project, index: number) => {
    setSelectedProjects((previous) => {
      const updated = [...previous];
      updated[index] = project;
      return updated;
    });
  };

  const onAddRow = () => {
    const selectedIds = selectedProjects.map((project) => project?.id);
    const nextProject = availableProjects.find((project) => !selectedIds.includes(project.id));
    setSelectedProjects((previous) => [...previous, nextProject]);
  };

  const save = () => {
    const projectIds = selectedProjects.map((project) => project?.id).filter((id): id is number => id !== undefined);

    if (projectIds.length !== selectedProjects.length) {
      setError(strings.REQUIRED_FIELD);
      return;
    }

    onAdd(Array.from(new Set(projectIds)));
    onClose();
  };

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.ADD_TO_PROJECT}
      size='medium'
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
      <Grid container textAlign={'left'}>
        {selectedProjects.map((selectedProject, index) => (
          <Grid item xs={12} key={`project-${index}`} sx={{ marginTop: theme.spacing(2) }}>
            <SelectT<Project>
              id='project'
              label={strings.PROJECT}
              placeholder={strings.SELECT}
              options={availableForRow(index)}
              onChange={(project) => onProjectChange(project, index)}
              selectedValue={selectedProject}
              fullWidth={true}
              isEqual={(a: Project, b: Project) => a.id === b.id}
              renderOption={(project: Project) => project?.name || ''}
              displayLabel={(project: Project) => project?.name || ''}
              toT={(name: string) => ({ name }) as Project}
              required
              errorText={error && !selectedProject ? error : ''}
            />
          </Grid>
        ))}

        {selectedProjects.length < availableProjects.length && (
          <Box sx={{ marginTop: theme.spacing(2) }}>
            <Button label={strings.ADD_PROJECT} type='productive' priority='ghost' onClick={onAddRow} icon='iconAdd' />
          </Box>
        )}
      </Grid>
    </DialogBox>
  );
}
