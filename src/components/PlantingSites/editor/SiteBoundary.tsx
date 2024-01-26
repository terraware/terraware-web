import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { FeatureCollection, MultiPolygon } from 'geojson';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { GeometryFeature } from 'src/types/Map';
import useSnackbar from 'src/utils/useSnackbar';
import useUndoRedoState from 'src/hooks/useUndoRedoState';
import { MapEditorMode } from 'src/components/Map/EditableMapDrawV2';
import { toFeature, toMultiPolygonArray } from 'src/components/Map/utils';
import EditableMap from 'src/components/Map/EditableMapV2';
import MapIcon from 'src/components/Map/MapIcon';
import StepTitleDescription, { Description } from './StepTitleDescription';
import { defaultZonePayload, bboxAreaHectares } from './utils';

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

  useEffect(() => {
    if (onValidate) {
      const boundaryArray = siteBoundary ? toMultiPolygonArray(siteBoundary) : undefined;
      if (!boundaryArray?.length) {
        // string is wip
        snackbar.toastError('please draw a site boundary');
        onValidate(true);
        return;
      } else {
        const boundary: MultiPolygon = {
          type: 'MultiPolygon',
          coordinates: boundaryArray!.flatMap((poly) => poly.coordinates),
        };
        onChange('boundary', boundary);
        onChange('plantingZones', [defaultZonePayload({ boundary, id: 0, name: '', targetPlantingDensity: 1500 })]);
        onValidate(false);
      }
    }
  }, [onChange, onValidate, siteBoundary, snackbar]);

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

  const onBoundaryChanged = (boundary?: FeatureCollection) => {
    if (boundary) {
      const { features } = boundary;
      const feature = features[0];
      if (feature && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) {
        if (!feature.properties) {
          feature.properties = {};
        }
        const area = bboxAreaHectares(feature as GeometryFeature);
        const tooLarge = area >= 20000;
        if (tooLarge) {
          feature.properties.error = true;
          feature.properties.errorText = strings.SITE_BOUNDARY_TOO_LARGE;
        } else {
          delete feature.properties.error;
          delete feature.properties.errorText;
        }
      }
    }
    setSiteBoundary(boundary);
  };

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
        onEditableBoundaryChanged={onBoundaryChanged}
        onRedo={redo}
        onUndo={undo}
        setMode={setMode}
      />
    </Box>
  );
}
