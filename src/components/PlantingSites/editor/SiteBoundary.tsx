import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { FeatureCollection, MultiPolygon } from 'geojson';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import useSnackbar from 'src/utils/useSnackbar';
import useUndoRedoState from 'src/hooks/useUndoRedoState';
import { MapEditorMode } from 'src/components/Map/EditableMapDrawV2';
import { toFeature, unionMultiPolygons } from 'src/components/Map/utils';
import EditableMap from 'src/components/Map/EditableMapV2';
import MapIcon from 'src/components/Map/MapIcon';
import StepTitleDescription, { Description } from './StepTitleDescription';
import { bboxAreaHectares, defaultZonePayload } from './utils';

export type SiteBoundaryProps = {
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

export default function SiteBoundary({ onChange, onValidate, site }: SiteBoundaryProps): JSX.Element {
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

  // check if bounding area is larger than 20K hectares
  const boundingAreaTooLarge = useMemo<boolean>(
    () => (boundary ? bboxAreaHectares(boundary) > 20000 : false),
    [boundary]
  );

  useEffect(() => {
    if (onValidate) {
      if (!boundary || boundingAreaTooLarge) {
        snackbar.toastError(
          boundingAreaTooLarge ? strings.SITE_BOUNDING_AREA_TOO_LARGE : strings.SITE_BOUNDARY_ABSENT_WARNING
        );
        onValidate(true);
        return;
      } else {
        onChange('boundary', boundary);
        onChange('plantingZones', [defaultZonePayload({ boundary, id: 0, name: '', targetPlantingDensity: 1500 })]);
        onValidate(false);
      }
    }
  }, [boundary, boundingAreaTooLarge, onChange, onValidate, siteBoundary, snackbar]);

  useEffect(() => {
    const data: Description[] = [
      { text: strings.SITE_BOUNDARY_DESCRIPTION_0 },
      { text: strings.SITE_BOUNDARY_DESCRIPTION_1 },
      {
        text: strings.SITE_BOUNDARY_DESCRIPTION_2,
        hasTutorial: true,
        handlePrefix: (prefix: string) => strings.formatString(prefix, <MapIcon icon='polygon' />) as JSX.Element[],
      },
      { text: strings.SITE_BOUNDARY_DESCRIPTION_WARN, isWarning: true },
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
        onEditableBoundaryChanged={setSiteBoundary}
        onRedo={redo}
        onUndo={undo}
        setMode={setMode}
      />
    </Box>
  );
}
