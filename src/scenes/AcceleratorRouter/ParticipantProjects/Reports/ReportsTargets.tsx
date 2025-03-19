import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box } from '@mui/material';
import { Select, TableColumnType } from '@terraware/web-components';
import { DateTime } from 'luxon';

import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import { useLocalization } from 'src/providers';
import { selectListAcceleratorReports } from 'src/redux/features/reports/reportsSelectors';
import { requestListAcceleratorReports } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorReport } from 'src/types/AcceleratorReport';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

import ReportsTargetsCellRenderer from './ReportsTargetsCellRenderer';

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        {
          key: 'name',
          name: strings.METRIC,
          type: 'string',
        },
        {
          key: 'year',
          name: strings.YEAR,
          type: 'string',
        },
        {
          key: 'type',
          name: strings.TYPE,
          type: 'string',
        },
        {
          key: 'reference',
          name: strings.REFERENCE,
          type: 'string',
        },
        {
          key: 'component',
          name: strings.COMPONENT,
          type: 'string',
        },
        {
          key: 'annualTarget',
          name: strings.ANNUAL_TARGET,
          type: 'string',
        },
        {
          key: 'Q1Target',
          name: strings.Q1_TARGET,
          type: 'string',
        },
        {
          key: 'Q2Target',
          name: strings.Q2_TARGET,
          type: 'string',
        },
        {
          key: 'Q3Target',
          name: strings.Q3_TARGET,
          type: 'string',
        },
        {
          key: 'Q4Target',
          name: strings.Q4_TARGET,
          type: 'string',
        },
      ]
    : [];

type RowMetric = {
  name: string;
  year?: number;
  type: string;
  reference: string;
  component: string;
  id: number;
  annualTarget?: number;
  q1Target?: number;
  q2Target?: number;
  q3Target?: number;
  q4Target?: number;
};

export default function ReportsTargets(): JSX.Element {
  const [allReportsRequestId, setAllReportsRequestId] = useState<string>('');
  const allReportsResults = useAppSelector(selectListAcceleratorReports(allReportsRequestId));
  const [requestId, setRequestId] = useState<string>('');
  const reportsResults = useAppSelector(selectListAcceleratorReports(requestId));
  const dispatch = useAppDispatch();
  const [allReports, setAllReports] = useState<AcceleratorReport[]>();
  const [reports, setReports] = useState<AcceleratorReport[]>();
  const { activeLocale } = useLocalization();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = String(pathParams.projectId);
  const [metricsToUse, setMetricsToUse] = useState<RowMetric[]>();

  useEffect(() => {
    if (projectId) {
      const request = dispatch(requestListAcceleratorReports({ projectId, includeFuture: true, includeMetrics: true }));
      setAllReportsRequestId(request.requestId);
    }
  }, [projectId]);

  useEffect(() => {
    if (allReportsResults?.status === 'error') {
      return;
    }
    if (allReportsResults?.data) {
      setAllReports(allReportsResults.data);
    }
  }, [allReportsResults]);

  useEffect(() => {
    if (reportsResults?.status === 'error') {
      return;
    }
    if (reportsResults?.data) {
      setReports(reportsResults.data);
    }
  }, [reportsResults]);

  const getReportQuarter = (report: AcceleratorReport) => {
    const startDate = DateTime.fromFormat(report.startDate, 'yyyy-MM-dd');
    const startMonth = startDate.month;
    const endDate = DateTime.fromFormat(report.endDate, 'yyyy-MM-dd');
    const endMonth = endDate.month;

    if (startMonth >= 1 && startMonth <= 3 && endMonth >= 1 && endMonth <= 3) {
      return 1;
    }

    if (startMonth >= 4 && startMonth <= 6 && endMonth >= 4 && endMonth <= 6) {
      return 2;
    }

    if (startMonth >= 7 && startMonth <= 9 && endMonth >= 7 && endMonth <= 9) {
      return 3;
    }

    if (startMonth >= 10 && startMonth <= 12 && endMonth >= 10 && endMonth <= 12) {
      return 4;
    }

    return -1;
  };

  useEffect(() => {
    const metrics: Map<string, RowMetric> = new Map();
    reports?.forEach((report) => {
      report.systemMetrics.forEach((sm) => {
        metrics.set(sm.metric, {
          name: sm.metric,
          type: sm.type,
          reference: sm.reference,
          component: sm.component,
          id: -1,
        });
      });
      report.standardMetrics.forEach((sm) => {
        metrics.set(sm.id.toString(), {
          name: sm.name,
          type: sm.type,
          reference: sm.reference,
          component: sm.component,
          id: sm.id,
        });
      });
      report.projectMetrics.forEach((pm) => {
        metrics.set(pm.id.toString(), {
          name: pm.name,
          type: pm.type,
          reference: pm.reference,
          component: pm.component,
          id: pm.id,
        });
      });
    });

    reports?.forEach((report) => {
      if (report.frequency === 'Annual') {
        metrics.forEach((metric) => {
          metric.year = DateTime.fromFormat(report.startDate, 'yyyy-MM-dd').year;
          if (metric.id !== -1) {
            const foundMetric = [...report.standardMetrics, ...report.projectMetrics].find(
              (met) => met.id === metric.id
            );
            metric.annualTarget = foundMetric?.target;
          } else {
            const foundMetric = report.systemMetrics.find((met) => met.metric === metric.name);
            metric.annualTarget = foundMetric?.target;
          }
        });
      } else {
        const quarter = getReportQuarter(report);
        if (quarter !== -1) {
          const quarterProp: 'q1Target' | 'q2Target' | 'q3Target' | 'q4Target' = `q${quarter}Target`;
          metrics.forEach((metric) => {
            metric.year = DateTime.fromFormat(report.startDate, 'yyyy-MM-dd').year;
            if (metric.id !== -1) {
              const foundMetric = [...report.standardMetrics, ...report.projectMetrics].find(
                (met) => met.id === metric.id
              );
              metric[quarterProp] = foundMetric?.target ?? undefined;
            } else {
              const foundMetric = report.systemMetrics.find((met) => met.metric === metric.name);
              metric[quarterProp] = foundMetric?.target;
            }
          });
        }
      }
    });

    setMetricsToUse(Array.from(metrics.values()));
  }, [reports]);

  const defaultSearchOrder: SearchSortOrder = {
    field: 'metric',
    direction: 'Ascending',
  };

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, sortOrder: SearchSortOrder) => {
      if (!locale) {
        return;
      }
      const request = dispatch(
        requestListAcceleratorReports({ projectId, search, sortOrder, includeFuture: true, includeMetrics: true })
      );
      setRequestId(request.requestId);
    },
    [dispatch]
  );

  const currentYear = DateTime.now().year;
  const [yearFilter, setYearFilter] = useState<string>();
  const getReportsYears = useMemo(() => {
    const availableYears: Set<number> = new Set();
    allReports?.forEach((report) => {
      const reportYear = DateTime.fromFormat(report.startDate, 'yyyy-MM-dd').year;
      availableYears.add(reportYear);
    });
    return Array.from(availableYears);
  }, [allReports]);

  const getReportsYearsString = useMemo(() => {
    return getReportsYears.map((year) => year.toString());
  }, [getReportsYears]);

  const extraTableFilters: SearchNodePayload[] = useMemo(() => {
    return [
      {
        operation: 'field',
        field: 'year',
        type: 'Exact',
        values: [`${yearFilter}`],
      },
    ];
  }, [yearFilter, allReports]);

  const fuzzySearchColumns = useMemo(() => ['name'], []);

  useEffect(() => {
    if ((allReports?.length || 0) > 0) {
      if (getReportsYears.includes(currentYear)) {
        setYearFilter(currentYear.toString());
      } else {
        const futureYears = getReportsYears.filter((year) => year > currentYear).sort((a, b) => a - b);
        if (futureYears.length > 0) {
          setYearFilter(futureYears[0].toString());
        } else {
          const pastYears = getReportsYears.filter((year) => year < currentYear).sort((a, b) => b - a);
          setYearFilter(pastYears[0].toString());
        }
      }
    }
  }, [allReports]);

  const extraFilter = useMemo(
    () =>
      activeLocale ? (
        <>
          <Box paddingLeft={1} marginTop={0.5}>
            <Select
              id='yearFilter'
              label={''}
              selectedValue={yearFilter}
              options={getReportsYearsString}
              onChange={(year: string) => {
                setYearFilter(year);
              }}
              fullWidth
            />
          </Box>
        </>
      ) : null,
    [activeLocale, allReports, yearFilter]
  );

  return (
    <TableWithSearchFilters
      busy={allReportsResults?.status === 'pending'}
      columns={columns}
      defaultSearchOrder={defaultSearchOrder}
      dispatchSearchRequest={dispatchSearchRequest}
      id='reports-targets-table'
      Renderer={ReportsTargetsCellRenderer}
      rows={metricsToUse || []}
      title={strings.TARGETS}
      fuzzySearchColumns={fuzzySearchColumns}
      stickyFilters
      extraTableFilters={extraTableFilters}
      extraComponent={extraFilter}
    />
  );
}
