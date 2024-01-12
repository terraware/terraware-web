import { useMemo } from 'react';
import { Box } from '@mui/material';
import { FeatureCollection } from 'geojson';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import EditableMap, { RenderableReadOnlyBoundary } from 'src/components/Map/EditableMapV2';
import { toFeature } from 'src/components/Map/utils';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import MapIcon from 'src/components/Map/MapIcon';
import StepTitleDescription, { Description } from './StepTitleDescription';

export type ExclusionsProps = {
  exclusions?: FeatureCollection;
  setExclusions: (exclusions?: FeatureCollection) => void;
  site: PlantingSite;
};

export default function Exclusions({ exclusions, setExclusions, site }: ExclusionsProps): JSX.Element {
  const getRenderAttributes = useRenderAttributes();

  const readOnlyBoundary = useMemo<RenderableReadOnlyBoundary[] | undefined>(() => {
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

  const description = useMemo<Description[]>(
    () => [
      { text: strings.SITE_EXCLUSION_AREAS_DESCRIPTION_0 },
      {
        text: strings.SITE_EXCLUSION_AREAS_DESCRIPTION_1,
        hasTutorial: true,
        handlePrefix: (prefix: string) => strings.formatString(prefix, <MapIcon icon='polygon' />) as JSX.Element[],
        handleSuffix: (suffix: string) => strings.formatString(suffix, '', strings.SAVE) as string,
      },
      { text: strings.SITE_EXCLUSION_AREAS_DESCRIPTION_2 },
    ],
    []
  );

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <StepTitleDescription
        description={description}
        title={strings.SITE_EXCLUSION_AREAS_OPTIONAL}
        tutorialDescription={strings.PLANTING_SITE_CREATE_EXCLUSIONS_INSTRUCTIONS_DESCRIPTION}
        tutorialDocLinkKey='planting_site_create_exclusions_boundary_instructions_video'
        tutorialTitle={strings.PLANTING_SITE_CREATE_EXCLUSIONS_INSTRUCTIONS_TITLE}
      />
      <EditableMap
        allowEditMultiplePolygons
        editableBoundary={exclusions}
        onEditableBoundaryChanged={setExclusions}
        readOnlyBoundary={readOnlyBoundary}
      />
    </Box>
  );
}
