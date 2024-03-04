import { Box, Typography, useTheme } from '@mui/material';

import strings from 'src/strings';
import { categoryLabel } from 'src/types/Deliverables';

import { ViewProps } from './types';

const TitleBar = ({ deliverable }: ViewProps): JSX.Element => {
  const { category, name } = deliverable;
  const theme = useTheme();

  return (
    <Box
      margin={theme.spacing(3)}
      alignItems='center'
      justifyContent='space-between'
      display='flex'
      flexDirection='row'
    >
      <Box display='flex' flexDirection='column'>
        <Typography fontSize='14px' lineHeight='20px' fontWeight={400} color={theme.palette.TwClrTxt}>
          {strings.formatString(strings.DELIVERABLE_PROJECT, deliverable.projectName ?? '')}
        </Typography>
        <Typography
          fontSize='24px'
          lineHeight='32px'
          fontWeight={600}
          color={theme.palette.TwClrTxt}
          margin={theme.spacing(1, 0)}
        >
          {name}
        </Typography>
        <Typography fontSize='14px' lineHeight='20px' fontWeight={400} color={theme.palette.TwClrTxt}>
          {strings.formatString(strings.DELIVERABLE_CATEGORY, categoryLabel(category))}
        </Typography>
      </Box>
    </Box>
  );
};

export default TitleBar;
