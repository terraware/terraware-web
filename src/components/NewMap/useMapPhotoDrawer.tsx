import React, { useCallback, useMemo, useState } from 'react';

import { Point } from 'src/queries/generated/nurseryWithdrawals';
import { ObservationSplatPayload } from 'src/queries/generated/observationSplats';
import { ObservationMonitoringPlotPhotoWithGps } from 'src/types/Observations';

import { MapDrawerSize } from './MapDrawer';
import MapDrawerPagination from './MapDrawerPagination';
import ObservationPhotoDrawerContent from './ObservationPhotoDrawerContent';
import WithdrawalPhotoDrawerContent from './WithdrawalPhotoDrawerContent';

export type PlotPhoto = {
  kind: 'plot-photo';
  observationId: number;
  monitoringPlotId: number;
  photo: ObservationMonitoringPlotPhotoWithGps;
};

export type PlotSplat = {
  kind: 'plot-splat';
  observationId: number;
  monitoringPlotId: number;
  splat: ObservationSplatPayload;
};

export type WithdrawalPhoto = {
  kind: 'withdrawal-photo';
  withdrawalId: number;
  photoId: number;
  withdrawnDate: string;
  gpsCoordinates?: Point;
};

export type MapDrawerPhotoItem = PlotPhoto | PlotSplat | WithdrawalPhoto;

const useMapPhotoDrawer = () => {
  const [selectedPhotos, setSelectedPhotos] = useState<MapDrawerPhotoItem[]>([]);
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
    if (selectedPhotos.length === 0) {
      return undefined;
    }
    const selected = selectedPhotos[photoDrawerPage - 1];
    switch (selected.kind) {
      case 'plot-photo':
        return (
          <ObservationPhotoDrawerContent
            monitoringPlotId={selected.monitoringPlotId}
            observationId={selected.observationId}
            photo={selected.photo}
          />
        );
      case 'plot-splat':
        return (
          <ObservationPhotoDrawerContent
            monitoringPlotId={selected.monitoringPlotId}
            observationId={selected.observationId}
            splat={selected.splat}
          />
        );
      case 'withdrawal-photo':
        return (
          <WithdrawalPhotoDrawerContent
            withdrawalId={selected.withdrawalId}
            photoId={selected.photoId}
            withdrawnDate={selected.withdrawnDate}
            gpsCoordinates={selected.gpsCoordinates}
          />
        );
    }
  }, [photoDrawerPage, selectedPhotos]);

  const selectPhotos = useCallback((photos: MapDrawerPhotoItem[]) => {
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
