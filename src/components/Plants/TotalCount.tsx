import { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { cardTitleStyle } from './PlantingSiteDetails';
import { useUser } from 'src/providers';
import { useNumberFormatter } from 'src/utils/useNumber';

type TotalCountProps = {
  totalCount?: number;
};

export default function TotalCount(props: TotalCountProps): JSX.Element {
  const theme = useTheme();
  const { user } = useUser();
  const numberFormatter = useNumberFormatter();

  const { totalCount } = props;

  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [numberFormatter, user?.locale]);

  return (
    <>
      <Typography sx={cardTitleStyle}>{strings.TOTAL_NUMBER_OF_PLANTS}</Typography>
      <Box sx={{ marginTop: theme.spacing(3) }}>
        <Typography fontSize='32px' fontWeight={600}>
          {numericFormatter.format(totalCount || 0)}
        </Typography>
      </Box>
    </>
  );
}
