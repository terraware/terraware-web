import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import centroid from '@turf/centroid';
import _ from 'lodash';
import strings from 'src/strings';
import { PlantingSite, PlantingZone } from 'src/types/Tracking';
import useSnackbar from 'src/utils/useSnackbar';
import useUndoRedoState from 'src/hooks/useUndoRedoState';
import { MapEditorMode } from 'src/components/Map/EditableMapDrawV2';
import { toFeature, unionMultiPolygons } from 'src/components/Map/utils';
import EditableMap from 'src/components/Map/EditableMapV2';
import MapIcon from 'src/components/Map/MapIcon';
import StepTitleDescription, { Description } from './StepTitleDescription';
import { boundingAreaHectares, defaultZonePayload } from './utils';

export type SiteBoundaryProps = {
  isSimpleSite: boolean;
  onChange: (id: string, value: unknown) => void;
  onValidate?: (hasErrors: boolean) => void;
  site: PlantingSite;
};

const featureSiteBoundary = (id: number, boundary?: MultiPolygon): FeatureCollection | undefined =>
  !boundary
    ? undefined
    : {
        type: 'FeatureCollection',
        features: [toFeature(boundary, {}, id)],
      };

export default function SiteBoundary({ isSimpleSite, onChange, onValidate, site }: SiteBoundaryProps): JSX.Element {
  const [description, setDescription] = useState<Description[]>([]);
  const [siteBoundary, setSiteBoundary, undo, redo] = useUndoRedoState<FeatureCollection | undefined>(
    featureSiteBoundary(site.id, site.boundary)
  );
  const [mode, setMode] = useState<MapEditorMode>();
  const snackbar = useSnackbar();

  // construct union of multipolygons
  const boundary = useMemo<MultiPolygon | null>(
    () => (siteBoundary ? unionMultiPolygons(siteBoundary) : null),
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
      if (!boundary || errorAnnotations?.length) {
        snackbar.toastError(
          errorAnnotations?.length ? strings.SITE_BOUNDARY_ERRORS : strings.SITE_BOUNDARY_ABSENT_WARNING
        );
        onValidate(true);
        return;
      } else {
        onChange('boundary', boundary);
        if (site.id !== -1) {
          // create one zone per disjoint polygon in the site boundary
          const zones: PlantingZone[] = boundary.coordinates.flatMap((coordinates: Position[][], index: number) => {
            const zoneBoundary: MultiPolygon = { type: 'MultiPolygon', coordinates: [coordinates] };
            return defaultZonePayload({
              boundary: zoneBoundary,
              id: index,
              name: isSimpleSite || true ? `${strings.ZONE}${index || ''}` : '',
              targetPlantingDensity: 1500,
            });
          });
          onChange('plantingZones', zones);
        }
        onValidate(false);
      }
    }
  }, [boundary, errorAnnotations, isSimpleSite, onChange, onValidate, site.id, siteBoundary, snackbar]);

  useEffect(() => {
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
  }, [mode]);

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <StepTitleDescription
        description={description}
        dontShowAgainPreferenceName='dont-show-site-boundary-instructions'
        minHeight='230px'
        title={strings.SITE_BOUNDARY}
        tutorialDescription={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_DESCRIPTION}
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
