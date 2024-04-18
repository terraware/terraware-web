import { Box, Grid, Typography } from '@mui/material';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import strings from 'src/strings';

const CurrentModule = () => {
  const { currentModule, currentParticipantProject } = useParticipantData();

  if (!currentModule || !currentParticipantProject) {
    return null;
  }

  return (
    <Card>
      <Grid container flexDirection={'column'}>
        <Grid item xs={7}>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justifyContent={'space-between'}>
                <Grid item>
                  {/* TODO when backend is done, this will probably change to currentModule.number or something, the ID is likely to be an increment ID */}
                  <Typography fontSize={'16px'} fontWeight={500} lineHeight={'24px'}>
                    {strings.formatString(strings.MODULE_NAME_OVERVIEW, currentModule.name)}
                  </Typography>
                </Grid>
                <Grid item>
                  <Link
                    to={APP_PATHS.PROJECT_MODULES.replace(':projectId', `${currentParticipantProject.id}`)}
                    fontSize={16}
                    fontWeight={500}
                  >
                    {strings.SEE_ALL_MODULES}
                  </Link>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography fontSize={'24px'} fontWeight={600} lineHeight={'32px'}>
                {currentModule.title}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Box dangerouslySetInnerHTML={{ __html: currentModule.description }} />
            </Grid>

            <Grid item xs={12}>
              <Typography fontSize={'20px'} fontWeight={600} lineHeight={'28px'}>
                {strings.THIS_MODULE_CONTAINS}
              </Typography>
            </Grid>

            {/* TODO module links will come after BE sync */}
          </Grid>
        </Grid>
        <Grid item xs={5} />
      </Grid>
    </Card>
  );
};

export default CurrentModule;
