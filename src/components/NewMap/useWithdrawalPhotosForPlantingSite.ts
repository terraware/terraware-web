import { useEffect, useMemo } from 'react';

import { Point, api as nurseryWithdrawalsApi } from 'src/queries/generated/nurseryWithdrawals';
import { useSearchNurseryWithdrawalsQuery } from 'src/queries/search/nurseries';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

export type WithdrawalPhotoEntry = {
  gpsCoordinates: Point;
  photoId: number;
  withdrawalId: number;
  withdrawnDate: string;
};

type UseWithdrawalPhotosForPlantingSiteArgs = {
  enabled?: boolean;
  organizationId?: number;
  plantingSiteId?: number;
};

const useWithdrawalPhotosForPlantingSite = ({
  enabled = true,
  organizationId,
  plantingSiteId,
}: UseWithdrawalPhotosForPlantingSiteArgs): WithdrawalPhotoEntry[] => {
  const skip = !enabled || plantingSiteId === undefined;
  console.log('*****************************************');
  console.log('useWithdrawalPhotosForPlantingSite - enabled:', enabled);
  console.log('useWithdrawalPhotosForPlantingSite - organizationId:', organizationId);
  console.log('useWithdrawalPhotosForPlantingSite - plantingSiteId:', plantingSiteId);
  console.log('useWithdrawalPhotosForPlantingSite - skip:', skip);

  const { data: withdrawalsData } = useSearchNurseryWithdrawalsQuery({ organizationId, plantingSiteId }, { skip });

  const withdrawals = useMemo(() => (!skip ? withdrawalsData ?? [] : []), [skip, withdrawalsData]);
  console.log('useWithdrawalPhotosForPlantingSite - withdrawals:', withdrawals);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (skip) {
      return;
    }
    const promises = withdrawals.map((withdrawal) =>
      dispatch(nurseryWithdrawalsApi.endpoints.listWithdrawalPhotos.initiate(withdrawal.withdrawalId))
    );
    return () => {
      promises.forEach((promise) => promise.unsubscribe());
    };
  }, [dispatch, skip, withdrawals]);

  const photosByWithdrawal = useAppSelector((state) =>
    withdrawals.map((withdrawal) => ({
      withdrawal,
      result: nurseryWithdrawalsApi.endpoints.listWithdrawalPhotos.select(withdrawal.withdrawalId)(state),
    }))
  );

  return useMemo((): WithdrawalPhotoEntry[] => {
    return photosByWithdrawal.flatMap(({ withdrawal, result }) =>
      (result.data?.photos ?? [])
        .filter((photo): photo is typeof photo & { gpsCoordinates: Point } => !!photo.gpsCoordinates)
        .map((photo) => ({
          gpsCoordinates: photo.gpsCoordinates,
          photoId: photo.id,
          withdrawalId: withdrawal.withdrawalId,
          withdrawnDate: withdrawal.withdrawnDate,
        }))
    );
  }, [photosByWithdrawal]);
};

export default useWithdrawalPhotosForPlantingSite;
