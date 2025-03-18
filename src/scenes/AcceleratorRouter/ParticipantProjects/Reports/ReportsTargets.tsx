import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { TableColumnType } from '@terraware/web-components';
import { DateTime } from 'luxon';

import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import { FilterConfigWithValues } from 'src/components/common/SearchFiltersWrapperV2';
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
    const request = dispatch(requestListAcceleratorReports({ projectId }));
    setAllReportsRequestId(request.requestId);
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

    if (startMonth === 1 && endMonth === 3) {
      return 1;
    }

    if (startMonth === 4 && endMonth === 6) {
      return 2;
    }

    if (startMonth === 7 && endMonth === 9) {
      return 3;
    }

    if (startMonth === 10 && endMonth === 12) {
      return 4;
    }

    return -1;
  };

  useEffect(() => {
    if (reports && reports.length > 0) {
      const metrics: Map<string, RowMetric> = new Map();
      reports.forEach((report) => {
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

      reports.forEach((report) => {
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
    }
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
      const request = dispatch(requestListAcceleratorReports({ projectId, search, sortOrder }));
      setRequestId(request.requestId);
    },
    [dispatch]
  );

  const getReportsYears = useMemo(() => {
    const availableYears: Set<string> = new Set();
    allReports?.forEach((report) => {
      const reportYear = DateTime.fromFormat(report.startDate, 'yyyy-MM-dd').year;
      availableYears.add(reportYear.toString());
    });
    return Array.from(availableYears);
  }, [allReports]);

  const featuredFilters: FilterConfigWithValues[] = useMemo(() => {
    const currentYear = DateTime.now().year;
    return activeLocale
      ? [
          {
            field: 'year',
            label: strings.YEAR,
            options: getReportsYears,
            values: getReportsYears.length > 0 && getReportsYears[0] ? [currentYear] : undefined,
          },
        ]
      : [];
  }, [activeLocale, allReports]);

  const fuzzySearchColumns = useMemo(() => ['name'], []);

  return (
    <TableWithSearchFilters
      busy={allReportsResults?.status === 'pending'}
      columns={columns}
      defaultSearchOrder={defaultSearchOrder}
      dispatchSearchRequest={dispatchSearchRequest}
      featuredFilters={featuredFilters}
      id='reports-targets-table'
      Renderer={ReportsTargetsCellRenderer}
      rows={metricsToUse || []}
      title={strings.TARGETS}
      fuzzySearchColumns={fuzzySearchColumns}
      stickyFilters
    />
  );
}
