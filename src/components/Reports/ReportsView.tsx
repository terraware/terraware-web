import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Container, Grid, Tab, Typography, useTheme } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { TableColumnType } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import Table from 'src/components/common/table';
import ReportService from 'src/services/ReportService';
import strings from 'src/strings';
import { ListReport } from 'src/types/Report';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import { useOrganization } from 'src/providers';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import ReportsCellRenderer from 'src/components/Reports/TableCellRenderer';
import TfMain from 'src/components/common/TfMain';
import PageHeader from 'src/components/seeds/PageHeader';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectReportsSettings } from 'src/redux/features/reportsSettings/reportsSettingsSelectors';
import { requestReportsSettings } from 'src/redux/features/reportsSettings/reportsSettingsThunks';
import PreSetupView from 'src/components/Reports/PreSetupView';

const columns = (): TableColumnType[] => [
  { key: 'name', name: strings.REPORT, type: 'string' },
  { key: 'status', name: strings.STATUS, type: 'string' },
  { key: 'modifiedByName', name: strings.LAST_EDITED_BY, type: 'string' },
  { key: 'submittedByName', name: strings.SUBMITTED_BY, type: 'string' },
  { key: 'submittedTime', name: strings.DATE_SUBMITTED, type: 'string' },
];

const DEFAULT_TAB = 'reports';
const TABS = ['reports', 'settings'];

export default function ReportListV2(): JSX.Element {
  const dispatch = useAppDispatch();
  const contentRef = useRef(null);
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const query = useQuery();
  const history = useHistory();
  const location = useStateLocation();

  const reportsSettings = useAppSelector(selectReportsSettings);

  const tab = (query.get('tab') || '').toLowerCase();
  const preselectedTab = TABS.indexOf(tab) === -1 ? DEFAULT_TAB : tab;

  const [selectedTab, setSelectedTab] = useState(preselectedTab);
  const [results, setResults] = useState<ListReport[]>([]);

  useEffect(() => {
    void dispatch(requestReportsSettings(selectedOrganization.id));
  }, [dispatch, selectedOrganization.id]);

  useEffect(() => {
    const refreshSearch = async () => {
      const reportsResults = await ReportService.getReports(selectedOrganization.id);
      setResults(reportsResults.reports || []);
    };

    void refreshSearch();
  }, [selectedOrganization.id]);

  useEffect(() => {
    setSelectedTab((query.get('tab') || DEFAULT_TAB) as string);
  }, [query]);

  const handleTabChange = useCallback(
    (newValue: string) => {
      query.set('tab', newValue);
      history.push(getLocation(location.pathname, location, query.toString()));
    },
    [query, history, location]
  );

  const tabHeaderProps = useMemo(
    () => ({
      borderBottom: 1,
      borderColor: 'divider',
      margin: isMobile ? 0 : theme.spacing(0, 4),
    }),
    [isMobile, theme]
  );

  const tabPanelProps = useMemo(
    () => ({
      borderRadius: isMobile ? '0 0 16px 16px' : '32px',
      backgroundColor: theme.palette.TwClrBg,
    }),
    [isMobile, theme]
  );

  const tabStyles = useMemo(
    () => ({
      fontSize: '14px',
      padding: theme.spacing(1, 2),
      minHeight: theme.spacing(4.5),
      textTransform: 'capitalize',
      '&.Mui-selected': {
        color: theme.palette.TwClrTxtBrand as string,
        fontWeight: 500,
      },
    }),
    [theme]
  );

  const tabIndicatorProps = useMemo(
    () => ({
      style: {
        background: theme.palette.TwClrBgBrand,
        height: '4px',
        borderRadius: '4px 4px 0 0',
      },
    }),
    [theme]
  );

  return reportsSettings && !reportsSettings?.isConfigured ? (
    <PreSetupView />
  ) : (
    <TfMain>
      <PageHeader title={strings.REPORTS} />
      <TabContext value={selectedTab}>
        <Box sx={tabHeaderProps}>
          <TabList
            sx={{ minHeight: theme.spacing(4.5) }}
            onChange={(unused, value) => handleTabChange(value)}
            TabIndicatorProps={tabIndicatorProps}
          >
            <Tab label={strings.REPORTS} value='reports' sx={tabStyles} />
            <Tab label={strings.SETTINGS} value='settings' sx={tabStyles} />
          </TabList>
        </Box>
        <TabPanel value='reports' sx={tabPanelProps}>
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
        </TabPanel>
        <TabPanel value='settings' sx={tabPanelProps}>
          TODO
        </TabPanel>
      </TabContext>
    </TfMain>
  );
}
