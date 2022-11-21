import React from 'react';
import { Typography } from '@mui/material';
import { ServerOrganization } from 'src/types/Organization';
import FormBottomBar from 'src/components/common/FormBottomBar';

type SelectBatchesWithdrawnQuantityProps = {
  organization: ServerOrganization;
  onNext: () => void;
  onCancel: () => void;
  saveText: string;
};
export default function SelectBatches(props: SelectBatchesWithdrawnQuantityProps): JSX.Element {
  const { onNext, onCancel, saveText } = props;

  return (
    <>
      <Typography margin='auto'>Select Batches Withdrawn Quantity</Typography>
      <FormBottomBar onCancel={onCancel} onSave={onNext} saveButtonText={saveText} />
    </>
  );
}
