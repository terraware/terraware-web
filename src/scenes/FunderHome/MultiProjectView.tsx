import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import TfMain from 'src/components/common/TfMain';
import { useLocalization } from 'src/providers';
import { FunderProjectDetails } from 'src/types/FunderProject';

type MultiProjectViewProps = {
  projects: FunderProjectDetails[];
  selectProject: (projectId: number | undefined) => void;
};

const DEAL_NAME_COUNTRY_CODE_REGEX = /^[A-Z]{3}_/;

const MultiProjectView = ({ projects, selectProject }: MultiProjectViewProps) => {
  const { strings, activeLocale } = useLocalization();
  const theme = useTheme();

  return (
    <TfMain>
      <Box
        component='main'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: theme.spacing(2),
          gap: theme.spacing(3),
        }}
      >
        <Typography fontWeight={600} lineHeight={'40px'} fontSize={'24px'}>
          {strings.ALL_PROJECTS}
        </Typography>
        {projects
          .map((p) => {
            return {
              ...p,
              strippedDealName: p.dealName?.replace(DEAL_NAME_COUNTRY_CODE_REGEX, ''),
            };
          })
          .sort((a, b) => a.strippedDealName?.localeCompare(b.strippedDealName || '', activeLocale || undefined) || 0)
          .map((project, index: number) => (
            <Box key={index} onClick={() => selectProject(project.projectId)}>
              <Card
                style={{
                  borderRadius: theme.spacing(1),
                  border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                  cursor: 'pointer',
                }}
              >
                <Typography color={theme.palette.TwClrTxt} fontSize='20px' fontWeight={600} lineHeight='28px'>
                  {project.dealName?.replace(DEAL_NAME_COUNTRY_CODE_REGEX, '')}
                </Typography>
              </Card>
            </Box>
          ))}
      </Box>
    </TfMain>
  );
};

export default MultiProjectView;
