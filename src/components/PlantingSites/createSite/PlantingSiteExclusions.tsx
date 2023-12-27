import { Box, Typography } from '@mui/material';
import { PlantingSite } from 'src/types/Tracking';

export type PlantingSiteExclusionsProps = {
  onChange: (id: string, value: unknown) => void;
  site: PlantingSite;
};

export default function PlantingSiteExclusions(props: PlantingSiteExclusionsProps): JSX.Element {
  return (
    <Box display='flex' margin='auto auto'>
      <Typography fontSize='24px' fontWeight='bold'>
        Site Creation Flow WIP - Site Exclusions
      </Typography>
    </Box>
  );
}
