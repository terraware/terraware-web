import { Box, Typography, useTheme } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { categoryLabel } from 'src/types/Deliverables';
import { useProjects } from 'src/hooks/useProjects';
import BackToLink from 'src/components/common/BackToLink';
import { EditProps } from './types';

const TitleBar = ({ callToAction, deliverable, isAcceleratorConsole }: EditProps): JSX.Element => {
  const { category, name } = deliverable;
  const { selectedProject } = useProjects(deliverable);
  const theme = useTheme();

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <Box marginBottom={theme.spacing(3)}>
        <BackToLink
          id='back'
          to={isAcceleratorConsole ? APP_PATHS.ACCELERATOR_DELIVERABLES : APP_PATHS.DELIVERABLES}
          name={strings.DELIVERABLES}
        />
      </Box>
      <Box
        marginRight={theme.spacing(3)}
        alignItems='center'
        justifyContent='space-between'
        display='flex'
        flexDirection='row'
      >
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='14px' lineHeight='20px' fontWeight={400} color={theme.palette.TwClrTxt}>
            {strings.formatString(strings.DELIVERABLE_PROJECT, selectedProject?.name ?? '')}
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
        {callToAction}
      </Box>
    </Box>
  );
};

export default TitleBar;
