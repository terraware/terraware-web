import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Container, Grid, List, ListItem, Typography, useTheme } from '@mui/material';
import { Message, TableColumnType, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageHeader from 'src/components/PageHeader';
import PreSetupView from 'src/components/Reports/PreSetupView';
import ReportLink from 'src/components/Reports/ReportLink';
import ReportsCellRenderer from 'src/components/Reports/TableCellRenderer';
import TfMain from 'src/components/common/TfMain';
import Table from 'src/components/common/table';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import { selectReportsSettings } from 'src/redux/features/reportsSettings/reportsSettingsSelectors';
import { requestReportsSettings } from 'src/redux/features/reportsSettings/reportsSettingsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import ReportService from 'src/services/ReportService';
import strings from 'src/strings';
import { ListReport } from 'src/types/Report';

import ReportSettingsEditFormFields from './ReportSettingsEditFormFields';

const columns = (): TableColumnType[] => [
  { key: 'name', name: strings.REPORT, type: 'string' },
  { key: 'status', name: strings.STATUS, type: 'string' },
  { key: 'modifiedByName', name: strings.LAST_EDITED_BY, type: 'string' },
  { key: 'submittedByName', name: strings.SUBMITTED_BY, type: 'string' },
  { key: 'submittedTime', name: strings.DATE_SUBMITTED, type: 'string' },
];

const DEFAULT_TAB = 'reports';
type ReportsViewTabs = 'reports' | 'settings';

interface ReportsViewProps {
  tab?: ReportsViewTabs;
}

export default function ReportsView(props: ReportsViewProps): JSX.Element {
  const tab = props.tab || DEFAULT_TAB;

  const dispatch = useAppDispatch();
  const contentRef = useRef(null);
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const navigate = useNavigate();

  const reportsSettings = useAppSelector(selectReportsSettings);

  const [activeTab, setActiveTab] = useState<string>(tab);
  const [results, setResults] = useState<(ListReport & { organizationName?: string })[]>([]);

  const onTabChange = useCallback(
    (newTab: string) => {
      setActiveTab(newTab);

      switch (newTab) {
        case 'reports': {
          navigate(APP_PATHS.REPORTS);
          break;
        }
        case 'settings': {
          navigate(APP_PATHS.REPORTS_SETTINGS);
        }
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (selectedOrganization.id !== -1) {
      void dispatch(requestReportsSettings(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization.id]);

  useEffect(() => {
    if (selectedOrganization.id !== -1) {
      const refreshSearch = async () => {
        const reportsResults = await ReportService.getReports(selectedOrganization.id);
        setResults(
          (reportsResults.reports || []).map((report) => {
            if (report.projectName) {
              return report;
            }
            // Reports without a project name are for the organization
            return { ...report, organizationName: selectedOrganization.name };
          })
        );
      };

      void refreshSearch();
    }
  }, [selectedOrganization.id, selectedOrganization.name]);

  const reportsToComplete = useMemo(() => results.filter((report) => report.status !== 'Submitted'), [results]);

  return reportsSettings && results.length === 0 && !reportsSettings?.isConfigured ? (
    <PreSetupView />
  ) : (
    <TfMain>
      <PageHeader title={strings.REPORTS} />

      {reportsToComplete.length > 0 && (
        <Box sx={{ marginBottom: theme.spacing(3) }}>
          <Message
            type='page'
            priority='info'
            title={strings.COMPLETE_REPORTS}
            body={
              <>
                <Typography sx={{ margin: 0 }}>{strings.COMPLETE_REPORTS_SUBTITLE}</Typography>

                <List sx={{ listStyleType: 'disc', marginLeft: theme.spacing(4), marginTop: 0, padding: 0 }} dense>
                  {reportsToComplete.map((report, index) => (
                    <ListItem
                      key={index}
                      sx={{ display: 'list-item', color: theme.palette.TwClrTxtBrand, padding: 0 }}
                      disableGutters
                    >
                      <ReportLink report={report} />
                    </ListItem>
                  ))}
                </List>
              </>
            }
          />
        </Box>
      )}

      <Tabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        tabs={[
          {
            id: 'reports',
            label: strings.REPORTS,
            children: (
              <Grid
                container
                width={'100%'}
                sx={{
                  backgroundColor: theme.palette.TwClrBg,
                  borderRadius: isMobile ? '0 0 16px 16px' : '32px',
                  paddingTop: theme.spacing(4),
                }}
              >
                <Grid item xs={12} sx={{ paddingLeft: 4 }}>
                  <Typography variant={'h5'} sx={{ fontWeight: 600 }}>
                    {strings.REPORTS}
                  </Typography>
                </Grid>
                <Container ref={contentRef} maxWidth={false}>
                  <Grid item xs={12}>
                    <Table
                      id='reports-table'
                      columns={columns}
                      rows={results}
                      orderBy='name'
                      Renderer={ReportsCellRenderer}
                    />
                  </Grid>
                </Container>
              </Grid>
            ),
          },
          {
            id: 'settings',
            label: strings.SETTINGS,
            children: (
              <Grid
                container
                width={'100%'}
                sx={{
                  backgroundColor: theme.palette.TwClrBg,
                  borderRadius: isMobile ? '0 0 16px 16px' : '32px',
                  padding: theme.spacing(4),
                }}
              >
                {reportsSettings && (
                  <ReportSettingsEditFormFields reportsSettings={reportsSettings} isEditing={false} />
                )}
              </Grid>
            ),
          },
        ]}
      />
    </TfMain>
  );
}
