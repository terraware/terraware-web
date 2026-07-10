import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { useTheme } from '@mui/material';

import ListMapView from 'src/components/ListMapView';
import Card from 'src/components/common/Card';
import { View } from 'src/components/common/ListMapSelector';
import PlantingSiteSelector from 'src/components/common/PlantingSiteSelector';
import { useOrganization } from 'src/providers';
import { useLazyGetPlantingSiteQuery, useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import PlantingProgressList from './PlantingProgressList';
import PlantingProgressMap from './PlantingProgressMap';

const initialView: View = 'list';

export default function PlantingProgress(): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const [view, setView] = useState<View>(initialView);

  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number | undefined>();

  const [getPlantingSite, getPlantingSiteResponse] = useLazyGetPlantingSiteQuery();
  const plantingSite = useMemo(() => getPlantingSiteResponse.currentData?.site, [getPlantingSiteResponse]);

  const [listPlantingSites, listPlantingSitesResponse] = useLazyListPlantingSitesQuery();
  const allOrgSites = useMemo(
    () => listPlantingSitesResponse.currentData?.sites ?? [],
    [listPlantingSitesResponse.currentData?.sites]
  );

  useEffect(() => {
    if (selectedPlantingSiteId !== undefined) {
      void getPlantingSite({ id: selectedPlantingSiteId }, true);
    } else if (selectedOrganization) {
      void listPlantingSites({ organizationId: selectedOrganization.id, full: true, includeStrata: false }, true);
    }
  }, [getPlantingSite, listPlantingSites, selectedPlantingSiteId, selectedOrganization]);

  const aggregatedStrata = useMemo(() => {
    if (selectedPlantingSiteId === undefined) {
      return allOrgSites.flatMap((site) => site.strata ?? []);
    }
    return plantingSite?.strata;
  }, [allOrgSites, plantingSite, selectedPlantingSiteId]);

  return (
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <ListMapView
        data={aggregatedStrata}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          padding: isMobile ? theme.spacing(3) : 0,
        }}
        initialView={initialView}
        list={<PlantingProgressList />}
        map={<PlantingProgressMap plantingSiteId={selectedPlantingSiteId} />}
        onView={setView}
        search={
          view === 'map' ? <PlantingSiteSelector onChange={setSelectedPlantingSiteId} allowAllOption /> : undefined
        }
      />
    </Card>
  );
}
