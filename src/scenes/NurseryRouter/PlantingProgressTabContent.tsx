import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { useTheme } from '@mui/material';

import ListMapView from 'src/components/ListMapView';
import Card from 'src/components/common/Card';
import { View } from 'src/components/common/ListMapSelector';
import PlantingSiteSelector from 'src/components/common/PlantingSiteSelector';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import PlantingProgressList from './PlantingProgressList';
import PlantingProgressMap from './PlantingProgressMap';

const initialView: View = 'list';

export default function PlantingProgress(): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [view, setView] = useState<View>(initialView);

  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number>();

  const [getPlantingSite, getPlantingSiteResponse] = useLazyGetPlantingSiteQuery();
  const plantingSite = useMemo(() => getPlantingSiteResponse.currentData?.site, [getPlantingSiteResponse]);

  useEffect(() => {
    if (selectedPlantingSiteId) {
      void getPlantingSite({ id: selectedPlantingSiteId }, true);
    }
  }, [getPlantingSite, selectedPlantingSiteId]);

  return (
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <ListMapView
        data={plantingSite?.strata}
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
        search={view === 'map' ? <PlantingSiteSelector onChange={setSelectedPlantingSiteId} /> : undefined}
      />
    </Card>
  );
}
