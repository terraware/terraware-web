import { Box } from '@mui/material';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import StepTitleDescription from './StepTitleDescription';

export type PlantingSiteBoundaryProps = {
  onChange: (id: string, value: unknown) => void;
  site: PlantingSite;
};

export default function PlantingSiteBoundary(props: PlantingSiteBoundaryProps): JSX.Element {
  return (
    <Box display='flex' flexDirection='column'>
      <StepTitleDescription
        description={[
          { text: strings.SITE_ZONE_BOUNDARIES_DESCRIPTION_0 },
          { text: strings.SITE_ZONE_BOUNDARIES_DESCRIPTION_1, hasTutorial: true },
        ]}
        dontShowAgainPreferenceName='dont-show-site-zone-boundaries-instructions'
        title={strings.SITE_ZONE_BOUNDARIES}
        tutorialDescription={strings.ADDING_ZONE_BOUNDARIES_INSTRUCTIONS_DESCRIPTION}
        tutorialDocLinkKey='planting_site_create_zone_boundary_instructions_video'
        tutorialTitle={strings.ADDING_ZONE_BOUNDARIES}
      />
    </Box>
  );
}
