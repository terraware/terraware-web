import React, { useCallback, useEffect, useState } from 'react';
import { Icon } from '@terraware/web-components';
import { Box, Link as LinkMUI, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
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

const useStyles = makeStyles((theme: Theme) => ({
  addIcon: {
    fill: theme.palette.TwClrIcnBrand,
    height: '20px',
    width: '20px',
    marginRight: '5px',
  },
}));

type ProjectAssignableEntity = { id: number; projectId?: number };
interface ProjectAssignModalProps<T extends ProjectAssignableEntity> {
  entity: T;
  assignPayloadCreator: () => AssignProjectRequestPayload;
  reloadEntity?: () => void;
}

function ProjectAssignModal<T extends ProjectAssignableEntity>(props: ProjectAssignModalProps<T>) {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const classes = useStyles();
  const snackbar = useSnackbar();

  const { availableProjects } = useProjects(props.entity);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [entity, setEntity] = useState(props.entity);

  const [requestId, setRequestId] = useState('');
  const projectRequest = useAppSelector((state) => selectProjectRequest(state, requestId));

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSave = useCallback(() => {
    if (entity.projectId && props.entity.projectId !== entity.projectId) {
      const request = dispatch(
        requestProjectAssign({ projectId: entity.projectId, entities: props.assignPayloadCreator() })
      );
      setRequestId(request.requestId);
    }

    setIsOpen(false);
  }, [entity.projectId, props, dispatch]);

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

      if (props.reloadEntity) {
        props.reloadEntity();
      }
    } else if (projectRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [projectRequest, props, snackbar]);

  const linkStyle = {
    color: theme.palette.TwClrTxtBrand,
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  };

  return (
    <>
      <LinkMUI sx={linkStyle} onClick={() => setIsOpen(true)}>
        <Box display='flex' alignItems='center'>
          <Icon name='iconAdd' className={classes.addIcon} />
          {strings.ADD_TO_PROJECT}
        </Box>
      </LinkMUI>

      <DialogBox
        onClose={handleCancel}
        open={isOpen}
        title={strings.ADD_TO_PROJECT}
        size={'small'}
        middleButtons={[
          <Button
            label={strings.CANCEL}
            priority='secondary'
            type='passive'
            onClick={handleCancel}
            key='button-1'
            id='cancelButton'
          />,
          <Button label={strings.SAVE} onClick={handleSave} key='button-2' id='saveButton' />,
        ]}
      >
        <ProjectsDropdown availableProjects={availableProjects} record={entity} setRecord={handleUpdateProject} />
      </DialogBox>
    </>
  );
}

export default ProjectAssignModal;
