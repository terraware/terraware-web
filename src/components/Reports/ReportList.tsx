import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Container, Grid, Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import Table from 'src/components/common/table';
import TfMain from 'src/components/common/TfMain';
import ReportService from 'src/services/ReportService';
import strings from 'src/strings';
import { ListReport } from 'src/types/Report';
import PageHeaderWrapper from '../common/PageHeaderWrapper';
import ReportsCellRenderer from './TableCellRenderer';
import { useLocalization, useOrganization } from 'src/providers';

export default function ReportList(): JSX.Element {
  const contentRef = useRef(null);
  const [results, setResults] = useState<ListReport[]>([]);
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const columns: TableColumnType[] = useMemo(
    () =>
      activeLocale
        ? [
            { key: 'name', name: strings.REPORT, type: 'string' },
            { key: 'status', name: strings.STATUS, type: 'string' },
            { key: 'modifiedByName', name: strings.LAST_EDITED_BY, type: 'string' },
            { key: 'submittedByName', name: strings.SUBMITTED_BY, type: 'string' },
            { key: 'submittedTime', name: strings.DATE_SUBMITTED, type: 'string' },
          ]
        : [],
    [activeLocale]
  );

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
        <Container
          ref={contentRef}
          maxWidth={false}
          sx={{ padding: 3, borderRadius: 4, backgroundColor: theme.palette.TwClrBaseWhite }}
        >
          <Grid item xs={12}>
            <Table id='reports-table' columns={columns} rows={results} orderBy='name' Renderer={ReportsCellRenderer} />
          </Grid>
        </Container>
      </Grid>
    </TfMain>
  );
}
