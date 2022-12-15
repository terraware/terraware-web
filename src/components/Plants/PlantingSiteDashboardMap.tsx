import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { PlantingSite } from 'src/api/types/tracking';
import { getPlantingSite } from 'src/api/tracking/tracking';
import useSnackbar from 'src/utils/useSnackbar';
import { PlantingSitePlot } from './PlantingSiteDetails';
import { GenericMap, PlantingSiteMap, useSpeciesPlantsRenderer } from 'src/components/Map';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { ServerOrganization } from 'src/types/Organization';
import { isContributor } from 'src/utils/organization';
import strings from 'src/strings';

const MAP_STYLE = {
  borderRadius: '24px',
};

type PlantingSiteDashboardMapProps = {
  organization: ServerOrganization;
  plots?: PlantingSitePlot[];
  selectedPlotId?: number;
  siteId?: number;
};

export default function PlantingSiteDashboardMap(props: PlantingSiteDashboardMapProps): JSX.Element {
  const { organization, plots, selectedPlotId, siteId } = props;
  const { isMobile } = useDeviceInfo();
  const [snackbar] = useState(useSnackbar());
  const [plantingSite, setPlantingSite] = useState<PlantingSite>();
  const contributor = isContributor(organization);

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
  // we don't want to show the map if there are no plots with plants, in mobile-web
  const hasPlotsWithPlants = plotsMap && Object.keys(plotsMap).length > 0;

  return (
    <Box display='flex' height='100%'>
      {hasPolygons && (!isMobile || hasPlotsWithPlants) ? (
        <PlantingSiteMap
          plantingSite={plantingSite}
          key={plantingSite?.id}
          style={MAP_STYLE}
          contextRenderer={contextRenderer}
          selectedPlotId={selectedPlotId}
        />
      ) : isMobile || !plots ? null : (
        <GenericMap
          style={MAP_STYLE}
          bannerMessage={contributor ? strings.GENERIC_MAP_MESSAGE_CONTRIBUTOR : strings.GENERIC_MAP_MESSAGE_ADMIN}
        />
      )}
    </Box>
  );
}
