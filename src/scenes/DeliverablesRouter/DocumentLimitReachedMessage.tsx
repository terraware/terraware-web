import React from 'react';

import { Box, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';

import { MAX_FILES_LIMIT } from './DeliverableView';

const DocumentLimitReachedMessage = (): JSX.Element => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  return (
    <>
      {activeLocale && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={strings.formatString(strings.DOCUMENT_LIMIT_REACHED_MESSAGE, MAX_FILES_LIMIT) as string}
            priority='warning'
            title={strings.DOCUMENT_LIMIT_REACHED}
            type='page'
          />
        </Box>
      )}
    </>
  );
};

export default DocumentLimitReachedMessage;
