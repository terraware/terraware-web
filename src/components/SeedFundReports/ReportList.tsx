import React, { type JSX, useEffect, useRef, useState } from 'react';

import { Grid, Typography } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import TfMain from 'src/components/common/TfMain';
import Table from 'src/components/common/table';
import { useOrganization } from 'src/providers';
import SeedFundReportService from 'src/services/SeedFundReportService';
import strings from 'src/strings';
import { ListReport } from 'src/types/Report';

import PageHeaderWrapper from '../common/PageHeaderWrapper';
import ReportsCellRenderer from './TableCellRenderer';

const columns = (): TableColumnType[] => [
  { key: 'name', name: strings.REPORT, type: 'string' },
  { key: 'status', name: strings.STATUS, type: 'string' },
  { key: 'modifiedByName', name: strings.LAST_EDITED_BY, type: 'string' },
  { key: 'submittedByName', name: strings.SUBMITTED_BY, type: 'string' },
  { key: 'submittedTime', name: strings.DATE_SUBMITTED, type: 'string' },
];

export default function ReportList(): JSX.Element {
  const contentRef = useRef(null);
  const [results, setResults] = useState<ListReport[]>([]);
  const { selectedOrganization } = useOrganization();

  useEffect(() => {
    if (selectedOrganization) {
      const refreshSearch = async () => {
        const reportsResults = await SeedFundReportService.getReports(selectedOrganization.id);
        setResults(reportsResults.reports || []);
      };

      void refreshSearch();
    }
  }, [selectedOrganization]);

  return (
    <TfMain>
      <Grid container>
        <PageHeaderWrapper nextElement={contentRef.current}>
          <Grid item xs={12} sx={{ paddingLeft: 3, marginBottom: 4 }}>
            <Typography sx={{ fontSize: '24px', fontWeight: 600 }}>{strings.REPORTS}</Typography>
          </Grid>
        </PageHeaderWrapper>
      </Grid>
      <Card flushMobile>
        <Table id='reports-table' columns={columns} rows={results} orderBy='name' Renderer={ReportsCellRenderer} />
      </Card>
    </TfMain>
  );
}
