import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { FeatureCollection } from 'geojson';
import strings from 'src/strings';
import { MapEditorMode } from 'src/components/Map/EditableMapDrawV2';
import EditableMap from 'src/components/Map/EditableMapV2';
import MapIcon from 'src/components/Map/MapIcon';
import StepTitleDescription, { Description } from './StepTitleDescription';

export type SiteBoundaryProps = {
  setSiteBoundary: (siteBoundary?: FeatureCollection) => void;
  siteBoundary?: FeatureCollection;
};

export default function SiteBoundary({ setSiteBoundary, siteBoundary }: SiteBoundaryProps): JSX.Element {
  const [description, setDescription] = useState<Description[]>([]);
  const [mode, setMode] = useState<MapEditorMode>();

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
        minHeight='192px'
        title={strings.SITE_BOUNDARY}
        tutorialDescription={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_DESCRIPTION}
        tutorialDocLinkKey='planting_site_create_boundary_instructions_video'
        tutorialTitle={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_TITLE}
      />
      <EditableMap onEditableBoundaryChanged={setSiteBoundary} editableBoundary={siteBoundary} setMode={setMode} />
    </Box>
  );
}
