import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import centroid from '@turf/centroid';
import _ from 'lodash';
import strings from 'src/strings';
import { MinimalPlantingZone } from 'src/types/Tracking';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import useSnackbar from 'src/utils/useSnackbar';
import useUndoRedoState from 'src/hooks/useUndoRedoState';
import { useLocalization } from 'src/providers';
import { MapEditorMode } from 'src/components/Map/EditableMapDrawV2';
import { toFeature, unionMultiPolygons } from 'src/components/Map/utils';
import EditableMap from 'src/components/Map/EditableMapV2';
import MapIcon from 'src/components/Map/MapIcon';
import StepTitleDescription, { Description } from './StepTitleDescription';
import { boundingAreaHectares, defaultZonePayload } from './utils';
import { OnValidate } from './types';

export type SiteBoundaryProps = {
  onValidate?: OnValidate;
  site: DraftPlantingSite;
};

const featureSiteBoundary = (id: number, boundary?: MultiPolygon): FeatureCollection | undefined =>
  !boundary
    ? undefined
    : {
        type: 'FeatureCollection',
        features: [toFeature(boundary, {}, id)],
      };

export default function SiteBoundary({ onValidate, site }: SiteBoundaryProps): JSX.Element {
  const [description, setDescription] = useState<Description[]>([]);
  const [siteBoundary, setSiteBoundary, undo, redo] = useUndoRedoState<FeatureCollection | undefined>(
    featureSiteBoundary(site.id, site.boundary)
  );
  const [mode, setMode] = useState<MapEditorMode>();
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();

  // construct union of multipolygons
  const boundary = useMemo<MultiPolygon | undefined>(
    () => (siteBoundary && unionMultiPolygons(siteBoundary)) || undefined,
    [siteBoundary]
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

      // check if individual polygons are of a minimum size
      const individualPolygons: Polygon[] = boundary.coordinates.flatMap((coordinates: Position[][]) => ({
        type: 'Polygon',
        coordinates,
      }));
      let index = 0;
      const polygonsTooSmall = individualPolygons
        .flatMap((poly: Polygon) => {
          const area = boundingAreaHectares(poly);
          if (area < 1) {
            // stopgap to check for 100m x 100m until we have BE API
            const errorText = strings.formatString(strings.SITE_BOUNDARY_POLYGON_TOO_SMALL, area);
            return [{ type: 'Feature', geometry: poly, properties: { errorText, fill: true }, id: index++ } as Feature];
          } else {
            return [];
          }
        })
        .filter((feature) => !!feature);

      if (polygonsTooSmall.length) {
        return polygonsTooSmall;
      }
    }
    return undefined;
  }, [boundary, boundingArea, boundingAreaTooLarge]);

  useEffect(() => {
    if (onValidate) {
      if ((!boundary && !onValidate.isSaveAndClose) || errorAnnotations?.length) {
        snackbar.toastError(
          errorAnnotations?.length ? strings.SITE_BOUNDARY_ERRORS : strings.SITE_BOUNDARY_ABSENT_WARNING
        );
        onValidate.apply(true);
        return;
      } else {
        // create one zone per disjoint polygon in the site boundary
        const plantingZones: MinimalPlantingZone[] | undefined = boundary?.coordinates.flatMap(
          (coordinates: Position[][], index: number) => {
            const zoneBoundary: MultiPolygon = { type: 'MultiPolygon', coordinates: [coordinates] };
            return defaultZonePayload({
              boundary: zoneBoundary,
              id: index,
              name: `${strings.ZONE}${index + 1}`,
              targetPlantingDensity: 1500,
            });
          }
        );
        onValidate.apply(false, { boundary, plantingZones });
      }
    }
  }, [boundary, errorAnnotations, onValidate, site.id, siteBoundary, snackbar]);

  useEffect(() => {
    if (!activeLocale) {
      return;
    }
    const data: Description[] = [
      { text: strings.SITE_BOUNDARY_DESCRIPTION_0 },
      { text: strings.SITE_BOUNDARY_DESCRIPTION_1 },
      {
        text: strings.SITE_BOUNDARY_DESCRIPTION_2,
        hasTutorial: true,
        handlePrefix: (prefix: string) => strings.formatString(prefix, <MapIcon icon='polygon' />) as JSX.Element[],
      },
      { text: strings.SITE_BOUNDARY_DESCRIPTION_WARN, isWarning: true, isBold: true },
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
  }, [activeLocale, mode]);

  const tutorialDescription = useMemo(() => {
    if (!activeLocale) {
      return '';
    }
    return strings.formatString(
      strings.PLANTING_SITE_CREATE_INSTRUCTIONS_DESCRIPTION,
      <MapIcon centerAligned icon='polygon' />
    ) as JSX.Element[];
  }, [activeLocale]);

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <StepTitleDescription
        description={description}
        dontShowAgainPreferenceName='dont-show-site-boundary-instructions'
        minHeight='230px'
        title={strings.SITE_BOUNDARY}
        tutorialDescription={tutorialDescription}
        tutorialDocLinkKey='planting_site_create_boundary_instructions_video'
        tutorialTitle={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_TITLE}
      />
      <EditableMap
        editableBoundary={siteBoundary}
        errorAnnotations={errorAnnotations}
        onEditableBoundaryChanged={setSiteBoundary}
        onRedo={redo}
        onUndo={undo}
        setMode={setMode}
      />
    </Box>
  );
}
