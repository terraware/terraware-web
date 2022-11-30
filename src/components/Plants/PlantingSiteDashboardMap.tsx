import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { PlantingSite } from 'src/api/types/tracking';
import { getPlantingSite } from 'src/api/tracking/tracking';
import useSnackbar from 'src/utils/useSnackbar';
import { PlantingSitesPlots } from './PlantingSiteDetails';
import { GenericMap, PlantingSiteMap, useSpeciesPlantsRenderer } from 'src/components/Map';

const MAP_STYLE = {
  borderRadius: '8px',
};

type PlantingSiteDashboardMapProps = {
  siteId?: number;
  plots?: PlantingSitesPlots[];
};

export default function PlantingSiteDashboardMap(props: PlantingSiteDashboardMapProps): JSX.Element {
  const { plots, siteId } = props;
  const [snackbar] = useState(useSnackbar());
  const [plantingSite, setPlantingSite] = useState<PlantingSite>();

  const plotsMap = useMemo(() => {
    if (!plots) {
      return [];
    }

    return plots.reduce((accumulator: any, plot) => {
      accumulator[plot.id.toString()] = plot.populations;
      return accumulator;
    }, {});
  }, [plots]);

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

  const contextRenderer = useSpeciesPlantsRenderer(plotsMap);
  const hasPolygons = plantingSite && plantingSite.boundary && plantingSite.boundary.coordinates?.length > 0;

  return (
    <Box display='flex' height='100%'>
      {hasPolygons ? (
        <PlantingSiteMap plantingSite={plantingSite} key={siteId} style={MAP_STYLE} contextRenderer={contextRenderer} />
      ) : (
        <GenericMap style={MAP_STYLE} />
      )}
    </Box>
  );
}
