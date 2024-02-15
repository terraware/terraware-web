import { useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import { FeatureCollection } from 'geojson';
import strings from 'src/strings';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import useUndoRedoState from 'src/hooks/useUndoRedoState';
import { RenderableReadOnlyBoundary } from 'src/types/Map';
import { useLocalization } from 'src/providers';
import EditableMap from 'src/components/Map/EditableMapV2';
import { toFeature, unionMultiPolygons } from 'src/components/Map/utils';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import MapIcon from 'src/components/Map/MapIcon';
import StepTitleDescription, { Description } from './StepTitleDescription';

export type ExclusionsProps = {
  onChange: (id: string, value: unknown) => void;
  onValidate?: (hasErrors: boolean, isOptionalStepCompleted?: boolean) => void;
  site: DraftPlantingSite;
};

export default function Exclusions({ onChange, onValidate, site }: ExclusionsProps): JSX.Element {
  const [exclusions, setExclusions, undo, redo] = useUndoRedoState<FeatureCollection | undefined>();
  const getRenderAttributes = useRenderAttributes();
  const { activeLocale } = useLocalization();

  useEffect(() => {
    if (site.exclusion) {
      setExclusions({
        type: 'FeatureCollection',
        features: [toFeature(site.exclusion!, {}, 0)],
      });
    }
  }, [setExclusions, site.exclusion]);

  useEffect(() => {
    if (onValidate) {
      const boundary = exclusions ? unionMultiPolygons(exclusions) : null;
      if (boundary) {
        onChange('exclusion', boundary);
      }
      onValidate(false, !!boundary);
    }
  }, [onChange, onValidate, exclusions]);

  const readOnlyBoundary = useMemo<RenderableReadOnlyBoundary[] | undefined>(() => {
    if (!site.boundary) {
      return undefined;
    }

    return [
      {
        data: { type: 'FeatureCollection', features: [toFeature(site.boundary!, {}, site.id)] },
        id: 'site',
        renderProperties: getRenderAttributes('site'),
      },
    ];
  }, [getRenderAttributes, site.boundary, site.id]);

  const description = useMemo<Description[]>(
    () =>
      activeLocale
        ? [
            { text: strings.SITE_EXCLUSION_AREAS_DESCRIPTION_0 },
            {
              text: strings.SITE_EXCLUSION_AREAS_DESCRIPTION_1,
              hasTutorial: true,
              handlePrefix: (prefix: string) =>
                strings.formatString(prefix, <MapIcon icon='polygon' />) as JSX.Element[],
              handleSuffix: (suffix: string) => strings.formatString(suffix, '', strings.SAVE) as string,
            },
            { text: strings.SITE_EXCLUSION_AREAS_DESCRIPTION_2 },
          ]
        : [],
    [activeLocale]
  );

  const tutorialDescription = useMemo(() => {
    if (!activeLocale) {
      return;
    }
    return strings.formatString(
      strings.PLANTING_SITE_CREATE_EXCLUSIONS_INSTRUCTIONS_DESCRIPTION,
      <MapIcon centerAligned icon='polygon' />
    ) as JSX.Element[];
  }, [activeLocale]);

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <StepTitleDescription
        description={description}
        title={strings.SITE_EXCLUSION_AREAS_OPTIONAL}
        tutorialDescription={tutorialDescription}
        tutorialDocLinkKey='planting_site_create_exclusions_boundary_instructions_video'
        tutorialTitle={strings.PLANTING_SITE_CREATE_EXCLUSIONS_INSTRUCTIONS_TITLE}
      />
      <EditableMap
        editableBoundary={exclusions}
        onEditableBoundaryChanged={setExclusions}
        onRedo={redo}
        onUndo={undo}
        readOnlyBoundary={readOnlyBoundary}
      />
    </Box>
  );
}
