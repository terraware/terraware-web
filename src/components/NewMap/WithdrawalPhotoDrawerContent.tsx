import React, { type JSX, useMemo } from 'react';

import { DateTime } from 'luxon';

import { MapDrawerTableRow } from 'src/components/MapDrawerTable';
import { API_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { Point } from 'src/queries/generated/nurseryWithdrawals';

import MapPhotoDrawer from './MapPhotoDrawer';
import { useFormatGPS } from './useFormatGPS';

type WithdrawalPhotoDrawerContentProps = {
  capturedLocalTime?: string;
  gpsCoordinates: Point;
  photoId: number;
  withdrawalId: number;
  withdrawnDate: string;
};

const WithdrawalPhotoDrawerContent = ({
  capturedLocalTime,
  gpsCoordinates,
  photoId,
  withdrawalId,
  withdrawnDate,
}: WithdrawalPhotoDrawerContentProps): JSX.Element => {
  const { strings } = useLocalization();
  const formatGPS = useFormatGPS();

  const photoUrl = useMemo(
    () =>
      API_PATHS.NURSERY_WITHDRAWAL_PHOTO.replace('{withdrawalId}', String(withdrawalId)).replace(
        '{photoId}',
        String(photoId)
      ),
    [withdrawalId, photoId]
  );

  const rows = useMemo(
    (): MapDrawerTableRow[] => [
      ...(capturedLocalTime
        ? [
            {
              key: strings.PHOTO_DATE_TIME,
              value: DateTime.fromISO(capturedLocalTime).toFormat('yyyy-MM-dd h:mm a'),
            },
          ]
        : []),
      {
        key: strings.PLANTING_WITHDRAWAL_DATE,
        value: withdrawnDate,
      },
      {
        key: strings.LOCATION,
        value: formatGPS(gpsCoordinates.coordinates[0], gpsCoordinates.coordinates[1]),
      },
    ],
    [capturedLocalTime, formatGPS, gpsCoordinates, strings, withdrawnDate]
  );

  return <MapPhotoDrawer imageUrl={photoUrl} rows={rows} />;
};

export default WithdrawalPhotoDrawerContent;
