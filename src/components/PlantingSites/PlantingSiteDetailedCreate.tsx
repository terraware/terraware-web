import TfMain from 'src/components/common/TfMain';
import { Box, Container, Typography } from '@mui/material';

type PlantingSiteDetailedCreateProps = {
  reloadPlantingSites: () => void;
};

export default function PlantingSiteDetailedCreate(props: PlantingSiteDetailedCreateProps): JSX.Element {
  return (
    <TfMain>
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
