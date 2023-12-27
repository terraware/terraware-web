import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { PlantingSite } from 'src/types/Tracking';
import InstructionsModal from './InstructionsModal';

export type PlantingSiteBoundaryProps = {
  onChange: (id: string, value: unknown) => void;
  site: PlantingSite;
};

export default function PlantingSiteBoundary(props: PlantingSiteBoundaryProps): JSX.Element {
  // this is a placeholder for the instructions modal trigger
  const [showModal, setShowModal] = useState<boolean>(true);

  const onClose = () => {
    setShowModal(false);
  };

  return (
    <Box display='flex' margin='auto auto'>
      <InstructionsModal open={showModal} onClose={onClose} />
      <Typography fontSize='24px' fontWeight='bold'>
        Site Creation Flow WIP - Site Boundary
      </Typography>
    </Box>
  );
}
