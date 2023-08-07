import { PlantingSite } from 'src/types/Tracking';
import EditableMap from 'src/components/Map/EditableMap';
import { Box, Typography, useTheme } from '@mui/material';
import { MultiPolygon } from 'geojson';
import strings from 'src/strings';

type PlantingSiteMapEditorProps = {
  onBoundaryChanged: (geometry: MultiPolygon | null) => void;
  plantingSite: PlantingSite;
  style?: object;
};

export default function PlantingSiteMapEditor({
  onBoundaryChanged,
  plantingSite,
  style,
}: PlantingSiteMapEditorProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box
      display='flex'
      flexDirection='column'
      width='100%'
      height='100%'
      flexGrow={1}
      padding={theme.spacing(3, 0, 0, 0)}
    >
      <Typography fontSize='16px' fontWeight={600} margin={theme.spacing(3, 0)}>
        {strings.SITE_MAP}
      </Typography>
      <EditableMap
        boundary={plantingSite.boundary}
        onBoundaryChanged={onBoundaryChanged}
        style={{
          borderRadius: '24px',
          ...style,
        }}
      />
    </Box>
  );
}
