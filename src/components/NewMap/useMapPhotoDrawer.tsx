import React, { useCallback, useMemo, useState } from 'react';

import { ObservationMonitoringPlotPhotoWithGps } from 'src/types/Observations';

import { MapDrawerSize } from './MapDrawer';
import MapDrawerPagination from './MapDrawerPagination';
import MapPhotoDrawer from './MapPhotoDrawer';

type PlotPhoto = {
  observationId: number;
  monitoringPlotId: number;
  photo: ObservationMonitoringPlotPhotoWithGps;
};

const useMapPhotoDrawer = () => {
  const [selectedPhotos, setSelectedPhotos] = useState<PlotPhoto[]>([]);
  const [photoDrawerPage, setPhotoDrawerPage] = useState<number>(1);

  const photoDrawerSize: MapDrawerSize = 'medium';
  const photoDrawerHeader = useMemo(() => {
    if (selectedPhotos.length > 1) {
      return (
        <MapDrawerPagination
          drawerSize={photoDrawerSize}
          page={photoDrawerPage}
          setPage={setPhotoDrawerPage}
          totalPages={selectedPhotos.length}
        />
      );
    } else {
      return undefined;
    }
  }, [photoDrawerPage, photoDrawerSize, selectedPhotos.length]);

  const photoDrawerContent = useMemo(() => {
    if (selectedPhotos.length > 0) {
      const selectedPhoto = selectedPhotos[photoDrawerPage - 1];
      return (
        <MapPhotoDrawer
          monitoringPlotId={selectedPhoto.monitoringPlotId}
          observationId={selectedPhoto.observationId}
          photo={selectedPhoto.photo}
        />
      );
    }
  }, [photoDrawerPage, selectedPhotos]);

  const selectPhotos = useCallback((photos: PlotPhoto[]) => {
    setSelectedPhotos(photos);
    setPhotoDrawerPage(1);
  }, []);

  return {
    photoDrawerContent,
    photoDrawerHeader,
    photoDrawerSize,
    selectedPhotos,
    selectPhotos,
  };
};

export default useMapPhotoDrawer;
