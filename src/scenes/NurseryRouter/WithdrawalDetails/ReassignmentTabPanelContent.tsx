import React, { type JSX, useMemo } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { BatchPayload, DeliveryPayload, NurseryWithdrawalPayload } from 'src/queries/generated/nurseryWithdrawals';
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
  reassignmentDeliveries?: DeliveryPayload[];
};

export default function ReassignmentTabPanelContent({
  species,
  withdrawal,
  delivery,
  reassignmentDeliveries = [],
}: ReassignmentTabPanelContentProps): JSX.Element {
  const numberFormatter = useNumberFormatter();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const combinedPlantings = useMemo(
    () =>
      [delivery, ...reassignmentDeliveries].flatMap((item) =>
        item ? item.plantings.map((planting) => ({ ...planting, plantingSiteId: item.plantingSiteId })) : []
      ),
    [delivery, reassignmentDeliveries]
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
