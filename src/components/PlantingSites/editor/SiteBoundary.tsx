import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { FeatureCollection } from 'geojson';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import useSnackbar from 'src/utils/useSnackbar';
import { MapEditorMode } from 'src/components/Map/EditableMapDrawV2';
import { toFeature, toMultiPolygonArray } from 'src/components/Map/utils';
import EditableMap from 'src/components/Map/EditableMapV2';
import MapIcon from 'src/components/Map/MapIcon';
import StepTitleDescription, { Description } from './StepTitleDescription';
import { defaultZonePayload } from './utils';

export type SiteBoundaryProps = {
  onChange: (id: string, value: unknown) => void;
  onValidate?: (hasErrors: boolean) => void;
  site: PlantingSite;
};

export default function SiteBoundary({ onChange, onValidate, site }: SiteBoundaryProps): JSX.Element {
  const [description, setDescription] = useState<Description[]>([]);
  const [siteBoundary, setSiteBoundary] = useState<FeatureCollection | undefined>();
  const [mode, setMode] = useState<MapEditorMode>();
  const snackbar = useSnackbar();

  useEffect(() => {
    if (site.boundary) {
      setSiteBoundary({
        type: 'FeatureCollection',
        features: [toFeature(site.boundary!, {}, site.id)],
      });
    }
  }, [site.boundary, site.id]);

  useEffect(() => {
    if (onValidate) {
      const boundaryArray = siteBoundary ? toMultiPolygonArray(siteBoundary) : undefined;
      if (!boundaryArray?.length) {
        // string is wip
        snackbar.toastError('please draw a site boundary');
        onValidate(true);
        return;
      } else {
        const boundary = boundaryArray[0];
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
        minHeight='215px'
        title={strings.SITE_BOUNDARY}
        tutorialDescription={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_DESCRIPTION}
        tutorialDocLinkKey='planting_site_create_boundary_instructions_video'
        tutorialTitle={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_TITLE}
      />
      <EditableMap onEditableBoundaryChanged={setSiteBoundary} editableBoundary={siteBoundary} setMode={setMode} />
    </Box>
  );
}
