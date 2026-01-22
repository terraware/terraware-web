import React, { type JSX, useEffect, useMemo } from 'react';

import { Box } from '@mui/material';
import { Feature, FeatureCollection } from 'geojson';

import EditableMap from 'src/components/Map/EditableMapV2';
import MapIcon from 'src/components/Map/MapIcon';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import { toFeature, unionMultiPolygons } from 'src/components/Map/utils';
import useUndoRedoState from 'src/hooks/useUndoRedoState';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { RenderableReadOnlyBoundary } from 'src/types/Map';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import useSnackbar from 'src/utils/useSnackbar';

import StepTitleDescription, { Description } from './StepTitleDescription';
import { OnValidate } from './types';
import { findErrors } from './utils';

export type ExclusionsProps = {
  onValidate?: OnValidate;
  site: DraftPlantingSite;
};

const featureSiteExclusions = (site: DraftPlantingSite): FeatureCollection | undefined => {
  if (site.exclusion) {
    return {
      type: 'FeatureCollection',
      features: [toFeature(site.exclusion, {}, 0)],
    };
  } else {
    return undefined;
  }
};

// undo redo stack to capture exclusions and errors
type Stack = {
  errorAnnotations?: Feature[];
  exclusions?: FeatureCollection;
};

export default function Exclusions({ onValidate, site }: ExclusionsProps): JSX.Element {
  const [exclusionsData, setExclusionsData, undo, redo] = useUndoRedoState<Stack>({
    exclusions: featureSiteExclusions(site),
  });
  const getRenderAttributes = useRenderAttributes();
  const { activeLocale } = useLocalization();
  const snackbar = useSnackbar();

  const exclusions = exclusionsData?.exclusions;

  useEffect(() => {
    if (onValidate) {
      if (exclusionsData?.errorAnnotations?.length) {
        snackbar.toastError(strings.SITE_EXCLUSION_ERRORS);
        onValidate.apply(true);
        return;
      }
      const exclusion = exclusions ? unionMultiPolygons(exclusions) : null;
      const data = exclusion ? { exclusion } : undefined;
      onValidate.apply(false, data, !!data);
    }
  }, [exclusions, exclusionsData?.errorAnnotations, onValidate, snackbar]);

  const readOnlyBoundary = useMemo<RenderableReadOnlyBoundary[] | undefined>(() => {
    if (!site.boundary) {
      return undefined;
    }

    return [
      {
        data: { type: 'FeatureCollection', features: [toFeature(site.boundary, {}, site.id)] },
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

  /**
   * Check for errors and mark annotations.
   */
  const onEditableBoundaryChanged = async (editableBoundary?: FeatureCollection) => {
    const errors = await findErrors(
      {
        ...site,
        exclusion: (editableBoundary && unionMultiPolygons(editableBoundary)) || undefined,
      },
      'exclusion',
      []
    );

    setExclusionsData({
      errorAnnotations: errors,
      exclusions: editableBoundary,
    });
  };

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
        errorAnnotations={exclusionsData?.errorAnnotations}
        onEditableBoundaryChanged={(editableBoundary) => void onEditableBoundaryChanged(editableBoundary)}
        onRedo={redo}
        onUndo={undo}
        readOnlyBoundary={readOnlyBoundary}
      />
    </Box>
  );
}
