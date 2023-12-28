import { Box } from '@mui/material';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import StepTitleDescription from './StepTitleDescription';

export type PlantingSiteExclusionsProps = {
  onChange: (id: string, value: unknown) => void;
  site: PlantingSite;
};

export default function PlantingSiteExclusions(props: PlantingSiteExclusionsProps): JSX.Element {
  return (
    <Box display='flex' flexDirection='column'>
      <StepTitleDescription
        description={[
          { text: strings.SITE_EXCLUSION_AREAS_DESCRIPTION_0 },
          { text: strings.SITE_EXCLUSION_AREAS_DESCRIPTION_1, hasTutorial: true },
          { text: strings.SITE_EXCLUSION_AREAS_DESCRIPTION_2 },
        ]}
        title={strings.SITE_EXCLUSION_AREAS_OPTIONAL}
        tutorialDescription={strings.PLANTING_SITE_CREATE_EXCLUSIONS_INSTRUCTIONS_DESCRIPTION}
        tutorialDocLinkKey='planting_site_create_exclusions_boundary_instructions_video'
        tutorialTitle={strings.PLANTING_SITE_CREATE_EXCLUSIONS_INSTRUCTIONS_TITLE}
      />
    </Box>
  );
}
