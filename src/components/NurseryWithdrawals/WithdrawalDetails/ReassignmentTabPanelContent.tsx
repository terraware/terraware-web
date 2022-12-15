import { Box, Grid, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import OutplantReassignmentTable from './sections/OutplantReassignmentTable';
import { ServerOrganization } from '../../../types/Organization';
import { Species } from '../../../types/Species';
import { Batch, NurseryWithdrawal } from '../../../api/types/batch';
import { WithdrawalSummary } from '../NurseryWithdrawalsDetails';
import { Delivery } from '../../../api/types/tracking';
import OverviewItemCard from '../../common/OverviewItemCard';
import useDeviceInfo from '../../../utils/useDeviceInfo';

type ReassignmentTabPanelContentProps = {
  organization: ServerOrganization;
  species: Species[];
  plotNames: Record<number, string>;
  withdrawal?: NurseryWithdrawal;
  withdrawalSummary?: WithdrawalSummary;
  delivery?: Delivery;
  batches?: Batch[];
};

export default function ReassignmentTabPanelContent({
  organization,
  species,
  plotNames,
  withdrawal,
  withdrawalSummary,
  delivery,
}: ReassignmentTabPanelContentProps): JSX.Element {
  const { isMobile } = useDeviceInfo();

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
        {overviewCardData.map(
          (item) =>
            item.data.length > 0 && (
              <Grid item xs={isMobile ? 12 : 4} key={item.title}>
                <OverviewItemCard isEditable={false} title={item.title} contents={item.data} />
              </Grid>
            )
        )}
      </Grid>
      <OutplantReassignmentTable species={species} plotNames={plotNames} delivery={delivery} />
    </Box>
  );
}
