import { useState } from 'react';
import TfMain from 'src/components/common/TfMain';
import { Box, Container, Typography } from '@mui/material';
import InstructionsModal from './InstructionsModal';

type PlantingSiteDetailedCreateProps = {
  reloadPlantingSites: () => void;
};

export default function PlantingSiteDetailedCreate(props: PlantingSiteDetailedCreateProps): JSX.Element {
  // this is a placeholder for the instructions modal trigger
  const [showModal, setShowModal] = useState<boolean>(true);
  const onClose = () => {
    setShowModal(false);
  };

  return (
    <TfMain>
      <InstructionsModal open={showModal} onClose={onClose} />
      <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, paddingRight: 0 }}>
        <Box display='flex' margin='auto auto'>
          <Typography fontSize='24px' fontWeight='bold'>
            Detailed Site Creation Flow WIP
          </Typography>
        </Box>
      </Container>
    </TfMain>
  );
}
