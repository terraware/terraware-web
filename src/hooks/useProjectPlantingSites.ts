import { useEffect, useMemo } from 'react';

import { useLocalization } from 'src/providers';
import { useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';

type UseProjectPlantingSitesProps = {
  full?: boolean;
  projectId: number;
};

const useProjectPlantingSites = ({ full, projectId }: UseProjectPlantingSitesProps) => {
  const { activeLocale } = useLocalization();
  const [listPlantingSites, listPlantingSitesResponse] = useLazyListPlantingSitesQuery();

  const plantingSites = useMemo(
    () =>
      (listPlantingSitesResponse.currentData?.sites ?? []).toSorted((a, b) =>
        a.name.localeCompare(b.name, activeLocale || undefined)
      ),
    [activeLocale, listPlantingSitesResponse]
  );

  useEffect(() => {
    void listPlantingSites({ projectId, full });
  }, [full, listPlantingSites, projectId]);

  return {
    isLoading: listPlantingSitesResponse.isFetching,
    isSuccess: listPlantingSitesResponse.isSuccess,
    plantingSites,
  };
};

export default useProjectPlantingSites;
