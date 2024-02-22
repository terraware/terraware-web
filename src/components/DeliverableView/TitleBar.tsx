import { Box, Grid, useTheme } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import BackToLink from 'src/components/common/BackToLink';
import { EditProps } from './types';

const TitleBar = ({ isAcceleratorConsole }: EditProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Box display='flex' flexDirection='column'>
      <Grid item xs={12} marginBottom={theme.spacing(3)}>
        <BackToLink
          id='back'
          to={isAcceleratorConsole ? APP_PATHS.ACCELERATOR_DELIVERABLES : APP_PATHS.DELIVERABLES}
          name={strings.DELIVERABLES}
        />
      </Grid>
      TitleBar coming soon!
    </Box>
  );
};

export default TitleBar;
