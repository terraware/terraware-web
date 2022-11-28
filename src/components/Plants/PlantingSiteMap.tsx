import { Grid } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { PlantingSitesPlotsSearch } from './PlantingSiteDetails';

type PlantingSiteMapProps = {
  plots?: PlantingSitesPlotsSearch[];
};

export default function PlantingSiteMap(props: PlantingSiteMapProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  return (
    <Grid item xs={isMobile ? 12 : 6} sx={{ paddingRight: 1, paddingBottom: isMobile ? 2 : 0 }}>
      Map
    </Grid>
  );
}
