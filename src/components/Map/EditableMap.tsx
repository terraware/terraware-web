import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMapGL, { LngLatBoundsLike, MapRef } from 'react-map-gl';
import EditableMapDraw, { MapEditorMode } from 'src/components/Map/EditableMapDraw';
import useMapboxToken from 'src/utils/useMapboxToken';
import { Box, Typography, useTheme } from '@mui/material';
import { useIsVisible } from 'src/hooks/useIsVisible';
import bbox from '@turf/bbox';
import { MultiPolygon } from 'geojson';
import strings from 'src/strings';

export type EditableMapProps = {
  boundary?: MultiPolygon;
  onBoundaryChanged: (boundary: MultiPolygon | null) => void;
  style?: object;
};

const polygonIcon = <button className='mapbox-gl-draw_polygon mapbox-gl-draw_ctrl-draw-btn' />;
const trashIcon = <button className='mapbox-gl-draw_trash mapbox-gl-draw_ctrl-draw-btn' />;

function instructionsForMode(mode: MapEditorMode | null): JSX.Element | JSX.Element[] | null {
  let instructions: string = '';

  if (mode === 'ReplacingBoundary') {
    instructions = strings.MAP_EDITOR_DRAWING_ADDITIONAL_FEATURE;
  } else if (mode === 'CreatingBoundary') {
    instructions = strings.MAP_EDITOR_DRAWING_FIRST_FEATURE;
  } else if (mode === 'EditingBoundary') {
    instructions = strings.MAP_EDITOR_EDITING_FEATURE;
  } else if (mode === 'NoBoundary') {
    instructions = strings.MAP_EDITOR_NO_FEATURES;
  } else if (mode === 'BoundaryNotSelected') {
    instructions = strings.MAP_EDITOR_NO_SELECTION;
  } else if (mode === 'BoundarySelected') {
    instructions = strings.MAP_EDITOR_SELECTED_FEATURE;
  } else if (mode === null) {
    instructions = strings.LOADING;
  }

  return strings.formatString(instructions, {
    polygon: polygonIcon,
    trash: trashIcon,
  }) as JSX.Element[];
}

export default function EditableMap({ boundary, onBoundaryChanged, style }: EditableMapProps): JSX.Element {
  const { mapId, refreshToken, token } = useMapboxToken();
  const [firstVisible, setFirstVisible] = useState<boolean>(false);
  const [mode, setMode] = useState<MapEditorMode | null>(null);
  const containerRef = useRef(null);
  const mapRef = useRef<MapRef | null>(null);
  const visible = useIsVisible(containerRef);
  const theme = useTheme();

  useEffect(() => {
    // `firstVisible` detects when the box containing the map is first visible in the viewport. The map should only be
    // rendered if `firstVisible` is true. This accounts for cases in which the map is initially rendered hidden, and
    // is improperly resized when it first becomes visible.
    setFirstVisible((fv) => fv || visible);
  }, [visible]);

  const onMapError = useCallback(
    (event: any) => {
      if (event?.error?.status === 401 && refreshToken) {
        refreshToken();
      }
    },
    [refreshToken]
  );

  const initialViewState = {
    bounds: boundary ? (bbox(boundary) as LngLatBoundsLike) : undefined,
    fitBoundsOptions: {
      animate: false,
      padding: 25,
    },
  };

  return (
    <Box
      ref={containerRef}
      display='flex'
      flexDirection='column'
      flexGrow={1}
      height='100%'
      width='100%'
      sx={{ minHeight: 250, position: 'relative' }}
    >
      {firstVisible && (
        <>
          <ReactMapGL
            key={mapId}
            onError={onMapError}
            ref={mapRef}
            mapboxAccessToken={token}
            mapStyle='mapbox://styles/mapbox/satellite-v9?optimize=true'
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexGrow: '1',
              flexDirection: 'column',
              ...style,
            }}
            initialViewState={initialViewState}
          >
            <EditableMapDraw boundary={boundary} onBoundaryChanged={onBoundaryChanged} setMode={setMode} />
          </ReactMapGL>
          <Typography fontSize='16px' margin={theme.spacing(1, 0)} minHeight='3em'>
            {instructionsForMode(mode)}
          </Typography>
        </>
      )}
    </Box>
  );
}
