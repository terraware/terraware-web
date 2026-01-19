import React, { type JSX, useState } from 'react';

import { Box } from '@mui/material';
import { Message } from '@terraware/web-components';

type MapBannerProps = {
  message: string;
};

export default function MapBanner({ message }: MapBannerProps): JSX.Element | null {
  const [showMessage, setShowMessage] = useState(true);

  if (showMessage) {
    return (
      <Box
        sx={{
          position: 'absolute',
          zIndex: 2,
          top: '16px',
          left: '50%',
          transform: 'translate(-50%, 0)',
        }}
      >
        <Message
          type='page'
          title={''}
          priority={'info'}
          body={message}
          showCloseButton={true}
          onClose={() => setShowMessage(false)}
        />
      </Box>
    );
  } else {
    return null;
  }
}
