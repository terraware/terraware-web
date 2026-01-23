import React, { type JSX } from 'react';

import { Typography } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { AccessionService } from 'src/services';
import strings from 'src/strings';
import { Accession } from 'src/types/Accession';
import { ViabilityTest } from 'src/types/Accession';
import useSnackbar from 'src/utils/useSnackbar';

export interface DeleteViabilityTestModalProps {
  open: boolean;
  accession: Accession;
  viabilityTest: ViabilityTest;
  onCancel: () => void;
  onDone: () => void;
}

export default function DeleteViabilityTestModal(props: DeleteViabilityTestModalProps): JSX.Element {
  const { onCancel, open, accession, viabilityTest, onDone } = props;
  const snackbar = useSnackbar();

  const deleteHandler = async () => {
    const response = await AccessionService.deleteViabilityTest(accession.id, viabilityTest.id);
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
