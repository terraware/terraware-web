import { Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import Card from 'src/components/common/Card';
import NurseryWithdrawalsTable from './NurseryWithdrawalsTable';
import { PlantingSite } from 'src/types/Tracking';

type NurseryWithdrawalsTabContentProps = {
  selectedPlantingSite: PlantingSite;
};

export default function NurseryWithdrawalsTabContent({
  selectedPlantingSite,
}: NurseryWithdrawalsTabContentProps): JSX.Element {
  const theme = useTheme();

  return (
    <Card flushMobile>
      <Typography
        sx={{
          fontSize: '20px',
          fontWeight: 600,
          color: theme.palette.TwClrTxt,
          marginBottom: theme.spacing(2),
        }}
      >
        {strings.WITHDRAWAL_HISTORY}
      </Typography>
      <NurseryWithdrawalsTable selectedPlantingSite={selectedPlantingSite} />
    </Card>
  );
}
