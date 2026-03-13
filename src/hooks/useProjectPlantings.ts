import { useEffect, useMemo, useState } from 'react';

import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { selectOrganizationReportedPlants } from 'src/redux/features/tracking/trackingSelectors';
import { requestOrganizationReportedPlants } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

export const useProjectPlantings = (projectId?: number) => {
  const dispatch = useAppDispatch();
  const [reportedPlantsRequestId, setReportedPlantsRequestId] = useState<string>('');
  const reportedPlantsResponse = useAppSelector(selectOrganizationReportedPlants(reportedPlantsRequestId));
  const { allPlantingSites, acceleratorOrganizationId } = usePlantingSiteData();

  const projectPlantingSitesIds = useMemo(
    () =>
      allPlantingSites && projectId
        ? allPlantingSites.filter((ps) => ps.projectId === projectId).map((ps) => ps.id.toString())
        : undefined,
    [allPlantingSites, projectId]
  );

  const reportedPlants = useMemo(
    () =>
      reportedPlantsResponse?.status === 'success'
        ? reportedPlantsResponse.data?.filter((sitePlants) =>
            projectPlantingSitesIds?.includes(sitePlants.id.toString())
          ) ?? []
        : [],
    [reportedPlantsResponse, projectPlantingSitesIds]
  );

  useEffect(() => {
    if (acceleratorOrganizationId) {
      const reportedPlantsRequest = dispatch(requestOrganizationReportedPlants(acceleratorOrganizationId));
      setReportedPlantsRequestId(reportedPlantsRequest.requestId);
    } else {
      setReportedPlantsRequestId('');
    }
  }, [acceleratorOrganizationId, dispatch]);

  return useMemo(
    () => ({
      reportedPlants,
    }),
    [reportedPlants]
  );
};
