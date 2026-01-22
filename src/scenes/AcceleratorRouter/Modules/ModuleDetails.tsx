import React, { type JSX, useEffect, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import Table from 'src/components/common/table';
import { requestListModuleCohorts } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModuleCohorts } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Module } from 'src/types/Module';

import CohortsAndProjectsRenderer from './CohortsAndProjectsRenderer';

interface ModuleDetailsProps {
  moduleId: string;
  module?: Module;
}

type CohortsTableRow = {
  cohortId: number;
  cohortName: string;
  startDate: string;
  endDate: string;
};

const columns = (): TableColumnType[] => [
  {
    key: 'cohortName',
    name: strings.COHORT,
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
  const dispatch = useAppDispatch();
  const result = useAppSelector(selectModuleCohorts(moduleId));
  const [tableRows, setTableRows] = useState<CohortsTableRow[]>();

  useEffect(() => {
    if (module?.id) {
      void dispatch(requestListModuleCohorts(moduleId));
    }
  }, [module?.id, dispatch, moduleId]);

  useEffect(() => {
    if (result?.status === 'success') {
      const rows: CohortsTableRow[] = [];
      const cohortModules = result.data?.cohortModules;
      cohortModules?.forEach((cm) => {
        rows.push({
          cohortId: cm.cohort.id,
          cohortName: cm.cohort.name,
          startDate: cm.startDate,
          endDate: cm.endDate,
        });
      });

      setTableRows(rows);
    }
  }, [result]);

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
            {strings.COHORTS}
          </Typography>
          <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxt}>
            {strings.MODULE_COHORTS_DESCRIPTION}
          </Typography>
          <Box paddingTop={4}>
            <Table
              rows={tableRows || []}
              columns={columns}
              id={'module-cohorts-and-projects'}
              orderBy={'cohortName'}
              Renderer={CohortsAndProjectsRenderer}
            />
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}
