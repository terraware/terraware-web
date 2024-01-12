import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';

export type DetailsProps = {
  onChange: (id: string, value: unknown) => void;
  site: PlantingSite;
};

export default function Details(props: DetailsProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box display='flex' flexDirection='column'>
      <Typography fontSize='20px' fontWeight={600} lineHeight='28px' color={theme.palette.TwClrTxt}>
        {strings.DETAILS}
      </Typography>
    </Box>
  );
}
