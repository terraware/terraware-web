import { Box } from '@mui/material';
import EmptyStatePage from '../emptyStatePages/EmptyStatePage';

export default function PlantingSitesList(): JSX.Element {
  return (
    <Box>
      <EmptyStatePage pageName={'PlantingSites'} />
    </Box>
  );
}
