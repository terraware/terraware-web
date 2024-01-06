import { useMemo } from 'react';
import { Box } from '@mui/material';
import { FeatureCollection } from 'geojson';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import EditableMap, { ReadOnlyBoundary } from 'src/components/Map/EditableMapV2';
import { toFeature } from 'src/components/Map/utils';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import StepTitleDescription from './StepTitleDescription';

export type PlantingSiteExclusionsProps = {
  boundary?: FeatureCollection;
  setBoundary: (boundary?: FeatureCollection) => void;
  site: PlantingSite;
};

export default function PlantingSiteExclusions({
  boundary,
  setBoundary,
  site,
}: PlantingSiteExclusionsProps): JSX.Element {
  const getRenderAttributes = useRenderAttributes();

  const readOnlyBoundary = useMemo<ReadOnlyBoundary[] | undefined>(() => {
    if (!site.boundary) {
      return undefined;
    }

    return [
      {
        featureCollection: { type: 'FeatureCollection', features: [toFeature(site.boundary!, {}, site.id)] },
        id: 'site',
        renderProperties: getRenderAttributes('site'),
      },
    ];
  }, [getRenderAttributes, site.boundary, site.id]);

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
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
      <EditableMap
        boundary={boundary}
        editMultiplePolygons
        onBoundaryChanged={setBoundary}
        readOnlyBoundaries={readOnlyBoundary}
      />
    </Box>
  );
}
