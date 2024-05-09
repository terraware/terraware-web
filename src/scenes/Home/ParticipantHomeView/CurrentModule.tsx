import React, { Box, Grid, Typography } from '@mui/material';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import strings from 'src/strings';

const CurrentModule = () => {
  const { activeModules, currentParticipantProject } = useParticipantData();

  if (!activeModules || activeModules.length === 0 || !currentParticipantProject) {
    return null;
  }

  // Only first active modules shown for now. TODO: upgrade to support multiple active modules for overlapping modules
  const currentModule = activeModules[0];

  return (
    <Card>
      <Grid container flexDirection={'column'}>
        <Grid item xs={7}>
          <Grid container>
            <Grid item xs={12}>
              <Grid container justifyContent={'space-between'}>
                <Grid item>
                  <Typography fontSize={'16px'} fontWeight={500} lineHeight={'24px'}>
                    {strings.formatString(strings.TITLE_OVERVIEW, currentModule.title)}
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
                {currentModule.name}
              </Typography>
            </Grid>

            {currentModule.overview && (
              <Grid item xs={12}>
                <Box dangerouslySetInnerHTML={{ __html: currentModule.overview }} />
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item xs={5} />
      </Grid>
    </Card>
  );
};

export default CurrentModule;
