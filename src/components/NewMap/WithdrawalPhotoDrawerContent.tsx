import React, { type JSX, useMemo } from 'react';

import { DateTime } from 'luxon';

import { MapDrawerTableRow } from 'src/components/MapDrawerTable';
import { useLocalization } from 'src/providers';
import { Point } from 'src/queries/generated/nurseryWithdrawals';

import MapPhotoDrawer from './MapPhotoDrawer';
import { useFormatGPS } from './useFormatGPS';

const PHOTO_URL = '/api/v1/nursery/withdrawals/:withdrawalId/photos/:photoId';

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
    () => PHOTO_URL.replace(':withdrawalId', `${withdrawalId}`).replace(':photoId', `${photoId}`),
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
