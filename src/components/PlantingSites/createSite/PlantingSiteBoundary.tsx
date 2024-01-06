import { Box } from '@mui/material';
import { FeatureCollection } from 'geojson';
import strings from 'src/strings';
import EditableMap from 'src/components/Map/EditableMapV2';
import StepTitleDescription from './StepTitleDescription';

export type PlantingSiteBoundaryProps = {
  boundary?: FeatureCollection;
  setBoundary: (boundary?: FeatureCollection) => void;
};

export default function PlantingSiteBoundary({ boundary, setBoundary }: PlantingSiteBoundaryProps): JSX.Element {
  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
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
      <EditableMap onBoundaryChanged={setBoundary} boundary={boundary} />
    </Box>
  );
}
