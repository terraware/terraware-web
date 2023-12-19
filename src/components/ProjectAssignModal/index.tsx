import React, { useCallback, useEffect, useState } from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { useProjects } from 'src/components/InventoryV2/form/useProjects';
import ProjectsDropdown from 'src/components/InventoryV2/form/ProjectsDropdown';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectProjectRequest } from 'src/redux/features/projects/projectsSelectors';
import useSnackbar from 'src/utils/useSnackbar';
import { requestProjectAssign } from 'src/redux/features/projects/projectsAsyncThunks';
import { AssignProjectRequestPayload } from 'src/services/ProjectsService';

type ProjectAssignableEntity = { id: number; projectId?: number };
interface ProjectAssignModalProps<T extends ProjectAssignableEntity> {
  entity: T;
  assignPayloadCreator: () => AssignProjectRequestPayload;
  reloadEntity?: () => void;
  isModalOpen?: boolean;
  onClose: () => void;
}

function ProjectAssignModal<T extends ProjectAssignableEntity>(props: ProjectAssignModalProps<T>) {
  const { onClose, isModalOpen, assignPayloadCreator, reloadEntity } = props;

  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const { availableProjects } = useProjects(props.entity);
  const [entity, setEntity] = useState(props.entity);

  const [requestId, setRequestId] = useState('');
  const projectRequest = useAppSelector((state) => selectProjectRequest(state, requestId));

  const handleSave = useCallback(() => {
    if (entity.projectId && props.entity.projectId !== entity.projectId) {
      const request = dispatch(requestProjectAssign({ projectId: entity.projectId, entities: assignPayloadCreator() }));
      setRequestId(request.requestId);
    }

    onClose();
  }, [entity.projectId, props.entity.projectId, onClose, dispatch, assignPayloadCreator]);

  const handleUpdateProject = useCallback(
    (setFn: (previousEntity: T) => T) => {
      const nextEntity = setFn(entity);
      setEntity(nextEntity);
    },
    [entity]
  );

  useEffect(() => {
    if (projectRequest?.status === 'success') {
      setRequestId('');

      if (reloadEntity) {
        reloadEntity();
      }
    } else if (projectRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [projectRequest, props, reloadEntity, snackbar]);

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
      <ProjectsDropdown availableProjects={availableProjects} record={entity} setRecord={handleUpdateProject} />
    </DialogBox>
  );
}

export default ProjectAssignModal;
