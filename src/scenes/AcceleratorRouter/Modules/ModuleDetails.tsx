import React, { type JSX, useEffect, useMemo } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import Table from 'src/components/common/table';
import { useLazyGetModuleProjectsQuery } from 'src/queries/search/projectModules';
import strings from 'src/strings';
import { Module } from 'src/types/Module';

import ModuleProjectRenderer from './ModuleProjectRenderer';

interface ModuleDetailsProps {
  moduleId: string;
  module?: Module;
}

const columns = (): TableColumnType[] => [
  {
    key: 'projectName',
    name: strings.PROJECT,
    type: 'string',
  },
  {
    key: 'startDate',
    name: strings.START_DATE,
    type: 'string',
  },
  {
    key: 'endDate',
    name: strings.END_DATE,
    type: 'string',
  },
];

export default function ModuleDetails({ moduleId, module }: ModuleDetailsProps): JSX.Element {
  const theme = useTheme();
  const [requestListModuleProjects, moduleProjectsListResponse] = useLazyGetModuleProjectsQuery();

  useEffect(() => {
    if (module?.id) {
      void requestListModuleProjects(moduleId);
    }
  }, [module?.id, moduleId, requestListModuleProjects]);

  const tableRows = useMemo(() => {
    if (moduleProjectsListResponse.isSuccess) {
      return moduleProjectsListResponse.data;
    }
    return [];
  }, [moduleProjectsListResponse]);

  return (
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
        marginBottom={theme.spacing(3)}
        paddingBottom={theme.spacing(3)}
      >
        <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt} sx={{ flexGrow: 1 }}>
          {strings.DETAILS}
        </Typography>
      </Box>
      <Grid container>
        <Grid
          item
          sx={{ borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
          marginBottom={theme.spacing(3)}
          paddingBottom={theme.spacing(3)}
        >
          <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt}>
            {strings.OVERVIEW}
          </Typography>
          <Box dangerouslySetInnerHTML={{ __html: module?.overview || '' }} />
        </Grid>
        <Grid item xs={12}>
          <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt} paddingBottom={1}>
            {strings.PROJECTS}
          </Typography>
          <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxt}>
            {strings.MODULE_PROJECTS_DESCRIPTION}
          </Typography>
          <Box paddingTop={4}>
            <Table
              rows={tableRows}
              columns={columns}
              id={'module-projects'}
              orderBy={'projectName'}
              Renderer={ModuleProjectRenderer}
            />
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}
