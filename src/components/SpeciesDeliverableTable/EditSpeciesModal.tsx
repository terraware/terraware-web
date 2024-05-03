import React, { useEffect, useState } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { requestUpdateParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectParticipantProjectUpdateRequest } from 'src/redux/features/participantProjects/participantProjectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { useParticipantProjectData } from 'src/scenes/AcceleratorRouter/ParticipantProjects/ParticipantProjectContext';
import { ParticipantProjectSpecies } from 'src/services/ParticipantProjectSpeciesService';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

import Link from '../common/Link';

export interface AddEditSubLocationProps {
  onClose: () => void;
  reload: () => void;
  projectSpecies: ParticipantProjectSpecies;
}

export default function EditSpeciesModal(props: AddEditSubLocationProps): JSX.Element {
  const { onClose, reload, projectSpecies } = props;
  const theme = useTheme();
  const [requestId, setRequestId] = useState<string>('');
  const dispatch = useAppDispatch();
  const result = useAppSelector(selectParticipantProjectUpdateRequest(requestId));
  const snackbar = useSnackbar();
  const { projectId } = useParticipantProjectData();

  const [record] = useState<ParticipantProjectSpecies>(projectSpecies);

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
    } else if (result?.status === 'success') {
      reload();
      onClose();
    }
  }, [result, snackbar]);

  const save = () => {
    const request = dispatch(
      requestUpdateParticipantProjectSpecies({
        projectId,
        participantProjectSpeciesId: record.id,
        participantProjectSpecies: record,
      })
    );
    setRequestId(request.requestId);
  };

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.SPECIES_USAGE}
      size='large'
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button id='save' onClick={save} label={strings.SAVE} key='button-2' />,
      ]}
    >
      <Grid container textAlign={'left'}>
        <Grid item xs={12}>
          <Typography sx={{ fontSize: '14px', color: theme.palette.TwClrBaseGray600, marginBottom: 1.5 }}>
            {strings.SCIENTIFIC_NAME}
          </Typography>
          <Link
            fontSize='16px'
            to={APP_PATHS.SPECIES_DETAILS.replace(':speciesId', projectSpecies.speciesId.toString())}
          >
            {projectSpecies.speciesScientificName}
          </Link>
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <TextField id='rationale' label={strings.RATIONALE} type='textarea' value={record?.rationale} />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
