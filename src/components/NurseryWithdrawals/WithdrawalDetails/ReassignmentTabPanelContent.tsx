import { Box, Grid, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import OutplantReassignmentTable from './sections/OutplantReassignmentTable';
import { Species } from 'src/types/Species';
import { Batch, NurseryWithdrawal } from 'src/api/types/batch';
import { Delivery } from 'src/types/Tracking';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type ReassignmentTabPanelContentProps = {
  species: Species[];
  plotNames: Record<number, string>;
  withdrawal?: NurseryWithdrawal;
  delivery?: Delivery;
  batches?: Batch[];
};

export default function ReassignmentTabPanelContent({
  species,
  plotNames,
  withdrawal,
  delivery,
}: ReassignmentTabPanelContentProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

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
      data:
        delivery?.plantings
          ?.filter((planting) => planting.type === 'Reassignment To')
          ?.reduce((acc, planting) => acc + planting.numPlants, 0)
          .toString() ?? '',
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
          plotNames={plotNames}
          delivery={delivery}
          withdrawalNotes={withdrawal?.notes}
        />
      </Box>
    </Box>
  );
}
