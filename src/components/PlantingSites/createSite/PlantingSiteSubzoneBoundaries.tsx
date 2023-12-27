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
          { text: strings.SITE_SUBZONE_BOUNDARIES_DESCRIPTION_0 },
          { text: strings.SITE_SUBZONE_BOUNDARIES_DESCRIPTION_1, hasTutorial: true },
        ]}
        title={strings.SITE_SUBZONE_BOUNDARIES}
        tutorialDescription={strings.ADDING_SUBZONE_BOUNDARIES_INSTRUCTIONS_DESCRIPTION}
        tutorialDocLinkKey='planting_site_create_subzone_boundary_instructions_video'
        tutorialTitle={strings.ADDING_SUBZONE_BOUNDARIES}
      />
    </Box>
  );
}
