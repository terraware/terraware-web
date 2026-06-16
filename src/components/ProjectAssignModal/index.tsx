import React, { useCallback, useEffect, useState } from 'react';

import { Grid } from '@mui/material';

import ProjectsDropdown from 'src/components/ProjectsDropdown';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useProjects } from 'src/hooks/useProjects';
import { AssignProjectRequestPayload, useAssignProjectMutation } from 'src/queries/generated/projects';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

type ProjectAssignableEntity = { id: number; projectId?: number };
interface ProjectAssignModalProps<T extends ProjectAssignableEntity> {
  entity: T;
  assignPayloadCreator: () => AssignProjectRequestPayload;
  reloadEntity?: () => void;
  isModalOpen?: boolean;
  onClose: () => void;
  onUnAssign?: () => void;
}

function ProjectAssignModal<T extends ProjectAssignableEntity>(props: ProjectAssignModalProps<T>) {
  const { onClose, isModalOpen, assignPayloadCreator, reloadEntity, onUnAssign } = props;

  const snackbar = useSnackbar();

  const { availableProjects } = useProjects(props.entity);
  const [entity, setEntity] = useState(props.entity);

  const [assignProject, { isSuccess, isError }] = useAssignProjectMutation();

  const handleSave = useCallback(() => {
    if (onUnAssign && !entity.projectId) {
      onUnAssign();
    }

    if (entity.projectId && props.entity.projectId !== entity.projectId) {
      void assignProject({
        id: entity.projectId,
        assignProjectRequestPayload: assignPayloadCreator(),
      });
    }

    onClose();
  }, [entity.projectId, props.entity.projectId, onClose, assignProject, assignPayloadCreator, onUnAssign]);

  const handleUpdateProject = useCallback(
    (setFn: (previousEntity: T) => T) => {
      const nextEntity = setFn(entity);
      setEntity(nextEntity);
    },
    [entity]
  );

  useEffect(() => {
    if (isSuccess) {
      if (reloadEntity) {
        reloadEntity();
      }
    } else if (isError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [isSuccess, isError, reloadEntity, snackbar]);

  return (
    <DialogBox
      onClose={onClose}
      open={isModalOpen || false}
      title={strings.ADD_TO_PROJECT}
      size={'small'}
      middleButtons={[
        <Button
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          key='button-1'
          id='cancelButton'
        />,
        <Button label={strings.SAVE} onClick={handleSave} key='button-2' id='saveButton' />,
      ]}
    >
      <Grid item xs={12} textAlign='left'>
        <ProjectsDropdown
          availableProjects={availableProjects}
          record={entity}
          setRecord={handleUpdateProject}
          allowUnselect={!!onUnAssign}
        />
      </Grid>
    </DialogBox>
  );
}

export default ProjectAssignModal;
