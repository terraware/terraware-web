import React from 'react';

import { useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';

type CompleteIncompleteBatchProps = {
  status: 'Complete' | 'Incomplete';
};
export default function CompleteIncompleteBatch({ status }: CompleteIncompleteBatchProps): JSX.Element {
  const theme = useTheme();

  return status === 'Complete' ? (
    <Badge
      label={status}
      labelColor={theme.palette.TwClrTxtSuccess}
      borderColor={theme.palette.TwClrBrdrSuccess}
      backgroundColor={theme.palette.TwClrBgSuccessTertiary}
    />
  ) : (
    <Badge label={status} />
  );
}
