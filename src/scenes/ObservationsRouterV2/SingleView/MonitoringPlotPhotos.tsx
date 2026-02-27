import React, { type JSX, useMemo } from 'react';

import PhotosList from 'src/components/common/PhotosList';
import { ObservationMonitoringPlotPhoto } from 'src/types/Observations';

const PHOTO_URL = '/api/v1/tracking/observations/{observationId}/plots/{monitoringPlotId}/photos/{fileId}';

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
    const rootUrl = PHOTO_URL.replace('{observationId}', observationId.toString()).replace(
      '{monitoringPlotId}',
      monitoringPlotId.toString()
    );

    return (photos ?? []).map((photo: ObservationMonitoringPlotPhoto) =>
      rootUrl.replace('{fileId}', photo.fileId.toString())
    );
  }, [observationId, monitoringPlotId, photos]);

  return <PhotosList photoUrls={photoUrls} fillSpace />;
}
