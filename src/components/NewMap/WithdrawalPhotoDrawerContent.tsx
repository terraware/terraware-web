import React, { type JSX, useMemo } from 'react';

import { MapDrawerTableRow } from 'src/components/MapDrawerTable';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { Point } from 'src/queries/generated/nurseryWithdrawals';
import { getShortDate } from 'src/utils/dateFormatter';

import MapPhotoDrawer from './MapPhotoDrawer';
import { useFormatGps } from './formatGps';

const PHOTO_URL = '/api/v1/nursery/withdrawals/:withdrawalId/photos/:photoId';

type WithdrawalPhotoDrawerContentProps = {
  gpsCoordinates?: Point;
  photoId: number;
  withdrawalId: number;
  withdrawnDate: string;
};

const WithdrawalPhotoDrawerContent = ({
  gpsCoordinates,
  photoId,
  withdrawalId,
  withdrawnDate,
}: WithdrawalPhotoDrawerContentProps): JSX.Element => {
  const { activeLocale, strings } = useLocalization();
  const formatGps = useFormatGps();

  const photoUrl = useMemo(
    () => PHOTO_URL.replace(':withdrawalId', `${withdrawalId}`).replace(':photoId', `${photoId}`),
    [withdrawalId, photoId]
  );

  const withdrawalUrl = useMemo(
    () => APP_PATHS.NURSERY_WITHDRAWALS_DETAILS.replace(':withdrawalId', `${withdrawalId}`),
    [withdrawalId]
  );

  const rows = useMemo(
    (): MapDrawerTableRow[] => [
      {
        key: strings.PLANTING_WITHDRAWAL_DATE,
        value: getShortDate(withdrawnDate, activeLocale),
        url: withdrawalUrl,
      },
      {
        key: strings.LOCATION,
        value: gpsCoordinates
          ? formatGps(gpsCoordinates.coordinates[0], gpsCoordinates.coordinates[1])
          : strings.UNKNOWN,
      },
    ],
    [activeLocale, formatGps, gpsCoordinates, strings, withdrawalUrl, withdrawnDate]
  );

  return <MapPhotoDrawer imageUrl={photoUrl} rows={rows} />;
};

export default WithdrawalPhotoDrawerContent;
