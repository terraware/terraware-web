import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { mapTooltipDialogStyle } from 'src/components/Map/MapRenderUtils';

const useMapStyle = makeStyles((theme: Theme) => ({
  ...mapTooltipDialogStyle(theme),
  box: {
    minWidth: '300px',
    '& .mapboxgl-popup-content': {
      display: 'flex',
      flexDirection: 'column',
    },
  },
  textInput: {
    marginTop: theme.spacing(1.5),
  },
}));

export default useMapStyle;
