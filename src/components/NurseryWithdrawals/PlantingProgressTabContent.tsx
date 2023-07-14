import { Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import Card from 'src/components/common/Card';

export default function PlantingProgress(): JSX.Element {
  const theme = useTheme();

  return (
    <Card flushMobile>
      <Typography
        sx={{
          fontSize: '20px',
          fontWeight: 600,
          color: theme.palette.TwClrTxt,
        }}
      >
        {strings.PLANTING_PROGRESS}
      </Typography>
    </Card>
  );
}
