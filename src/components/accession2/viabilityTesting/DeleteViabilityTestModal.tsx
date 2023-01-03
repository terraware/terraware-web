import React from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { Typography } from '@mui/material';
import { Accession2 } from 'src/api/accessions2/accession';
import { ViabilityTest } from 'src/api/types/accessions';
import { deleteViabilityTest } from 'src/api/accessions2/viabilityTest';
import useSnackbar from 'src/utils/useSnackbar';

export interface DeleteViabilityTestModalProps {
  open: boolean;
  accession: Accession2;
  viabilityTest: ViabilityTest;
  onCancel: () => void;
  onDone: () => void;
}

export default function DeleteViabilityTestModal(props: DeleteViabilityTestModalProps): JSX.Element {
  const { onCancel, open, accession, viabilityTest, onDone } = props;
  const snackbar = useSnackbar();

  const deleteHandler = async () => {
    const response = await deleteViabilityTest(accession.id, viabilityTest.id);
    if (response.requestSucceeded) {
      onDone();
    } else {
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
          onClick={deleteHandler}
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
