import { useState } from 'react';

import { Box } from '@mui/material';
import { Story } from '@storybook/react';

import VideoDialog, { VideoDialogProps } from 'src/components/common/VideoDialog';

const VideoDialogTemplate: Story<VideoDialogProps> = (args) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isDontShowAgain, setIsDontShowAgain] = useState<boolean>(false);

  const onClose = (dontShowAgain?: boolean) => {
    setIsDontShowAgain(dontShowAgain ?? false);
    setIsOpen(false);
  };

  return (
    <>
      {!isOpen && (
        <Box onClick={() => setIsOpen(true)} sx={{ cursor: 'pointer' }}>
          {isDontShowAgain ? 'Will not show again' : 'Click to open!'}
        </Box>
      )}
      <VideoDialog
        {...args}
        open={isOpen}
        onClose={() => onClose(false)}
        onDontShowAgain={isDontShowAgain ? undefined : () => onClose(true)}
      />
    </>
  );
};

export default {
  title: 'VideoDialog',
  component: VideoDialog,
};

export const Default = VideoDialogTemplate.bind({});

Default.args = {
  description: 'Lorem ipsum...',
  link: 'https://www.youtube.com/embed/kfPlGeiFebw',
  title: 'Video Dialog',
};
