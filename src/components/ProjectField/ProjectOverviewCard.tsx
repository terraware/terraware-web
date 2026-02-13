import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import { useLocalization } from 'src/providers';

import GridEntryWrapper from './GridEntryWrapper';
import { ProjectFieldValue } from './index';

type ProjectOverviewCardProps = {
  dealDescription: string | undefined;
  fileNaming: string | undefined;
  md: number;
  projectName: string | undefined;
};

const ProjectOverviewCard = ({ dealDescription, fileNaming, projectName, md }: ProjectOverviewCardProps) => {
  const theme = useTheme();
  const { strings } = useLocalization();

  return (
    <GridEntryWrapper md={md}>
      <Box
        borderRadius={theme.spacing(1)}
        textAlign={'left'}
        margin={`0 ${theme.spacing(1)}`}
        padding={`${theme.spacing(2, 2)}`}
        sx={{ backgroundColor: theme.palette.TwClrBaseGray050 }}
      >
        <Grid container alignContent={'center'}>
          <Grid item xs={12}>
            <Typography fontSize={'20px'} lineHeight={'28px'} fontWeight={600} marginBottom={theme.spacing(1)}>
              {strings.PROJECT_OVERVIEW}
            </Typography>
            <ProjectFieldValue
              value={
                <>
                  <Box marginBottom={theme.spacing(2)}>
                    <Textfield
                      type={'textarea'}
                      id={'deal-description'}
                      label={''}
                      display={true}
                      value={dealDescription}
                      preserveNewlines
                    />
                  </Box>
                  {projectName && (
                    <Box>
                      <Typography>
                        <Typography component='span' fontWeight={600}>
                          {strings.NAME_USED_BY_PROJECT}:&nbsp;
                        </Typography>
                        {projectName}
                      </Typography>
                    </Box>
                  )}
                  {fileNaming && (
                    <Box>
                      <Typography>
                        <Typography component='span' fontWeight={600}>
                          {strings.FILE_NAMING}:&nbsp;
                        </Typography>
                        {fileNaming}
                      </Typography>
                    </Box>
                  )}
                </>
              }
            />
          </Grid>
        </Grid>
      </Box>
    </GridEntryWrapper>
  );
};

export default ProjectOverviewCard;
