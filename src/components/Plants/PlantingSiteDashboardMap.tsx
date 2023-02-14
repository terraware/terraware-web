import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { PlantingSite } from 'src/types/Tracking';
import { TrackingService } from 'src/services';
import useSnackbar from 'src/utils/useSnackbar';
import { PlantingSitePlot } from './PlantingSiteDetails';
import { GenericMap, PlantingSiteMap, useSpeciesPlantsRenderer } from 'src/components/Map';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const MAP_STYLE = {
  borderRadius: '24px',
};

type PlantingSiteDashboardMapProps = {
  plots?: PlantingSitePlot[];
  selectedPlotId?: number;
  selectedZoneId?: number;
  siteId?: number;
};

export default function PlantingSiteDashboardMap(props: PlantingSiteDashboardMapProps): JSX.Element {
  const { plots, selectedPlotId, selectedZoneId, siteId } = props;
  const { isMobile } = useDeviceInfo();
  const snackbar = useSnackbar();
  const [plantingSite, setPlantingSite] = useState<PlantingSite>();

  const plotsMap = useMemo(() => {
    if (!plots) {
      return {};
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
      const response = await TrackingService.getPlantingSite(siteId);
      if (response.requestSucceeded) {
        setPlantingSite(response.site);
      } else {
        snackbar.toastError();
      }
    };

    fetchPlantingSite();
  }, [siteId, snackbar]);

  const contextRenderer = useSpeciesPlantsRenderer(plotsMap);
  const hasPolygons = plantingSite && plantingSite.boundary && plantingSite.boundary.coordinates?.length > 0;

  return (
    <Box display='flex' height='100%'>
      {hasPolygons ? (
        <PlantingSiteMap
          plantingSite={plantingSite}
          key={plantingSite?.id}
          style={MAP_STYLE}
          contextRenderer={contextRenderer}
          selectedPlotId={selectedPlotId}
          selectedZoneId={selectedZoneId}
        />
      ) : isMobile || !plots ? null : (
        <GenericMap style={MAP_STYLE} />
      )}
    </Box>
  );
}
