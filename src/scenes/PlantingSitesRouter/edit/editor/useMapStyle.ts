import { Theme } from '@mui/material';

const useMapStyle = (theme: Theme) => ({
  tooltip: {
    '.mapboxgl-popup .mapboxgl-popup-content': {
      borderRadius: theme.spacing(1),
      padding: 0,
    },
    '.mapboxgl-popup .mapboxgl-popup-close-button': {
      display: 'none',
    },
  },
  box: {
    '.mapboxgl-popup': {
      minWidth: '300px',
    },
    '.mapboxgl-popup .mapboxgl-popup-content': {
      display: 'flex',
      flexDirection: 'column',
    },
  },
});

export default useMapStyle;
