import React, { type JSX } from 'react';

import { Typography } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import AccessionService from 'src/services/AccessionService';
import strings from 'src/strings';
import { Accession } from 'src/types/Accession';
import useSnackbar from 'src/utils/useSnackbar';

export interface DeleteAccessionModalProps {
  open: boolean;
  accession: Accession;
  onClose: () => void;
}

export default function DeleteAccessionModal(props: DeleteAccessionModalProps): JSX.Element {
  const { onClose, open, accession } = props;
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();

  const deleteHandler = async () => {
    const response = await AccessionService.deleteAccession(accession.id);
    if (response.requestSucceeded) {
      navigate(APP_PATHS.ACCESSIONS);
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
        <Button
          id='cancelDeleteAccession'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button
          id='saveDeleteAccession'
          onClick={() => void deleteHandler()}
          type='destructive'
          label={strings.DELETE}
          key='button-2'
        />,
      ]}
      message={strings.formatString(strings.DELETE_ACCESSION_MESSAGE, accession.accessionNumber.toString())}
      skrim={true}
    >
      <Typography sx={{ paddingTop: 3 }}>{strings.ARE_YOU_SURE}</Typography>
    </DialogBox>
  );
}
