import React, { type JSX } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { useUser } from 'src/providers';
import strings from 'src/strings';
import { Batch, NurseryWithdrawal } from 'src/types/Batch';
import { Species } from 'src/types/Species';
import { Delivery } from 'src/types/Tracking';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import OutplantReassignmentTable from './sections/OutplantReassignmentTable';

type ReassignmentTabPanelContentProps = {
  species: Species[];
  substratumNames: Record<number, string>;
  withdrawal?: NurseryWithdrawal;
  delivery?: Delivery;
  batches?: Batch[];
};

export default function ReassignmentTabPanelContent({
  species,
  substratumNames,
  withdrawal,
  delivery,
}: ReassignmentTabPanelContentProps): JSX.Element {
  const { user } = useUser();
  const numberFormatter = useNumberFormatter(user?.locale);
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const quantity = delivery?.plantings
    ?.filter((planting) => planting.type === 'Reassignment To')
    ?.reduce((acc, planting) => acc + planting.numPlants, 0);

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
      data: typeof quantity === 'number' ? numberFormatter.format(quantity) : quantity,
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
          substratumNames={substratumNames}
          delivery={delivery}
          withdrawalNotes={withdrawal?.notes}
        />
      </Box>
    </Box>
  );
}
