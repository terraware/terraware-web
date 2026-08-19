import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { useLazyGetDeliveryQuery } from 'src/queries/generated/deliveries';
import {
  BatchPayload,
  DeliveryPayload,
  NurseryWithdrawalPayload,
  PlantingPayload,
} from 'src/queries/generated/nurseryWithdrawals';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import OutplantReassignmentTable from './sections/OutplantReassignmentTable';

type ReassignmentTabPanelContentProps = {
  species: Species[];
  withdrawal?: NurseryWithdrawalPayload;
  delivery?: DeliveryPayload;
  batches?: BatchPayload[];
};

export default function ReassignmentTabPanelContent({
  species,
  withdrawal,
  delivery,
}: ReassignmentTabPanelContentProps): JSX.Element {
  const numberFormatter = useNumberFormatter();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const [getDelivery] = useLazyGetDeliveryQuery();
  const [linkedPlantings, setLinkedPlantings] = useState<PlantingPayload[]>([]);

  const reassignmentDeliveryIds = delivery?.reassignmentDeliveryIds;

  useEffect(() => {
    const ids = reassignmentDeliveryIds ?? [];
    if (ids.length === 0) {
      setLinkedPlantings([]);
      return;
    }

    let cancelled = false;
    void Promise.all(ids.map((id) => getDelivery(id, true).unwrap()))
      .then((responses) => {
        if (!cancelled) {
          setLinkedPlantings(responses.flatMap((response) => response.delivery.plantings));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLinkedPlantings([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [getDelivery, reassignmentDeliveryIds]);

  const combinedPlantings = useMemo(
    () => [...(delivery?.plantings ?? []), ...linkedPlantings],
    [delivery?.plantings, linkedPlantings]
  );

  const quantity = combinedPlantings
    .filter((planting) => planting.type === 'Reassignment To')
    .reduce((acc, planting) => acc + planting.numPlants, 0);

  const overviewCardData = [
    {
      title: strings.DATE,
      data: withdrawal?.withdrawnDate ?? '',
    },
    {
      title: strings.PURPOSE,
      data: strings.REASSIGNMENT,
    },
    {
      title: strings.QUANTITY,
      data: numberFormatter.format(quantity),
    },
  ];

  return (
    <Box display='flex' flexDirection='column'>
      <Typography fontSize='20px' fontWeight={600}>
        {strings.REASSIGNMENT}
      </Typography>
      <Grid container>
        {overviewCardData.map((item) => (
          <Grid item xs={isMobile ? 12 : 4} key={item.title}>
            <OverviewItemCard isEditable={false} title={item.title} contents={item.data} />
          </Grid>
        ))}
      </Grid>
      <Box marginTop={theme.spacing(3)}>
        <OutplantReassignmentTable
          species={species}
          plantings={combinedPlantings}
          withdrawalNotes={withdrawal?.notes}
        />
      </Box>
    </Box>
  );
}
