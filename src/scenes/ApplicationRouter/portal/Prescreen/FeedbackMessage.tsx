import React from 'react';

import { Box, Typography } from '@mui/material';
import { Message } from '@terraware/web-components';

import strings from 'src/strings';

type FeedbackMessageProps = {
  feedback?: string;
};

const FeedbackMessage = ({ feedback }: FeedbackMessageProps) => {
  return (
    <Message
      type='page'
      priority='critical'
      title={strings.PRESCREEN_FAILED}
      body={
        <>
          <Typography sx={{ margin: 0 }}>{strings.APPLICATION_PRESCREEN_FAILURE_SUBTITLE}</Typography>
          {feedback && <Box dangerouslySetInnerHTML={{ __html: feedback }} justifyContent={'center'} />}
        </>
      }
    />
  );
};

export default FeedbackMessage;
