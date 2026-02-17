import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box } from '@mui/material';
import { Select, TableColumnType } from '@terraware/web-components';
import { DateTime } from 'luxon';

import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import { FilterConfigWithValues } from 'src/components/common/SearchFiltersWrapperV2';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import {
  AcceleratorReportPayload,
  useLazyGetAcceleratorReportYearsQuery,
  useLazyListAcceleratorReportsQuery,
} from 'src/queries/generated/reports';
import { AcceleratorReportStatuses } from 'src/types/AcceleratorReport';
import { SearchSortOrder } from 'src/types/Search';
import useQuery from 'src/utils/useQuery';

import AcceleratorReportCellRenderer from './AcceleratorReportCellRenderer';
import { getReportName } from './utils';

type AcceleratorReportRow = AcceleratorReportPayload & {
  reportName?: string;
  year?: string;
};

const defaultSearchOrder: SearchSortOrder = {
  field: 'reportName',
  direction: 'Descending',
};

export default function AcceleratorReportsTable(): JSX.Element {
  const { strings } = useLocalization();
  const { currentAcceleratorProject } = useParticipantData();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const query = useQuery();

  const currentYear = DateTime.now().year;
  const yearQuery = query.get('year');
  const [yearFilter, setYearFilter] = useState<number>(yearQuery ? Number(yearQuery) : currentYear);

  const pathParams = useParams<{ projectId: string }>();
  const projectId = useMemo(
    () => (isAcceleratorRoute ? Number(pathParams.projectId) : currentAcceleratorProject?.id),
    [currentAcceleratorProject?.id, isAcceleratorRoute, pathParams.projectId]
  );

  const [listCurrentYearReports, listCurrentYearReportsResults] = useLazyListAcceleratorReportsQuery();
  const [listReports, listReportsResults] = useLazyListAcceleratorReportsQuery();
  const [getReportYears, getReportYearsResults] = useLazyGetAcceleratorReportYearsQuery();

  useEffect(() => {
    if (projectId) {
      void getReportYears(projectId, true);
      void listReports(
        {
          projectId,
          year: yearFilter,
        },
        true
      );
      void listCurrentYearReports(
        {
          projectId,
          year: currentYear,
        },
        true
      );
    }
  }, [currentYear, getReportYears, listCurrentYearReports, listReports, projectId, yearFilter]);

  const busy = useMemo(() => listReportsResults.isLoading, [listReportsResults.isLoading]);
  const projectReports = useMemo(() => listReportsResults.data?.reports ?? [], [listReportsResults.data?.reports]);
  const currentYearReports = useMemo(
    () => listCurrentYearReportsResults.data?.reports ?? [],
    [listCurrentYearReportsResults.data?.reports]
  );

  const acceleratorReports = useMemo((): AcceleratorReportRow[] => {
    return (
      projectReports
        ?.filter((report) => report.frequency !== 'Annual')
        .map((report) => {
          const year = report.startDate.split('-')[0];
          const reportName = getReportName(report);

          return {
            ...report,
            reportName,
            year,
          };
        }) ?? []
    );
  }, [projectReports]);

  const columns = useMemo((): TableColumnType[] => {
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
  }, [strings]);

  const tableIsClickable = useCallback(() => false, []);
  const fuzzySearchColumns = useMemo(() => ['reportName'], []);

  const allReportYears = useMemo(() => {
    if (getReportYearsResults.data?.years) {
      const endYear = getReportYearsResults.data.years.endYear;
      const startYear = getReportYearsResults.data.years.startYear;

      const lastCurrentYear = currentYearReports.length > 0 ? currentYear : currentYear - 1;
      const lastYear = Math.min(endYear, lastCurrentYear);

      return Array.from({ length: lastYear - startYear + 1 }, (_, i) => startYear + i);
    } else {
      return [];
    }
  }, [currentYear, currentYearReports.length, getReportYearsResults.data?.years]);

  const yearFilterOptions = useMemo(() => {
    return allReportYears.map((year) => year.toString());
  }, [allReportYears]);

  useEffect(() => {
    if (allReportYears.length) {
      if (yearQuery && allReportYears.includes(Number(yearQuery))) {
        setYearFilter(Number(yearQuery));
        return;
      }
      if (allReportYears.includes(currentYear)) {
        setYearFilter(currentYear);
      } else {
        const futureYears = allReportYears.filter((year) => year > currentYear).sort((a, b) => a - b);
        if (futureYears.length) {
          setYearFilter(futureYears[0]);
        } else {
          const pastYears = allReportYears.filter((year) => year < currentYear).sort((a, b) => b - a);
          setYearFilter(pastYears[0]);
        }
      }
    }
  }, [allReportYears, currentYear, yearQuery]);

  const featuredFilters: FilterConfigWithValues[] = useMemo(() => {
    const rejectedStatus = isAcceleratorRoute ? strings.UPDATE_REQUESTED : strings.UPDATE_NEEDED;
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

    return filters;
  }, [isAcceleratorRoute, strings]);

  const extraFilter = useMemo(
    () => (
      <Box marginTop={0.5} paddingLeft={1}>
        <Select
          id='yearFilter'
          label=''
          onChange={(value: string) => setYearFilter(Number(value))}
          options={yearFilterOptions}
          placeholder={strings.YEAR}
          selectedValue={yearFilter.toString()}
          sx={{ textAlign: 'left' }}
        />
      </Box>
    ),
    [strings, yearFilter, yearFilterOptions]
  );

  if (!projectId) {
    return <></>;
  }

  return (
    <ClientSideFilterTable
      busy={busy}
      columns={columns}
      defaultSortOrder={defaultSearchOrder}
      extraComponent={extraFilter}
      featuredFilters={featuredFilters}
      fuzzySearchColumns={fuzzySearchColumns}
      id='accelerator-reports-table'
      isClickable={tableIsClickable}
      Renderer={AcceleratorReportCellRenderer({ projectId })}
      rows={acceleratorReports}
      stickyFilters
      title={strings.REPORTS}
    />
  );
}
