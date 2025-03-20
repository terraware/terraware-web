import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import Card from 'src/components/common/Card';
import { FilterConfigWithValues } from 'src/components/common/SearchFiltersWrapperV2';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { selectListAcceleratorReports } from 'src/redux/features/reports/reportsSelectors';
import { requestListAcceleratorReports } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ListAcceleratorReportsRequestParams } from 'src/services/AcceleratorReportService';
import strings from 'src/strings';
import { AcceleratorReport, AcceleratorReportStatuses } from 'src/types/AcceleratorReport';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

import ReportCellRenderer from './ReportCellRenderer';

const defaultSearchOrder: SearchSortOrder = {
  field: 'status',
  direction: 'Ascending',
};

export default function ReportsList(): JSX.Element {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { currentParticipantProject } = useParticipantData();

  const [acceleratorReports, setAcceleratorReports] = useState<AcceleratorReport[]>([]);
  const [listAcceleratorReportsRequestId, setListAcceleratorReportsRequestId] = useState<string>('');

  const acceleratorReportsListRequest = useAppSelector(selectListAcceleratorReports(listAcceleratorReportsRequestId));

  useEffect(() => {
    if (acceleratorReportsListRequest?.status === 'success') {
      const nextAcceleratorReports = acceleratorReportsListRequest?.data || [];

      setAcceleratorReports(nextAcceleratorReports);
    }
  }, [acceleratorReportsListRequest]);

  const gridStyle = {
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(4),
  };

  const columns = useCallback(
    (activeLocale: string | null): TableColumnType[] => {
      if (!activeLocale) {
        return [];
      }

      return [
        {
          key: 'report',
          name: strings.REPORT,
          type: 'string',
        },
        {
          key: 'status',
          name: strings.STATUS,
          type: 'string',
        },
        {
          key: 'year',
          name: strings.YEAR,
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

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) => {
      if (!currentParticipantProject?.id) {
        return;
      }

      const params: ListAcceleratorReportsRequestParams = {};

      const request = dispatch(
        requestListAcceleratorReports({
          locale,
          params,
          projectId: currentParticipantProject.id,
          search,
          searchSortOrder,
        })
      );
      setListAcceleratorReportsRequestId(request.requestId);
    },
    [currentParticipantProject?.id, dispatch]
  );

  const isAcceleratorRoute = false;

  const fuzzySearchColumns = useMemo(
    () => (isAcceleratorRoute ? ['name', 'projectDealName'] : ['report', 'modifiedBy', 'submittedBy']),
    [isAcceleratorRoute]
  );

  const availableYears = useMemo(() => {
    const years = acceleratorReports.map((report) => report.startDate?.split('-')?.[0]);
    const uniqueYears = Array.from(new Set(years));
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
      {
        field: 'year',
        label: strings.YEAR,
        options: availableYears,
      },
    ];

    return activeLocale ? filters : [];
  }, [activeLocale, availableYears, isAcceleratorRoute]);

  return (
    <Card style={{ display: 'flex', flexDirection: 'column' }} title={strings.REPORTS}>
      <Grid container sx={gridStyle}>
        <Grid item xs={12} textAlign={'center'}>
          <TableWithSearchFilters
            columns={columns}
            defaultSearchOrder={defaultSearchOrder}
            dispatchSearchRequest={dispatchSearchRequest}
            featuredFilters={featuredFilters}
            fuzzySearchColumns={fuzzySearchColumns}
            id='accelerator-reports-table'
            isClickable={() => false}
            Renderer={ReportCellRenderer}
            rows={acceleratorReports}
            showTopBar={false}
            stickyFilters={false}
          />
        </Grid>
      </Grid>
    </Card>
  );
}
