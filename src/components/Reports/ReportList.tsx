import React, { useEffect, useRef, useState } from 'react';
import { Container, Grid, Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import Table from 'src/components/common/table';
import TfMain from 'src/components/common/TfMain';
import ReportService from 'src/services/ReportService';
import strings from 'src/strings';
import { ListReport } from 'src/types/Report';
import PageHeaderWrapper from '../common/PageHeaderWrapper';
import ReportsCellRenderer from './TableCellRenderer';
import { useOrganization } from 'src/providers';
import Card from 'src/components/common/Card';

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
  const theme = useTheme();

  useEffect(() => {
    const refreshSearch = async () => {
      const reportsResults = await ReportService.getReports(selectedOrganization.id);
      setResults(reportsResults.reports || []);
    };

    refreshSearch();
  }, [selectedOrganization.id]);

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
