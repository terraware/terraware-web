import React, { useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import centroid from '@turf/centroid';
import { Feature, FeatureCollection, MultiPolygon } from 'geojson';
import _ from 'lodash';

import { MapEditorMode } from 'src/components/Map/EditableMapDrawV2';
import EditableMap from 'src/components/Map/EditableMapV2';
import MapIcon from 'src/components/Map/MapIcon';
import { toFeature, unionMultiPolygons } from 'src/components/Map/utils';
import useUndoRedoState from 'src/hooks/useUndoRedoState';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { MinimalStratum } from 'src/types/Tracking';
import useSnackbar from 'src/utils/useSnackbar';

import StepTitleDescription, { Description } from './StepTitleDescription';
import { OnValidate } from './types';
import { boundingAreaHectares, defaultStratumPayload, stratumNameGenerator } from './utils';
import { findErrors } from './utils';

export type SiteBoundaryProps = {
  onValidate?: OnValidate;
  site: DraftPlantingSite;
};

// create default strata off the site boundary
const createStratumWith = (boundary?: MultiPolygon): MinimalStratum | undefined => {
  if (!boundary) {
    return undefined;
  }
  const stratumBoundary: MultiPolygon = { type: 'MultiPolygon', coordinates: boundary.coordinates };
  const stratumName = stratumNameGenerator(new Set<string>(), strings.ZONE);
  return defaultStratumPayload({
    boundary: stratumBoundary,
    id: 0,
    name: stratumName,
    targetPlantingDensity: 1500,
  });
};

const featureSiteBoundary = (id: number, boundary?: MultiPolygon): FeatureCollection | undefined =>
  !boundary
    ? undefined
    : {
        type: 'FeatureCollection',
        features: [toFeature(boundary, {}, id)],
      };

// undo redo stack to capture site boundary and errors
type Stack = {
  errorAnnotations?: Feature[];
  siteBoundary?: FeatureCollection;
};

export default function SiteBoundary({ onValidate, site }: SiteBoundaryProps): JSX.Element {
  const [description, setDescription] = useState<Description[]>([]);
  const [siteBoundaryData, setSiteBoundaryData, undo, redo] = useUndoRedoState<Stack>({
    siteBoundary: featureSiteBoundary(site.id, site.boundary),
  });
  const [mode, setMode] = useState<MapEditorMode>();
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();

  // construct union of multipolygons
  const boundary = useMemo<MultiPolygon | undefined>(
    () => (siteBoundaryData?.siteBoundary && unionMultiPolygons(siteBoundaryData?.siteBoundary)) || undefined,
    [siteBoundaryData?.siteBoundary]
  );

  const boundingArea = useMemo<number>(() => (boundary ? boundingAreaHectares(boundary) : 0), [boundary]);

  // check if bounding area is larger than 20K hectares
  const boundingAreaTooLarge = useMemo<boolean>(() => boundingArea > 20000, [boundingArea]);

  const errorAnnotations = useMemo<Feature[] | undefined>(() => {
    // if bounding area is too large, show error message at center of bounding box, also show the bounding box
    if (boundary) {
      // if bounding area is too large, show that error first and skip other errors to avoid overwhelming user
      if (boundingAreaTooLarge) {
        const bboxPoly = bboxPolygon(bbox(_.cloneDeep(boundary)));
        const c = centroid(bboxPoly);
        const errorText = strings.formatString(strings.SITE_BOUNDING_AREA_TOO_LARGE, boundingArea);
        return [
          { ...c, properties: { errorText }, id: 0 },
          { ...bboxPoly, id: 1 },
        ];
      }

      return siteBoundaryData?.errorAnnotations;
    }
    return undefined;
  }, [boundary, boundingArea, boundingAreaTooLarge, siteBoundaryData?.errorAnnotations]);

  useEffect(() => {
    if (onValidate) {
      if ((!boundary && !onValidate.isSaveAndClose) || errorAnnotations?.length) {
        snackbar.toastError(
          errorAnnotations?.length ? strings.SITE_BOUNDARY_ERRORS : strings.SITE_BOUNDARY_ABSENT_WARNING
        );
        onValidate.apply(true);
        return;
      } else {
        // create one stratum per disjoint polygon in the site boundary
        const stratum = createStratumWith(boundary);
        const strata = stratum ? [stratum] : [];
        onValidate.apply(false, { boundary, strata });
      }
    }
  }, [boundary, errorAnnotations, onValidate, site.id, snackbar]);

  useEffect(() => {
    if (!activeLocale) {
      return;
    }
    const data: Description[] = [
      {
        text:
          site.siteType === 'detailed'
            ? strings.SITE_BOUNDARY_DESCRIPTION_0
            : `${strings.SITE_BOUNDARY_DESCRIPTION_0} ${strings.SITE_BOUNDARY_SIMPLE_SITE_NOTE}`,
      },
      {
        text: strings.SITE_BOUNDARY_DESCRIPTION_1,
        hasTutorial: true,
        handlePrefix: (prefix: string) =>
          strings.formatString(prefix, <MapIcon centerAligned={true} icon='polygon' />) as JSX.Element[],
      },
      { text: strings.SITE_BOUNDARY_DESCRIPTION_2, isBold: true },
    ];

    if (!mode) {
      data.push({ text: strings.LOADING });
    } else if (mode === 'CreatingBoundary') {
      data.push({ text: strings.SITE_BOUNDARY_DESCRIPTION_3 });
    } else if (mode === 'EditingBoundary' || mode === 'BoundarySelected') {
      data.push({
        text: strings.formatString(strings.SITE_BOUNDARY_DESCRIPTION_4, <MapIcon icon='trash' />) as JSX.Element[],
      });
    }

    setDescription(data);
  }, [activeLocale, mode, site.siteType]);

  const tutorialDescription = useMemo(() => {
    if (!activeLocale) {
      return '';
    }
    return strings.formatString(
      strings.PLANTING_SITE_CREATE_INSTRUCTIONS_DESCRIPTION,
      <MapIcon centerAligned icon='polygon' />
    ) as JSX.Element[];
  }, [activeLocale]);

  /**
   * Check for errors and mark annotations.
   */
  const onEditableBoundaryChanged = async (editableBoundary?: FeatureCollection) => {
    const newBoundary = (editableBoundary && unionMultiPolygons(editableBoundary)) || undefined;
    const stratum = createStratumWith(newBoundary);
    const strata = stratum ? [stratum] : [];
    const errors = await findErrors(
      {
        ...site,
        boundary: newBoundary,
        strata,
      },
      'site_boundary',
      []
    );

    setSiteBoundaryData({
      errorAnnotations: errors,
      siteBoundary: editableBoundary,
    });
  };

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <StepTitleDescription
        description={description}
        dontShowAgainPreferenceName='dont-show-site-boundary-instructions'
        minHeight='180px'
        title={strings.SITE_BOUNDARY}
        tutorialDescription={tutorialDescription}
        tutorialDocLinkKey='planting_site_create_boundary_instructions_video'
        tutorialTitle={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_TITLE}
      />
      <EditableMap
        editableBoundary={siteBoundaryData?.siteBoundary}
        errorAnnotations={errorAnnotations}
        onEditableBoundaryChanged={(editableBoundary) => void onEditableBoundaryChanged(editableBoundary)}
        onRedo={redo}
        onUndo={undo}
        setMode={setMode}
        showSearchBox
      />
    </Box>
  );
}
