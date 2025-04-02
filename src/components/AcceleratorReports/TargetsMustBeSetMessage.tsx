import React from 'react';

import { Box, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';

const TargetsMustBeSetMessage = (): JSX.Element | null => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  if (!activeLocale) {
    return null;
  }

  return (
    <Box marginBottom={theme.spacing(4)}>
      <Message
        body={strings.GO_TO_REPORTS_TARGETS_FOR_METRIC}
        priority='warning'
        title={strings.TARGETS_MUST_BE_SET_TO_SUBMIT_REPORT}
        type='page'
      />
    </Box>
  );
};

export default TargetsMustBeSetMessage;
