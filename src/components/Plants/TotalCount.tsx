import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { cardTitleStyle } from './PlantingSiteDetails';

type TotalCountProps = {
  totalCount?: number;
};

export default function TotalCount(props: TotalCountProps): JSX.Element {
  const theme = useTheme();
  const { totalCount } = props;

  return (
    <>
      <Typography sx={cardTitleStyle}>{strings.TOTAL_NUMBER_OF_PLANTS}</Typography>
      <Box sx={{ marginTop: theme.spacing(3) }}>
        <Typography fontSize='32px' fontWeight={600}>
          {totalCount || 0}
        </Typography>
      </Box>
    </>
  );
}
