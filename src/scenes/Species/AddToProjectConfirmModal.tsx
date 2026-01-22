import React, { type JSX } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import { Project } from 'src/types/Project';

export interface AddToProjectConfirmModalProps {
  onClose: (reload?: boolean) => void;
  onConfirm: () => void;
  projects: Project[];
}

export default function AddToProjectConfirmModal(props: AddToProjectConfirmModalProps): JSX.Element {
  const { onClose, onConfirm, projects } = props;

  const theme = useTheme();

  const handleOnConfirm = () => {
    onConfirm();
    onClose();
  };

  const projectNames = projects.map((project) => project.name).join(', ');

  return (
    <>
      <DialogBox
        onClose={onClose}
        open={true}
        title={strings.RESET_STATUS}
        size='medium'
        middleButtons={[
          <Button
            id='cancel'
            label={strings.CANCEL}
            type='passive'
            onClick={() => onClose()}
            priority='secondary'
            key='button-1'
          />,
          <Button id='save' onClick={handleOnConfirm} label={strings.ADD} key='button-2' />,
        ]}
      >
        <Grid container textAlign={'center'}>
          <Typography sx={{ marginBottom: theme.spacing(3), width: '100%' }}>
            {strings.formatString(strings.RESET_STATUS_BODY, projectNames)}
          </Typography>
          <Typography sx={{ width: '100%' }}>{strings.ARE_YOU_SURE}</Typography>
        </Grid>
      </DialogBox>
    </>
  );
}
