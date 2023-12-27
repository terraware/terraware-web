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
          { text: strings.SITE_BOUNDARY_DESCRIPTION_0 },
          { text: strings.SITE_BOUNDARY_DESCRIPTION_1 },
          { text: strings.SITE_BOUNDARY_DESCRIPTION_2, hasTutorial: true },
        ]}
        dontShowAgainPreferenceName='dont-show-site-boundary-instructions'
        title={strings.SITE_BOUNDARY}
        tutorialDescription={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_DESCRIPTION}
        tutorialDocLinkKey='planting_site_create_boundary_instructions_video'
        tutorialTitle={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_TITLE}
      />
    </Box>
  );
}
