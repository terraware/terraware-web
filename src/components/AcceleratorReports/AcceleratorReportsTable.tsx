import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box } from '@mui/material';
import { Select, TableColumnType } from '@terraware/web-components';
import { DateTime } from 'luxon';

import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import { FilterConfigWithValues } from 'src/components/common/SearchFiltersWrapperV2';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { selectListAcceleratorReports } from 'src/redux/features/reports/reportsSelectors';
import { requestListAcceleratorReports } from 'src/redux/features/reports/reportsThunks';
import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorReport, AcceleratorReportStatuses } from 'src/types/AcceleratorReport';
import { SearchSortOrder } from 'src/types/Search';

import AcceleratorReportCellRenderer from './AcceleratorReportCellRenderer';

type AcceleratorReportRow = AcceleratorReport & {
  reportName?: string;
  year?: string;
};

const defaultSearchOrder: SearchSortOrder = {
  field: 'reportName',
  direction: 'Descending',
};

const columns = (activeLocale: string | null): TableColumnType[] => {
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
};

export default function AcceleratorReportsTable(): JSX.Element {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { currentParticipantProject } = useParticipantData();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const [yearFilter, setYearFilter] = useState<string>();
  const [acceleratorReports, setAcceleratorReports] = useState<AcceleratorReportRow[]>([]);
  const [allAcceleratorReports, setAllAcceleratorReports] = useState<AcceleratorReportRow[]>([]);
  const [listAcceleratorReportsRequestId, setListAcceleratorReportsRequestId] = useState<string>('');
  const [listAllAcceleratorReportsRequestId, setListAllAcceleratorReportsRequestId] = useState<string>('');
  const [userIdsRequested, setUserIdsRequested] = useState(new Set<number>());

  const listAcceleratorReportsRequest = useAppSelector(selectListAcceleratorReports(listAcceleratorReportsRequestId));
  const listAllAcceleratorReportsRequest = useAppSelector(
    selectListAcceleratorReports(listAllAcceleratorReportsRequestId)
  );

  const pathParams = useParams<{ projectId: string }>();
  const projectId = isAcceleratorRoute ? String(pathParams.projectId) : currentParticipantProject?.id?.toString();

  const currentYear = DateTime.now().year;

  useEffect(() => {
    if (projectId) {
      const request = dispatch(requestListAcceleratorReports({ projectId, includeFuture: true, includeMetrics: true }));
      setListAllAcceleratorReportsRequestId(request.requestId);
    }
  }, [projectId]);

  useEffect(() => {
    if (listAllAcceleratorReportsRequest?.status === 'success') {
      setAllAcceleratorReports(() => {
        const reports = listAllAcceleratorReportsRequest?.data?.map((report) => {
          const year = report.startDate.split('-')[0];
          const reportName = report.frequency === 'Annual' ? `${year}` : `${year}-${report.quarter}`;

          return {
            ...report,
            reportName,
            year,
          };
        });
        return reports || [];
      });
    }
  }, [listAllAcceleratorReportsRequest]);

  useEffect(() => {
    if (listAcceleratorReportsRequest?.status === 'success') {
      setAcceleratorReports(() => {
        const reports = listAcceleratorReportsRequest?.data?.map((report) => {
          const year = report.startDate.split('-')[0];
          const reportName = report.frequency === 'Annual' ? `${year}` : `${year}-${report.quarter}`;

          return {
            ...report,
            reportName,
            year,
          };
        });
        return reports || [];
      });
    }
  }, [listAcceleratorReportsRequest]);

  useEffect(() => {
    reload();
  }, [projectId, yearFilter]);

  const reload = useCallback(() => {
    if (projectId) {
      const request = dispatch(
        requestListAcceleratorReports({
          projectId,
          includeFuture: true,
          includeMetrics: true,
          year: yearFilter,
        })
      );
      setListAcceleratorReportsRequestId(request.requestId);
    }
  }, [dispatch, projectId, yearFilter]);

  const fuzzySearchColumns = useMemo(() => ['reportName'], []);

  const allReportYears = useMemo(() => {
    const years: Set<number> = new Set();

    allAcceleratorReports?.forEach((report) => {
      const reportYear = DateTime.fromFormat(report.startDate, 'yyyy-MM-dd').year;
      years.add(reportYear);
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [allAcceleratorReports]);

  const allReportUserIds = useMemo(() => {
    const userIds: Set<number> = new Set();

    allAcceleratorReports?.forEach((report) => {
      if (report.modifiedBy) {
        userIds.add(report.modifiedBy);
      }
      if (report.submittedBy) {
        userIds.add(report.submittedBy);
      }
    });

    return Array.from(userIds).sort((a, b) => a - b);
  }, [allAcceleratorReports]);

  useEffect(() => {
    allReportUserIds.forEach((userId) => {
      if (userIdsRequested.has(userId)) {
        return;
      }
      setUserIdsRequested((prev) => new Set(prev).add(userId));
      dispatch(requestGetUser(userId));
    });
  }, [allReportUserIds, userIdsRequested, dispatch]);

  const yearFilterOptions = useMemo(() => {
    return allReportYears.map((year) => year.toString());
  }, [allAcceleratorReports]);

  useEffect(() => {
    if (!!allAcceleratorReports?.length && !!allReportYears.length) {
      if (allReportYears.includes(currentYear)) {
        setYearFilter(currentYear.toString());
      } else {
        const futureYears = allReportYears.filter((year) => year > currentYear).sort((a, b) => a - b);
        if (!!futureYears.length) {
          setYearFilter(futureYears[0].toString());
        } else {
          const pastYears = allReportYears.filter((year) => year < currentYear).sort((a, b) => b - a);
          setYearFilter(pastYears[0].toString());
        }
      }
    }
  }, [allAcceleratorReports, allReportYears]);

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
              id='yearFilter'
              label=''
              onChange={(year: string) => setYearFilter(year)}
              options={yearFilterOptions}
              placeholder={strings.YEAR}
              selectedValue={yearFilter}
              sx={{ textAlign: 'left' }}
            />
          </Box>
        </>
      ) : null,
    [activeLocale, allReportYears, yearFilter]
  );

  if (!projectId) {
    return <></>;
  }

  return (
    <ClientSideFilterTable
      busy={listAcceleratorReportsRequest?.status === 'pending'}
      columns={columns}
      defaultSortOrder={defaultSearchOrder}
      extraComponent={extraFilter}
      featuredFilters={featuredFilters}
      fuzzySearchColumns={fuzzySearchColumns}
      id='accelerator-reports-table'
      isClickable={() => false}
      Renderer={AcceleratorReportCellRenderer({ projectId })}
      rows={acceleratorReports}
      stickyFilters
      title={strings.REPORTS}
    />
  );
}
