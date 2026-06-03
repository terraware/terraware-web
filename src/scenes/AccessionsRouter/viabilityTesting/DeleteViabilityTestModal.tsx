import React, { type JSX } from 'react';
import { useParams } from 'react-router';

import { Typography } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import useAccession from 'src/hooks/useAccession';
import { useDeleteViabilityTestMutation } from 'src/queries/generated/accessionsV2';
import strings from 'src/strings';
import { ViabilityTest } from 'src/types/Accession';
import useSnackbar from 'src/utils/useSnackbar';

export interface DeleteViabilityTestModalProps {
  open: boolean;
  viabilityTest: ViabilityTest;
  onCancel: () => void;
  onDone: () => void;
}

export default function DeleteViabilityTestModal(props: DeleteViabilityTestModalProps): JSX.Element | null {
  const { onCancel, open, viabilityTest, onDone } = props;
  const { accessionId } = useParams<{ accessionId: string }>();
  const { accession } = useAccession(Number(accessionId));
  const snackbar = useSnackbar();
  const [deleteViabilityTest] = useDeleteViabilityTestMutation();

  if (!accession) {
    return null;
  }

  const deleteHandler = async () => {
    try {
      await deleteViabilityTest({ accessionId: accession.id, viabilityTestId: viabilityTest.id }).unwrap();
      onDone();
    } catch {
      snackbar.toastError();
    }
  };

  return (
    <DialogBox
      onClose={onCancel}
      open={open}
      title={strings.DELETE_VIABILITY_TEST}
      size='medium'
      middleButtons={[
        <Button
          id='cancelDeleteViabilityTest'
          label={strings.CANCEL}
          type='passive'
          onClick={onCancel}
          priority='secondary'
          key='button-1'
        />,
        <Button
          id='deleteViabilityTest'
          onClick={() => void deleteHandler()}
          type='destructive'
          label={strings.DELETE}
          key='button-2'
        />,
      ]}
      message={strings.formatString(strings.DELETE_VIABILITY_TEST_MESSAGE, viabilityTest.id.toString())}
      skrim={true}
    >
      <Typography sx={{ paddingTop: 3 }}>{strings.ARE_YOU_SURE}</Typography>
    </DialogBox>
  );
}
