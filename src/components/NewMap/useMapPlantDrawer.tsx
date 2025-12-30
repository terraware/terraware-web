import React, { useCallback, useMemo, useState } from 'react';

import { RecordedPlant } from 'src/types/Observations';

import { MapDrawerSize } from './MapDrawer';
import MapDrawerPagination from './MapDrawerPagination';
import MapPlantDrawer from './MapPlantDrawer';

export type PlotPlant = {
  observationId: number;
  monitoringPlotId: number;
  plant: RecordedPlant;
};

const useMapPlantDrawer = () => {
  const [selectedPlants, setSelectedPlants] = useState<PlotPlant[]>([]);
  const [plantDrawerPage, setPlantDrawerPage] = useState<number>(1);

  const plantDrawerSize: MapDrawerSize = 'small';
  const plantDrawerHeader = useMemo(() => {
    if (selectedPlants.length > 1) {
      return (
        <MapDrawerPagination
          drawerSize={plantDrawerSize}
          page={plantDrawerPage}
          setPage={setPlantDrawerPage}
          totalPages={selectedPlants.length}
        />
      );
    } else {
      return undefined;
    }
  }, [plantDrawerPage, selectedPlants.length]);

  const plantDrawerContent = useMemo(() => {
    if (selectedPlants.length > 0) {
      const selectedPlant = selectedPlants[plantDrawerPage - 1];
      return (
        <MapPlantDrawer
          monitoringPlotId={selectedPlant.monitoringPlotId}
          observationId={selectedPlant.observationId}
          plant={selectedPlant.plant}
        />
      );
    }
  }, [plantDrawerPage, selectedPlants]);

  const selectPlants = useCallback((plants: PlotPlant[]) => {
    setSelectedPlants(plants);
    setPlantDrawerPage(1);
  }, []);

  return {
    plantDrawerContent,
    plantDrawerHeader,
    plantDrawerSize,
    selectedPlants,
    selectPlants,
  };
};

export default useMapPlantDrawer;
