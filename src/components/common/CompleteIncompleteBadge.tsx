import React, { type JSX } from 'react';

import { useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';

import { VariableStatusType } from 'src/types/documentProducer/Variable';

type CompleteIncompleteBadgeProps = {
  status: VariableStatusType;
};
export default function CompleteIncompleteBadge({ status }: CompleteIncompleteBadgeProps): JSX.Element {
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
