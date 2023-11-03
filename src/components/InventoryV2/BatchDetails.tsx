import { Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import Card from 'src/components/common/Card';

type BatchDetailsProps = {};

export default function BatchDetails({}: BatchDetailsProps): JSX.Element {
  const theme = useTheme();

  return (
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt} marginBottom={theme.spacing(1)}>
        {strings.DETAILS}
      </Typography>
    </Card>
  );
}
