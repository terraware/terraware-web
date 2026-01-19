import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box } from '@mui/material';
import { Select, TableColumnType } from '@terraware/web-components';
import { DateTime } from 'luxon';

import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import { FilterConfigWithValues } from 'src/components/common/SearchFiltersWrapperV2';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useProjectReports from 'src/hooks/useProjectReports';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { AcceleratorReport, AcceleratorReportStatuses } from 'src/types/AcceleratorReport';
import { SearchSortOrder } from 'src/types/Search';
import useQuery from 'src/utils/useQuery';

import AcceleratorReportCellRenderer from './AcceleratorReportCellRenderer';
import { getReportName } from './utils';

type AcceleratorReportRow = AcceleratorReport & {
  reportName?: string;
  year?: string;
};

const defaultSearchOrder: SearchSortOrder = {
  field: 'reportName',
  direction: 'Descending',
};

export default function AcceleratorReportsTable(): JSX.Element {
  const { strings } = useLocalization();
  const { currentParticipantProject } = useParticipantData();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const [yearFilter, setYearFilter] = useState<string>();
  const [acceleratorReports, setAcceleratorReports] = useState<AcceleratorReportRow[]>([]);
  const [allAcceleratorReports, setAllAcceleratorReports] = useState<AcceleratorReportRow[]>([]);

  const pathParams = useParams<{ projectId: string }>();
  const projectId = isAcceleratorRoute ? String(pathParams.projectId) : currentParticipantProject?.id?.toString();
  const query = useQuery();
  const yearQuery = query.get('year');

  const { busy, acceleratorReports: projectReports } = useProjectReports(projectId, false, true, yearFilter);
  const { acceleratorReports: allProjectReports } = useProjectReports(projectId, false, true);

  const currentYear = DateTime.now().year;

  useEffect(() => {
    if (allProjectReports?.length > 0) {
      setAllAcceleratorReports(() => {
        const reports = allProjectReports
          ?.filter((report) => report.frequency !== 'Annual')
          .map((report) => {
            const year = report.startDate.split('-')[0];
            const reportName = getReportName(report);
            return {
              ...report,
              reportName,
              year,
            };
          });
        return reports || [];
      });
    }
  }, [allProjectReports]);

  useEffect(() => {
    if (projectReports?.length > 0) {
      setAcceleratorReports(() => {
        const reports = projectReports
          ?.filter((report) => report.frequency !== 'Annual')
          .map((report) => {
            const year = report.startDate.split('-')[0];
            const reportName = getReportName(report);

            return {
              ...report,
              reportName,
              year,
            };
          });
        return reports || [];
      });
    } else {
      setAcceleratorReports([]);
    }
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
    const years: Set<number> = new Set();

    allAcceleratorReports?.forEach((report) => {
      const reportYear = DateTime.fromFormat(report.startDate, 'yyyy-MM-dd').year;
      years.add(reportYear);
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [allAcceleratorReports]);

  const yearFilterOptions = useMemo(() => {
    return allReportYears.map((year) => year.toString());
  }, [allReportYears]);

  useEffect(() => {
    if (!!allAcceleratorReports?.length && !!allReportYears.length) {
      if (yearQuery) {
        setYearFilter(yearQuery);
        return;
      }
      if (allReportYears.includes(currentYear)) {
        setYearFilter(currentYear.toString());
      } else {
        const futureYears = allReportYears.filter((year) => year > currentYear).sort((a, b) => a - b);
        if (futureYears.length) {
          setYearFilter(futureYears[0].toString());
        } else {
          const pastYears = allReportYears.filter((year) => year < currentYear).sort((a, b) => b - a);
          setYearFilter(pastYears[0].toString());
        }
      }
    }
  }, [allAcceleratorReports, allReportYears, currentYear, yearQuery]);

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
          onChange={setYearFilter}
          options={yearFilterOptions}
          placeholder={strings.YEAR}
          selectedValue={yearFilter}
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
