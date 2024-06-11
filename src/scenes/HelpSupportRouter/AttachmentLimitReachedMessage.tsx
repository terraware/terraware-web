import React from 'react';

import { Box, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';

type AttachmentLimitReachedMessageProps = {
  maxFiles: number;
};

const AttachmentLimitReachedMessage = ({ maxFiles }: AttachmentLimitReachedMessageProps): JSX.Element => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  return (
    <>
      {activeLocale && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={strings.formatString(strings.ATTACHMENT_LIMIT_REACHED_MESSAGE, maxFiles) as string}
            priority='warning'
            title={strings.ATTACHMENT_LIMIT_REACHED}
            type='page'
          />
        </Box>
      )}
    </>
  );
};

export default AttachmentLimitReachedMessage;
