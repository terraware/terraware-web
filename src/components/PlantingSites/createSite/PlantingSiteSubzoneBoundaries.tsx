import { Box, Typography } from '@mui/material';
import { PlantingSite } from 'src/types/Tracking';

export type PlantingSiteSubzoneBoundariesProps = {
  onChange: (id: string, value: unknown) => void;
  site: PlantingSite;
};

export default function PlantingSiteSubzoneBoundaries(props: PlantingSiteSubzoneBoundariesProps): JSX.Element {
  return (
    <Box display='flex' margin='auto auto'>
      <Typography fontSize='24px' fontWeight='bold'>
        Site Creation Flow WIP - Site SubzoneBoundaries
      </Typography>
    </Box>
  );
}
