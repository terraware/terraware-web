import React, { useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import { SelectT } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import strings from 'src/strings';
import { ParticipantProject } from 'src/types/Participant';

export interface AddToProjectModalProps {
  onClose: (reload?: boolean) => void;
  onSubmit: (id: number) => void;
}

export default function AddToProjectModal(props: AddToProjectModalProps): JSX.Element {
  const { onClose, onSubmit } = props;
  const { currentParticipant } = useParticipantData();
  const theme = useTheme();
  const [selectedProject, setSelectedProject] = useState<ParticipantProject>();

  const save = () => {
    if (selectedProject) {
      onSubmit(selectedProject.projectId);
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
          <SelectT<ParticipantProject>
            id='project'
            label={strings.PROJECT}
            placeholder={strings.SELECT}
            options={currentParticipant?.projects || []}
            onChange={(project) => setSelectedProject(project)}
            selectedValue={selectedProject}
            fullWidth={true}
            isEqual={(a: ParticipantProject, b: ParticipantProject) => a.projectId === b.projectId}
            renderOption={(project: ParticipantProject) => project?.projectName || ''}
            displayLabel={(project: ParticipantProject) => project?.projectName || ''}
            toT={(projectName: string) => ({ projectName }) as ParticipantProject}
            required
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
