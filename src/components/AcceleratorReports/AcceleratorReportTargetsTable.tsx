import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box } from '@mui/material';
import { Select, TableColumnType, TableRowType } from '@terraware/web-components';
import { DateTime } from 'luxon';

import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useBoolean from 'src/hooks/useBoolean';
import useProjectReports from 'src/hooks/useProjectReports';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import strings from 'src/strings';
import { AcceleratorReport, MetricType } from 'src/types/AcceleratorReport';
import { SearchSortOrder } from 'src/types/Search';

import AcceleratorReportTargetsCellRenderer from './AcceleratorReportTargetsCellRenderer';
import EditAcceleratorReportTargetsModal from './EditAcceleratorReportTargetsModal';

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
          key: 'q1Target',
          name: strings.Q1_TARGET,
          type: 'string',
        },
        {
          key: 'q2Target',
          name: strings.Q2_TARGET,
          type: 'string',
        },
        {
          key: 'q3Target',
          name: strings.Q3_TARGET,
          type: 'string',
        },
        {
          key: 'q4Target',
          name: strings.Q4_TARGET,
          type: 'string',
        },
      ]
    : [];

export type RowMetric = {
  name: string;
  year?: number;
  description?: string;
  type: string;
  reference: string;
  component: string;
  id: number;
  metricType: MetricType;
  annualTarget?: number;
  q1Target?: number;
  q2Target?: number;
  q3Target?: number;
  q4Target?: number;
  annualReportId?: number;
  q1ReportId?: number;
  q2ReportId?: number;
  q3ReportId?: number;
  q4ReportId?: number;
};

export default function AcceleratorReportTargetsTable(): JSX.Element {
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { currentParticipantProject } = useParticipantData();
  const { activeLocale } = useLocalization();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = isAcceleratorRoute ? String(pathParams.projectId) : currentParticipantProject?.id?.toString();
  const [metricsToUse, setMetricsToUse] = useState<RowMetric[]>();
  const [editOpenModal, setEditOpenModal, , setEditOpenModalFalse] = useBoolean(false);
  const [selectedRows, setSelectedRows] = useState<TableRowType[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<RowMetric>();
  const currentYear = DateTime.now().year;
  const [yearFilter, setYearFilter] = useState<string>();

  const { busy, reload, acceleratorReports: reports } = useProjectReports(projectId, true, true, yearFilter);
  const { acceleratorReports: allReports } = useProjectReports(projectId, true, true);

  const getReportsYears = useMemo(() => {
    const availableYears: Set<number> = new Set();

    allReports?.forEach((report) => {
      const reportYear = DateTime.fromFormat(report.startDate, 'yyyy-MM-dd').year;
      availableYears.add(reportYear);
    });

    return Array.from(availableYears).sort((a, b) => b - a);
  }, [allReports]);

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
          description: sm.description,
          metricType: 'system',
        });
      });
      report.standardMetrics.forEach((sm) => {
        metrics.set(sm.id.toString(), {
          name: sm.name,
          type: sm.type,
          reference: sm.reference,
          component: sm.component,
          id: sm.id,
          description: sm.description,
          metricType: 'standard',
        });
      });
      report.projectMetrics.forEach((pm) => {
        metrics.set(pm.id.toString(), {
          name: pm.name,
          type: pm.type,
          reference: pm.reference,
          component: pm.component,
          id: pm.id,
          description: pm.description,
          metricType: 'project',
        });
      });
    });

    reports?.forEach((report) => {
      if (report.frequency === 'Annual') {
        metrics.forEach((metric) => {
          metric.year = DateTime.fromFormat(report.startDate, 'yyyy-MM-dd').year;
          metric.annualReportId = report.id;
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
          const quarterReportIdProp: 'q1ReportId' | 'q2ReportId' | 'q3ReportId' | 'q4ReportId' = `q${quarter}ReportId`;
          metrics.forEach((metric) => {
            metric[quarterReportIdProp] = report.id;
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

  const getReportsYearsString = useMemo(() => {
    return getReportsYears.map((year) => year.toString());
  }, [getReportsYears]);

  const fuzzySearchColumns = useMemo(() => ['name'], []);

  useEffect(() => {
    if ((allReports?.length || 0) > 0 && getReportsYears.length > 0) {
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
  }, [allReports, currentYear, getReportsYears]);

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
              onChange={setYearFilter}
              fullWidth
            />
          </Box>
        </>
      ) : null,
    [activeLocale, getReportsYearsString, yearFilter]
  );

  const onRowClick = useCallback(
    (metric: TableRowType) => {
      setSelectedMetric(metric as RowMetric);
      setEditOpenModal(true);
    },
    [setEditOpenModal]
  );

  const clickable = useCallback(() => false, []);

  return (
    <>
      {editOpenModal && selectedMetric && (
        <EditAcceleratorReportTargetsModal
          onClose={setEditOpenModalFalse}
          reload={reload}
          reports={reports}
          row={selectedMetric}
        />
      )}
      <ClientSideFilterTable
        busy={busy}
        columns={columns}
        defaultSortOrder={defaultSearchOrder}
        id='reports-targets-table'
        Renderer={AcceleratorReportTargetsCellRenderer}
        rows={metricsToUse || []}
        title={strings.TARGETS}
        fuzzySearchColumns={fuzzySearchColumns}
        stickyFilters
        extraComponent={extraFilter}
        onSelect={onRowClick}
        controlledOnSelect={true}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        isClickable={clickable}
      />
    </>
  );
}
