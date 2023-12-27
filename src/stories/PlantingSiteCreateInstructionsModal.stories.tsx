import { useState } from 'react';
import { Story } from '@storybook/react';
import { Box } from '@mui/material';
import BoundaryInstructionsModal, {
  BoundaryInstructionsModalProps,
} from 'src/components/PlantingSites/createSite/BoundaryInstructionsModal';

const InstructionsModalTemplate: Story<BoundaryInstructionsModalProps> = (args) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isDontShowAgain, setIsDontShowAgain] = useState<boolean>(false);

  const onClose = (dontShowAgain?: boolean) => {
    setIsDontShowAgain(dontShowAgain ?? false);
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
      <BoundaryInstructionsModal open={isOpen} onClose={onClose} />
    </>
  );
};

export default {
  title: 'PlantingSiteCreateInstructionsModal',
  component: BoundaryInstructionsModal,
};

export const Default = InstructionsModalTemplate.bind({});

Default.args = {};
