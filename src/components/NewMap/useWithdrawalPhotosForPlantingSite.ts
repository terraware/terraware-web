import { WithdrawalPhotoSearchEntry, useSearchNurseryWithdrawalPhotosQuery } from 'src/queries/search/nurseries';

export type WithdrawalPhotoEntry = WithdrawalPhotoSearchEntry;

type UseWithdrawalPhotosForPlantingSiteArgs = {
  enabled?: boolean;
  organizationId?: number;
  plantingSiteId?: number;
};

const useWithdrawalPhotosForPlantingSite = ({
  enabled = true,
  plantingSiteId,
}: UseWithdrawalPhotosForPlantingSiteArgs): WithdrawalPhotoEntry[] => {
  const skip = !enabled || plantingSiteId === undefined;

  const { data } = useSearchNurseryWithdrawalPhotosQuery({ plantingSiteId: plantingSiteId! }, { skip });
  console.log('useWithdrawalPhotosForPlantingSite', { data, skip });

  return skip ? [] : data ?? [];
};

export default useWithdrawalPhotosForPlantingSite;
