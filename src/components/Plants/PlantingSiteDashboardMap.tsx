import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { PlantingSite } from 'src/api/types/tracking';
import { getPlantingSite } from 'src/api/tracking/tracking';
import useSnackbar from 'src/utils/useSnackbar';
import { PlantingSitesPlots } from './PlantingSiteDetails';
import { PlantingSiteMap } from 'src/components/Map';

type PlantingSiteDashboardMapProps = {
  siteId?: number;
  plots?: PlantingSitesPlots[];
};

export default function PlantingSiteDashboardMap(props: PlantingSiteDashboardMapProps): JSX.Element {
  const { siteId } = props;
  const [snackbar] = useState(useSnackbar());
  const [plantingSite, setPlantingSite] = useState<PlantingSite>();

  useEffect(() => {
    if (!siteId) {
      return;
    }

    const fetchPlantingSite = async () => {
      const response = await getPlantingSite(siteId);
      if (response.requestSucceeded) {
        setPlantingSite(response.site);
      } else {
        snackbar.toastError(response.error);
      }
    };

    fetchPlantingSite();
  }, [siteId, snackbar]);

  return (
    <Box display='flex' height='100%'>
      {plantingSite && <PlantingSiteMap plantingSite={plantingSite} key={siteId} style={{ borderRadius: '8px' }} />}
    </Box>
  );
}
