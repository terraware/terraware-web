import { Box, Typography } from '@mui/material';
import { PlantingSite } from 'src/types/Tracking';

export type PlantingSiteDetailsProps = {
  onChange: (id: string, value: unknown) => void;
  site: PlantingSite;
};

export default function PlantingSiteDetails(props: PlantingSiteDetailsProps): JSX.Element {
  return (
    <Box display='flex' margin='auto auto'>
      <Typography fontSize='24px' fontWeight='bold'>
        Site Creation Flow WIP - Site Details
      </Typography>
    </Box>
  );
}
