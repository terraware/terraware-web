import React, { type JSX, useMemo } from 'react';

import PhotosList from 'src/components/common/PhotosList';
import { API_PATHS } from 'src/constants';
import { ObservationMonitoringPlotPhoto } from 'src/types/Observations';

export type MonitoringPlotPhotosProps = {
  observationId: number;
  monitoringPlotId: number;
  photos?: ObservationMonitoringPlotPhoto[];
};

export default function MonitoringPlotPhotos({
  observationId,
  monitoringPlotId,
  photos,
}: MonitoringPlotPhotosProps): JSX.Element {
  const photoUrls = useMemo(() => {
    const rootUrl = API_PATHS.OBSERVATION_PLOT_PHOTO.replace('{observationId}', observationId.toString()).replace(
      '{monitoringPlotId}',
      monitoringPlotId.toString()
    );

    return (photos ?? []).map((photo: ObservationMonitoringPlotPhoto) =>
      rootUrl.replace('{fileId}', photo.fileId.toString())
    );
  }, [observationId, monitoringPlotId, photos]);

  return <PhotosList photoUrls={photoUrls} fillSpace />;
}
