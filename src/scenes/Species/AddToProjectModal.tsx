import React, { useEffect, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import { SelectT } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useOrganization } from 'src/providers';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Project } from 'src/types/Project';

export interface AddToProjectModalProps {
  onClose: (reload?: boolean) => void;
  onSubmit: (id: number) => void;
}

export default function AddToProjectModal(props: AddToProjectModalProps): JSX.Element {
  const { onClose, onSubmit } = props;
  const projects = useAppSelector(selectProjects);
  const theme = useTheme();
  const [selectedProject, setSelectedProject] = useState<Project>();
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();

  useEffect(() => {
    void dispatch(requestProjects(selectedOrganization.id));
  }, [selectedOrganization]);

  const save = () => {
    if (selectedProject) {
      onSubmit(selectedProject.id);
      onClose();
    }
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
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <SelectT<Project>
            id='project'
            label={strings.PROJECT}
            placeholder={strings.SELECT}
            options={projects || []}
            onChange={(project) => setSelectedProject(project)}
            selectedValue={selectedProject}
            fullWidth={true}
            isEqual={(a: Project, b: Project) => a.id === b.id}
            renderOption={(project: Project) => project?.name || ''}
            displayLabel={(project: Project) => project?.name || ''}
            toT={(name: string) => ({ name }) as Project}
            required
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
