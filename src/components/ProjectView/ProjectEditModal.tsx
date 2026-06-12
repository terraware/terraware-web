import React, { type JSX, useEffect, useState } from 'react';

import { Grid } from '@mui/material';

import DialogBox from 'src/components/common/ScrollableDialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { useUpdateProjectMutation } from 'src/queries/generated/projects';
import strings from 'src/strings';
import { Project } from 'src/types/Project';
import useSnackbar from 'src/utils/useSnackbar';

export type ProjectEditModalProps = {
  open: boolean;
  onClose: () => void;
  project?: Project;
  reload: () => void;
};

export default function ProjectEditModal({ open, onClose, project, reload }: ProjectEditModalProps): JSX.Element {
  const snackbar = useSnackbar();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [validateFields, setValidateFields] = useState(false);
  const [updateProject, { isError, isSuccess, reset }] = useUpdateProjectMutation();

  useEffect(() => {
    if (open) {
      setValidateFields(false);
      setName(project?.name ?? '');
      setDescription(project?.description ?? '');
    }
  }, [open, project]);

  const saveProject = () => {
    if (!project) {
      return;
    }

    if (!name) {
      setValidateFields(true);
      return;
    }

    void updateProject({ id: project.id, updateProjectRequestPayload: { name, description } });
  };

  useEffect(() => {
    if (isError) {
      reset();
      snackbar.toastError();
    } else if (isSuccess && project) {
      reset();
      snackbar.toastSuccess(strings.CHANGES_SAVED, strings.SAVED);
      reload();
      onClose();
    }
  }, [isError, isSuccess, reset, snackbar, project, reload, onClose]);

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={project?.name ?? strings.EDIT_PROJECT}
      size='medium'
      middleButtons={[
        <Button
          id='cancelEditProject'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          key='button-1'
        />,
        <Button id='saveEditProject' label={strings.SAVE} onClick={saveProject} key='button-2' />,
      ]}
    >
      <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
        <Grid item xs={12}>
          <TextField
            id='name'
            label={strings.NAME}
            type='text'
            onChange={(value) => setName(value as string)}
            value={name}
            errorText={validateFields && !name ? strings.REQUIRED_FIELD : ''}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='description'
            label={strings.DESCRIPTION}
            type='text'
            onChange={(value) => setDescription(value as string)}
            value={description}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
