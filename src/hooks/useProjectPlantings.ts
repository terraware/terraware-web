import { useEffect, useMemo, useState } from 'react';

import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { selectOrganizationReportedPlants } from 'src/redux/features/tracking/trackingSelectors';
import { requestOrganizationReportedPlants } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { PlantingSiteReportedPlants } from 'src/types/PlantingSite';

export const useProjectPlantings = (projectId?: number, organizationId?: number) => {
  const dispatch = useAppDispatch();
  const [reportedPlantsRequestId, setReportedPlantsRequestId] = useState<string>('');
  const [reportedPlants, setReportedPlants] = useState<PlantingSiteReportedPlants[]>([]);
  const reportedPlantsResponse = useAppSelector(selectOrganizationReportedPlants(reportedPlantsRequestId));
  const { allPlantingSites, setAcceleratorOrganizationId } = usePlantingSiteData();
  const [projectPlantingSitesIds, setProjectPlantingSitesIds] = useState<string[]>();

  useEffect(() => {
    if (allPlantingSites && projectId) {
      setProjectPlantingSitesIds(
        allPlantingSites.filter((ps) => ps.projectId === projectId).map((ps) => ps.id.toString())
      );
    }
  }, [allPlantingSites, projectId]);

  useEffect(() => {
    if (reportedPlantsResponse?.status === 'success') {
      setReportedPlants(
        reportedPlantsResponse.data?.filter((sitePlants) =>
          projectPlantingSitesIds?.includes(sitePlants.id.toString())
        ) ?? []
      );
    }
  }, [reportedPlantsResponse]);

  useEffect(() => {
    if (organizationId) {
      setAcceleratorOrganizationId(organizationId);
      const reportedPlantsRequest = dispatch(requestOrganizationReportedPlants(organizationId));
      setReportedPlantsRequestId(reportedPlantsRequest.requestId);
    }
  }, [organizationId]);

  return useMemo(
    () => ({
      reportedPlants,
    }),
    [reportedPlants]
  );
};
