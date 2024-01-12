import { useMemo } from 'react';
import { Box } from '@mui/material';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import MapIcon from 'src/components/Map/MapIcon';
import StepTitleDescription, { Description } from './StepTitleDescription';

export type SubzonesProps = {
  onChange: (id: string, value: unknown) => void;
  site: PlantingSite;
};

export default function Subzones(props: SubzonesProps): JSX.Element {
  const description = useMemo<Description[]>(
    () => [
      { text: strings.SITE_SUBZONE_BOUNDARIES_DESCRIPTION_0 },
      {
        text: strings.SITE_SUBZONE_BOUNDARIES_DESCRIPTION_1,
        hasTutorial: true,
        handlePrefix: (prefix: string) => strings.formatString(prefix, <MapIcon icon='slice' />) as JSX.Element[],
      },
    ],
    []
  );

  return (
    <Box display='flex' flexDirection='column'>
      <StepTitleDescription
        description={description}
        title={strings.SITE_SUBZONE_BOUNDARIES}
        tutorialDescription={strings.ADDING_SUBZONE_BOUNDARIES_INSTRUCTIONS_DESCRIPTION}
        tutorialDocLinkKey='planting_site_create_subzone_boundary_instructions_video'
        tutorialTitle={strings.ADDING_SUBZONE_BOUNDARIES}
      />
    </Box>
  );
}
