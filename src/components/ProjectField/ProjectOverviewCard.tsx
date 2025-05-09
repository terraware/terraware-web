import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import strings from 'src/strings';

import GridEntryWrapper from './GridEntryWrapper';
import { renderFieldValue } from './index';

type ProjectOverviewCardProps = {
  dealDescription: string | undefined;
  projectName: string | undefined;
  md: number;
};

const ProjectOverviewCard = ({ dealDescription, projectName, md }: ProjectOverviewCardProps) => {
  const theme = useTheme();
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
            {renderFieldValue(
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
                    <div>
                      <strong>{strings.NAME_USED_BY_PROJECT}:</strong>&nbsp;{projectName}
                    </div>
                  </Box>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Box>
    </GridEntryWrapper>
  );
};

export default ProjectOverviewCard;
