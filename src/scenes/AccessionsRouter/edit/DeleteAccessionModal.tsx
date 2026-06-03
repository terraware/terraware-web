import React, { type JSX } from 'react';
import { useParams } from 'react-router';

import { Typography } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import useAccession from 'src/hooks/useAccession';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useDeleteApiV1SeedbankAccessionsByIdMutation } from 'src/queries/generated/accessionsV1';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

export interface DeleteAccessionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DeleteAccessionModal(props: DeleteAccessionModalProps): JSX.Element | null {
  const { onClose, open } = props;
  const { accessionId } = useParams<{ accessionId: string }>();
  const { accession } = useAccession(Number(accessionId));
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const [deleteAccession] = useDeleteApiV1SeedbankAccessionsByIdMutation();

  if (!accession) {
    return null;
  }

  const deleteHandler = async () => {
    try {
      await deleteAccession(accession.id).unwrap();
      navigate(APP_PATHS.ACCESSIONS);
    } catch {
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
