import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { FeatureCollection } from 'geojson';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import EditableMap, { RenderableReadOnlyBoundary } from 'src/components/Map/EditableMapV2';
import { toFeature, toMultiPolygonArray } from 'src/components/Map/utils';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import useMapIcons from 'src/components/Map/useMapIcons';
import StepTitleDescription, { Description } from './StepTitleDescription';

export type ExclusionsProps = {
  onChange: (id: string, value: unknown) => void;
  onValidate?: (hasErrors: boolean, isOptionalStepCompleted?: boolean) => void;
  site: PlantingSite;
};

export default function Exclusions({ onChange, onValidate, site }: ExclusionsProps): JSX.Element {
  const [exclusions, setExclusions] = useState<FeatureCollection | undefined>();
  const mapIcons = useMapIcons();
  const getRenderAttributes = useRenderAttributes();

  useEffect(() => {
    if (site.exclusion) {
      setExclusions({
        type: 'FeatureCollection',
        features: [toFeature(site.exclusion!, {}, 0)],
      });
    }
  }, [site.exclusion]);

  useEffect(() => {
    if (onValidate) {
      if (exclusions) {
        onChange('exclusion', {
          type: 'MultiPolygon',
          coordinates: toMultiPolygonArray(exclusions)!.flatMap((poly) => poly.coordinates),
        });
      }
      onValidate(false, !!exclusions);
    }
  }, [onChange, onValidate, exclusions]);

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
        handlePrefix: (prefix: string) => strings.formatString(prefix, mapIcons.polygon) as JSX.Element[],
        handleSuffix: (suffix: string) => strings.formatString(suffix, '', strings.SAVE) as string,
      },
      { text: strings.SITE_EXCLUSION_AREAS_DESCRIPTION_2 },
    ],
    [mapIcons]
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
