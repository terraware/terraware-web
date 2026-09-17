import React, { type JSX } from 'react';

import { useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';

import strings from 'src/strings';

export default function UnsavedChangesBadge(): JSX.Element {
  const theme = useTheme();

  return (
    <Badge
      label={strings.UNSAVED_CHANGES}
      backgroundColor={theme.palette.TwClrBgWarningTertiary}
      borderColor={theme.palette.TwClrBrdrWarning}
      labelColor={theme.palette.TwClrTxtWarning}
    />
  );
}
