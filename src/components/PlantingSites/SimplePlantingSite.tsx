import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import SimplePlantingSiteMap from 'src/components/PlantsV2/components/SimplePlantingSiteMap';

type SimplePlantingSiteProps = {
  plantingSite: PlantingSite;
};

export default function SimplePlantingSite({ plantingSite }: SimplePlantingSiteProps): JSX.Element {
  const theme = useTheme();

  return (
    <>
      <Box padding={theme.spacing(3, 0, 0, 0)}>
        <Typography fontSize='16px' fontWeight={600} margin={theme.spacing(3, 0)}>
          {strings.SITE_MAP}
        </Typography>
      </Box>
      {plantingSite.boundary && <SimplePlantingSiteMap plantingSiteId={plantingSite.id} />}
    </>
  );
}
