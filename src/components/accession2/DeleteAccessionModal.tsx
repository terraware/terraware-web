import React from 'react';
import strings from 'src/strings';
import Button from '../common/button/Button';
import DialogBox from '../common/DialogBox/DialogBox';
import { Typography } from '@mui/material';
import { Accession2 } from 'src/api/accessions2/accession';
import { deleteAccession } from 'src/api/seeds/accession';
import { APP_PATHS } from 'src/constants';
import { useHistory } from 'react-router-dom';
import useSnackbar from 'src/utils/useSnackbar';

export interface DelteAccessionDialogProps {
  open: boolean;
  accession: Accession2;
  onClose: () => void;
}

export default function DelteAccessionModal(props: DelteAccessionDialogProps): JSX.Element {
  const { onClose, open, accession } = props;
  const history = useHistory();
  const snackbar = useSnackbar();

  const deleteHandler = async () => {
    const response = await deleteAccession(accession.id);
    if (response.requestSucceeded) {
      history.push(APP_PATHS.ACCESSIONS2);
    } else {
      snackbar.toastError();
    }
  };

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.DELETE_ACCESSION}
      size='medium'
      middleButtons={[
        <Button label={strings.CANCEL} type='passive' onClick={onClose} priority='secondary' key='button-1' />,
        <Button onClick={deleteHandler} type='destructive' label={strings.DELETE} key='button-2' />,
      ]}
      message={strings.formatString(strings.DELETE_ACCESSION_MESSAGE, accession.accessionNumber.toString())}
    >
      <Typography sx={{ paddingTop: 3 }}>{strings.ARE_YOU_SURE}</Typography>
    </DialogBox>
  );
}
