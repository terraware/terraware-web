import React, { type JSX, useEffect, useState } from 'react';

import { Grid } from '@mui/material';

import DialogBox from 'src/components/common/ScrollableDialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { baseApi } from 'src/queries/baseApi';
import { QueryTagTypes } from 'src/queries/tags';
import { requestProjectUpdate } from 'src/redux/features/projects/projectsAsyncThunks';
import { selectProjectRequest } from 'src/redux/features/projects/projectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
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
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [validateFields, setValidateFields] = useState(false);
  const [requestId, setRequestId] = useState('');
  const projectUpdateRequest = useAppSelector((state) => selectProjectRequest(state, requestId));

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

    const dispatched = dispatch(requestProjectUpdate({ projectId: project.id, project: { name, description } }));
    setRequestId(dispatched.requestId);
  };

  useEffect(() => {
    if (!projectUpdateRequest) {
      return;
    }

    if (projectUpdateRequest.status === 'error') {
      setRequestId('');
      snackbar.toastError();
    } else if (projectUpdateRequest.status === 'success' && project) {
      setRequestId('');
      snackbar.toastSuccess(strings.CHANGES_SAVED, strings.SAVED);
      void dispatch(baseApi.util.invalidateTags([{ type: QueryTagTypes.Projects, id: 'LIST' }]));
      reload();
      onClose();
    }
  }, [dispatch, projectUpdateRequest, snackbar, project, reload, onClose]);

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
