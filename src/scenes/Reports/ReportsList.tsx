import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { Select, TableColumnType, theme } from '@terraware/web-components';

import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import Card from 'src/components/common/Card';
import { FilterConfigWithValues } from 'src/components/common/SearchFiltersWrapperV2';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { selectListAcceleratorReports } from 'src/redux/features/reports/reportsSelectors';
import { requestListAcceleratorReports } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorReport, AcceleratorReportStatuses } from 'src/types/AcceleratorReport';
import { SearchSortOrder } from 'src/types/Search';

import ReportCellRenderer from './ReportCellRenderer';

type AcceleratorReportRow = AcceleratorReport & {
  reportName?: string;
  year?: string;
};

const defaultSearchOrder: SearchSortOrder = {
  field: 'reportName',
  direction: 'Descending',
};

export default function ReportsList(): JSX.Element {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { currentParticipantProject } = useParticipantData();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const [yearFilter, setYearFilter] = useState<string>();
  const [acceleratorReports, setAcceleratorReports] = useState<AcceleratorReportRow[]>([]);
  const [listAcceleratorReportsRequestId, setListAcceleratorReportsRequestId] = useState<string>('');

  const acceleratorReportsListRequest = useAppSelector(selectListAcceleratorReports(listAcceleratorReportsRequestId));

  useEffect(() => {
    if (acceleratorReportsListRequest?.status === 'success') {
      setAcceleratorReports(() => {
        const reports = acceleratorReportsListRequest?.data?.map((report) => {
          const year = report.startDate.split('-')[0];
          const quarterNumber = report.startDate ? Math.ceil((new Date(report.startDate).getMonth() + 1) / 3) : 0;
          const reportName = report.frequency === 'Annual' ? `${year}` : `${year}-Q${quarterNumber}`;

          return {
            ...report,
            reportName,
            year,
          };
        });
        return reports || [];
      });
    }
  }, [acceleratorReportsListRequest]);

  useEffect(() => {
    reload();
  }, [currentParticipantProject?.id, yearFilter]);

  const columns = useCallback(
    (activeLocale: string | null): TableColumnType[] => {
      if (!activeLocale) {
        return [];
      }

      return [
        {
          key: 'reportName',
          name: strings.REPORT,
          type: 'string',
        },
        {
          key: 'status',
          name: strings.STATUS,
          type: 'string',
        },
        {
          key: 'modifiedBy',
          name: strings.LAST_EDITED_BY,
          type: 'string',
        },
        {
          key: 'submittedBy',
          name: strings.SUBMITTED_BY,
          type: 'string',
        },
        {
          key: 'submittedTime',
          name: strings.DATE_SUBMITTED,
          type: 'string',
        },
      ];
    },
    [activeLocale, strings]
  );

  const reload = useCallback(() => {
    if (currentParticipantProject?.id) {
      const request = dispatch(
        requestListAcceleratorReports({
          projectId: currentParticipantProject.id.toString(),
          includeFuture: true,
          includeMetrics: true,
          year: yearFilter,
        })
      );
      setListAcceleratorReportsRequestId(request.requestId);
    }
  }, [currentParticipantProject?.id, dispatch, yearFilter]);

  const fuzzySearchColumns = useMemo(() => ['reportName'], []);

  const availableYears = useMemo(() => {
    const years = acceleratorReports.map((report) => report.startDate?.split('-')?.[0]);
    const uniqueYears = Array.from(new Set(years)).sort((a, b) => (b || '').localeCompare(a || ''));
    return uniqueYears;
  }, [acceleratorReports]);

  const featuredFilters: FilterConfigWithValues[] = useMemo(() => {
    const rejectedStatus = activeLocale ? (isAcceleratorRoute ? strings.UPDATE_REQUESTED : strings.UPDATE_NEEDED) : '';
    const filters: FilterConfigWithValues[] = [
      {
        field: 'status',
        label: strings.STATUS,
        options: AcceleratorReportStatuses,
        pillValueRenderer: (values: (string | number | null)[]) =>
          values.map((value) => (value === 'Rejected' ? rejectedStatus : value)).join(', '),
        renderOption: (value: string | number) => (value.toString() === 'Rejected' ? rejectedStatus : value.toString()),
      },
    ];

    return activeLocale ? filters : [];
  }, [activeLocale, isAcceleratorRoute]);

  const extraFilter = useMemo(
    () =>
      activeLocale ? (
        <>
          <Box marginTop={0.5} paddingLeft={1}>
            <Select
              fullWidth
              id='yearFilter'
              label={''}
              onChange={(year: string) => setYearFilter(year)}
              options={availableYears}
              placeholder={strings.YEAR}
              selectedValue={yearFilter}
            />
          </Box>
        </>
      ) : null,
    [activeLocale, availableYears, yearFilter]
  );

  useEffect(() => {
    if (!yearFilter) {
      setYearFilter(availableYears[0]);
    }
  }, [availableYears, yearFilter]);

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', paddingLeft: 0, paddingRight: 0 }}>
      <Grid container sx={{}}>
        <Grid item xs={12} paddingLeft={3}>
          <Typography color={theme.palette.TwClrTxt} fontSize='20px' fontWeight={600} lineHeight='28px'>
            {strings.REPORTS}
          </Typography>
        </Grid>

        <Grid item xs={12} textAlign={'center'}>
          <ClientSideFilterTable
            busy={acceleratorReportsListRequest?.status === 'pending'}
            columns={columns}
            defaultSortOrder={defaultSearchOrder}
            extraComponent={extraFilter}
            featuredFilters={featuredFilters}
            fuzzySearchColumns={fuzzySearchColumns}
            id='accelerator-reports-table'
            isClickable={() => false}
            Renderer={ReportCellRenderer}
            rows={acceleratorReports}
            stickyFilters
          />
        </Grid>
      </Grid>
    </Card>
  );
}
