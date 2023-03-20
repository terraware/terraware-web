import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { PlantingSite } from 'src/types/Tracking';
import { TrackingService } from 'src/services';
import useSnackbar from 'src/utils/useSnackbar';
import { PlantingSiteSubzone } from 'src/types/PlantingSite';
import { GenericMap, PlantingSiteMap, useSpeciesPlantsRenderer } from 'src/components/Map';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const MAP_STYLE = {
  borderRadius: '24px',
};

type PlantingSiteDashboardMapProps = {
  subzones?: PlantingSiteSubzone[];
  selectedSubzoneId?: number;
  selectedZoneId?: number;
  siteId?: number;
};

export default function PlantingSiteDashboardMap(props: PlantingSiteDashboardMapProps): JSX.Element {
  const { subzones, selectedSubzoneId, selectedZoneId, siteId } = props;
  const { isMobile } = useDeviceInfo();
  const snackbar = useSnackbar();
  const [plantingSite, setPlantingSite] = useState<PlantingSite>();

  const subzonesMap = useMemo(() => {
    if (!subzones) {
      return {};
    }

    return subzones.reduce((accumulator: any, subzone) => {
      accumulator[subzone.id.toString()] = subzone.populations;
      return accumulator;
    }, {});
  }, [subzones]);

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

  const contextRenderer = useSpeciesPlantsRenderer(subzonesMap);
  const hasPolygons = plantingSite && plantingSite.boundary && plantingSite.boundary.coordinates?.length > 0;

  return (
    <Box display='flex' height='100%'>
      {hasPolygons ? (
        <PlantingSiteMap
          plantingSite={plantingSite}
          key={plantingSite?.id}
          style={MAP_STYLE}
          contextRenderer={contextRenderer}
          selectedSubzoneId={selectedSubzoneId}
          selectedZoneId={selectedZoneId}
        />
      ) : isMobile || !subzones ? null : (
        <GenericMap style={MAP_STYLE} />
      )}
    </Box>
  );
}
