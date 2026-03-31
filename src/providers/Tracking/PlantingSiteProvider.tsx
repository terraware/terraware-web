import React, { useCallback, useMemo, useState } from 'react';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';

import { useLocalization, useOrganization } from '../hooks';
import { PlantingSiteContext, PlantingSiteData } from './PlantingSiteContext';

export type Props = {
  children: React.ReactNode;
};

const PlantingSiteProvider = ({ children }: Props) => {
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();

  const [acceleratorOrganizationId, setAcceleratorOrganizationId] = useState<number>();
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number>();

  const orgId = isAcceleratorRoute ? acceleratorOrganizationId : selectedOrganization?.id;

  const plantingSitesQuery = useListPlantingSitesQuery(
    { organizationId: orgId!, full: true, includeZones: false },
    { skip: !orgId }
  );
  const plantingSites = plantingSitesQuery.data?.sites;

  const allSitesOption = useMemo(() => {
    if (activeLocale && orgId) {
      return {
        name: strings.ALL_PLANTING_SITES,
        id: -1,
        adHocPlots: [],
        organizationId: orgId,
        plantingSeasons: [],
      };
    }
  }, [activeLocale, orgId]);

  const setSelectedPlantingSite = useCallback(
    (plantingSiteId?: number) => {
      let foundSite = plantingSites?.find((site) => site.id === plantingSiteId);
      if (plantingSiteId === -1 && (plantingSites?.length || 0) > 0) {
        foundSite = allSitesOption;
      }
      if (plantingSiteId !== foundSite?.id) {
        setSelectedPlantingSiteId(plantingSiteId);
      }
    },
    [plantingSites, allSitesOption]
  );

  const { refetch: refetchSites } = plantingSitesQuery;

  const reload = useCallback(() => {
    void refetchSites();
  }, [refetchSites]);

  const value = useMemo(
    (): PlantingSiteData => ({
      acceleratorOrganizationId,
      selectedPlantingSiteId,
      setAcceleratorOrganizationId,
      setSelectedPlantingSite,
      reload,
    }),
    [acceleratorOrganizationId, selectedPlantingSiteId, setAcceleratorOrganizationId, setSelectedPlantingSite, reload]
  );

  return <PlantingSiteContext.Provider value={value}>{children}</PlantingSiteContext.Provider>;
};

export default PlantingSiteProvider;
