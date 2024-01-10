import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { FeatureCollection } from 'geojson';
import strings from 'src/strings';
import { MapEditorMode } from 'src/components/Map/EditableMapDrawV2';
import EditableMap from 'src/components/Map/EditableMapV2';
import useMapIcons from 'src/components/Map/useMapIcons';
import StepTitleDescription, { Description } from './StepTitleDescription';

export type PlantingSiteBoundaryProps = {
  boundary?: FeatureCollection;
  setBoundary: (boundary?: FeatureCollection) => void;
};

export default function PlantingSiteBoundary({ boundary, setBoundary }: PlantingSiteBoundaryProps): JSX.Element {
  const [description, setDescription] = useState<Description[]>([]);
  const [mode, setMode] = useState<MapEditorMode>();
  const mapIcons = useMapIcons();

  useEffect(() => {
    const data: Description[] = [
      { text: strings.SITE_BOUNDARY_DESCRIPTION_0 },
      { text: strings.SITE_BOUNDARY_DESCRIPTION_1 },
      {
        text: strings.SITE_BOUNDARY_DESCRIPTION_2,
        hasTutorial: true,
        handlePrefix: (prefix: string) => strings.formatString(prefix, mapIcons.polygon) as JSX.Element[],
      },
    ];

    if (!mode) {
      data.push({ text: strings.LOADING });
    } else if (mode === 'CreatingBoundary') {
      data.push({ text: strings.SITE_BOUNDARY_DESCRIPTION_3 });
    } else if (mode === 'EditingBoundary' || mode === 'BoundarySelected') {
      data.push({ text: strings.formatString(strings.SITE_BOUNDARY_DESCRIPTION_4, mapIcons.trash) as JSX.Element[] });
    }

    setDescription(data);
  }, [mapIcons, mode]);

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <StepTitleDescription
        description={description}
        dontShowAgainPreferenceName='dont-show-site-boundary-instructions'
        minHeight='192px'
        title={strings.SITE_BOUNDARY}
        tutorialDescription={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_DESCRIPTION}
        tutorialDocLinkKey='planting_site_create_boundary_instructions_video'
        tutorialTitle={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_TITLE}
      />
      <EditableMap onBoundaryChanged={setBoundary} boundary={boundary} setMode={setMode} />
    </Box>
  );
}
