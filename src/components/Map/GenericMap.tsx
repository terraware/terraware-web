import { Box, CircularProgress } from '@mui/material';
import Map, { MapImage } from './Map';
import { MapControl, MapEntityOptions, MapOptions, MapPopupRenderer } from 'src/types/Map';
import useMapboxToken from 'src/utils/useMapboxToken';

const DUMMY_MAP_OPTIONS: MapOptions = {
  bbox: {
    lowerLeft: [0, 0],
    upperRight: [0, 0],
  },
  sources: [],
};

type GenericMapProps = {
  contextRenderer?: MapPopupRenderer;
  options?: MapOptions;
  style?: object;
  bannerMessage?: string;
  entityOptions?: MapEntityOptions;
  mapImages?: MapImage[];
} & MapControl;

export default function GenericMap(props: GenericMapProps): JSX.Element | null {
  const { contextRenderer, options, style, bannerMessage, entityOptions, mapImages } = props;
  const { ...mapControlProps }: MapControl = props;

  const { token, mapId, refreshToken } = useMapboxToken();

  if (!token) {
    return (
      <Box sx={{ display: 'flex', flexGrow: 1, height: '100%', margin: 'auto' }}>
        <CircularProgress sx={{ margin: 'auto' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexGrow: 1 }}>
      <Map
        token={token}
        options={options || DUMMY_MAP_OPTIONS}
        onTokenExpired={refreshToken}
        mapId={mapId}
        style={style}
        popupRenderer={contextRenderer}
        bannerMessage={bannerMessage}
        entityOptions={entityOptions}
        mapImages={mapImages}
        {...mapControlProps}
      />
    </Box>
  );
}
