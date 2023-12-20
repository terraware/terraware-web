import { useState } from 'react';
import { Story } from '@storybook/react';
import { Box } from '@mui/material';
import InstructionsModal, { InstructionsModalProps } from 'src/components/PlantingSites/createSite/InstructionsModal';

const InstructionsModalTemplate: Story<InstructionsModalProps> = (args) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isDontShowAgain, setIsDontShowAgain] = useState<boolean>(false);

  const onClose = (dontShowAgain: boolean) => {
    setIsDontShowAgain(dontShowAgain);
    setIsOpen(false);
  };

  return (
    <>
      {!isOpen && (
        <Box
          onClick={() => setIsOpen(!isDontShowAgain && true)}
          sx={{ cursor: isDontShowAgain ? 'default' : 'pointer' }}
        >
          {isDontShowAgain ? 'Will not show again' : 'Click to open!'}
        </Box>
      )}
      <InstructionsModal open={isOpen} onClose={onClose} />
    </>
  );
};

export default {
  title: 'PlantingSiteCreateInstructionsModal',
  component: InstructionsModal,
};

export const Default = InstructionsModalTemplate.bind({});

Default.args = {};
