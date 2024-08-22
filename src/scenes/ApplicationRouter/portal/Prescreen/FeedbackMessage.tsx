import React from 'react';

import { Box, Typography } from '@mui/material';
import { Message } from '@terraware/web-components';

import strings from 'src/strings';

type FeedbackMessageProps = {
  feedback?: string;
};

const FeedbackMessage = ({ feedback }: FeedbackMessageProps) => {
  return (
    <Box sx={{ marginBottom: '24px', width: '100%' }}>
      <Message
        type='page'
        priority='critical'
        title={strings.PRESCREEN_FAILED}
        body={
          <>
            <Typography sx={{ margin: 0 }}>{strings.APPLICATION_PRESCREEN_FAILURE_SUBTITLE}</Typography>
            {feedback && <Box dangerouslySetInnerHTML={{ __html: feedback || '' }} />}
          </>
        }
      />
    </Box>
  );
};

export default FeedbackMessage;
