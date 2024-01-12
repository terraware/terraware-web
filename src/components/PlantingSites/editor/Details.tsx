import { useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';

export type DetailsProps = {
  onChange: (id: string, value: unknown) => void;
  onValidate?: (hasErrors: boolean) => void;
  site: PlantingSite;
};

export default function Details({ onValidate }: DetailsProps): JSX.Element {
  const theme = useTheme();

  useEffect(() => {
    // TODO implement all the Details logic
    onValidate?.(false);
  }, [onValidate]);

  return (
    <Box display='flex' flexDirection='column'>
      <Typography fontSize='20px' fontWeight={600} lineHeight='28px' color={theme.palette.TwClrTxt}>
        {strings.DETAILS}
      </Typography>
    </Box>
  );
}
