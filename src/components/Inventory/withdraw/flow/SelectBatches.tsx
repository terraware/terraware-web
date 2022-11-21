import React, { useEffect } from 'react';
import { Typography } from '@mui/material';
import TfMain from 'src/components/common/TfMain';
import { ServerOrganization } from 'src/types/Organization';

type SelectBatchesProps = {
  organization: ServerOrganization;
  onNext: () => void;
  validate: boolean;
};
export default function SelectBatches(props: SelectBatchesProps): JSX.Element {
  const { onNext, validate } = props;

  useEffect(() => {
    if (validate) {
      onNext();
    }
  }, [validate, onNext]);

  return (
    <TfMain>
      <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 'bold' }}>
        BATCHES
      </Typography>
    </TfMain>
  );
}
