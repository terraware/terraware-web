import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { EditableTable, EditableTableColumn } from '@terraware/web-components';
import { DateTime } from 'luxon';
import { MRT_Cell, MRT_Row, MRT_TableInstance, MRT_ToggleDensePaddingButton } from 'material-react-table';

import Link from 'src/components/common/Link';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useProjectReports from 'src/hooks/useProjectReports';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import strings from 'src/strings';
import { MetricType } from 'src/types/AcceleratorReport';

const columns = (
  activeLocale: string | null,
  isAllowedUpdateReportsTargets: boolean,
  availableYears: number[],
  onRowClick?: (row: RowMetric) => void
): EditableTableColumn<RowMetric>[] => {
  const baseColumns: EditableTableColumn<RowMetric>[] = [
    {
      id: 'name',
      header: strings.METRIC,
      accessorKey: 'name',
      size: 500,
      Cell: ({ cell, row }: { cell: MRT_Cell<RowMetric>; row: MRT_Row<RowMetric> }) => {
        const value = cell.getValue() as string;
        return isAllowedUpdateReportsTargets && onRowClick ? (
          <Link fontSize='16px' onClick={() => onRowClick(row.original)}>
            {value}
          </Link>
        ) : (
          <>{value}</>
        );
      },
    },
  ];

  const yearColumns: EditableTableColumn<RowMetric>[] = availableYears.map((year) => ({
    id: `year${year}`,
    header: year.toString(),
    accessorKey: `year${year}` as keyof RowMetric,
  }));

  const lastColumns = [
    {
      id: 'type',
      header: strings.TYPE,
      accessorKey: 'type',
    },
    {
      id: 'component',
      header: strings.COMPONENT,
      accessorKey: 'component',
    },
  ];

  return [...baseColumns, ...yearColumns, ...lastColumns];
};

export type RowMetric = {
  name: string;
  description?: string;
  type: string;
  component: string;
  id: number;
  metricType: MetricType;
  [key: string]: string | number | undefined;
};

export default function AcceleratorReportTargetsTable(): JSX.Element {
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { currentParticipantProject } = useParticipantData();
  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
  const { selectedOrganization } = useOrganization();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = isAcceleratorRoute ? String(pathParams.projectId) : currentParticipantProject?.id?.toString();
  const [metricsToUse, setMetricsToUse] = useState<RowMetric[]>();

  const { acceleratorReports: reports } = useProjectReports(projectId, true, true);

  const isAllowedUpdateReportsTargets = useMemo(
    () => isAllowed('UPDATE_REPORTS_TARGETS', { organization: selectedOrganization }),
    [isAllowed, selectedOrganization]
  );

  const getReportsYears = useMemo(() => {
    const availableYears: Set<number> = new Set();

    reports?.forEach((report) => {
      const reportYear = DateTime.fromFormat(report.startDate, 'yyyy-MM-dd').year;
      availableYears.add(reportYear);
    });

    return Array.from(availableYears).sort((a, b) => a - b);
  }, [reports]);

  useEffect(() => {
    const metrics: Map<string, RowMetric> = new Map();

    reports?.forEach((report) => {
      report.systemMetrics.forEach((sm) => {
        const key = sm.metric;
        if (!metrics.has(key)) {
          metrics.set(key, {
            name: sm.metric,
            type: sm.type,
            component: sm.component,
            id: -1,
            description: sm.description,
            metricType: 'system',
          });
        }
      });
      report.standardMetrics.forEach((sm) => {
        const key = `standardMetric-${sm.id.toString()}`;
        if (!metrics.has(key)) {
          metrics.set(key, {
            name: sm.name,
            type: sm.type,
            component: sm.component,
            id: sm.id,
            description: sm.description,
            metricType: 'standard',
          });
        }
      });
      report.projectMetrics.forEach((pm) => {
        const key = `projectMetric-${pm.id.toString()}`;
        if (!metrics.has(key)) {
          metrics.set(key, {
            name: pm.name,
            type: pm.type,
            component: pm.component,
            id: pm.id,
            description: pm.description,
            metricType: 'project',
          });
        }
      });
    });

    reports?.forEach((report) => {
      if (report.frequency === 'Annual') {
        const year = DateTime.fromFormat(report.startDate, 'yyyy-MM-dd').year;
        const yearKey = `year${year}`;
        const reportIdKey = `reportId${year}`;

        metrics.forEach((metric) => {
          metric[reportIdKey] = report.id;

          if (metric.id !== -1) {
            const foundMetric = [...report.standardMetrics, ...report.projectMetrics].find(
              (met) => met.id === metric.id
            );
            metric[yearKey] = foundMetric?.target;
          } else {
            const foundMetric = report.systemMetrics.find((met) => met.metric === metric.name);
            metric[yearKey] = foundMetric?.target;
          }
        });
      }
    });

    setMetricsToUse(Array.from(metrics.values()));
  }, [reports]);

  const onRowClick = useCallback(() => {
    if (isAllowedUpdateReportsTargets) {
      return true;
    }
  }, [isAllowedUpdateReportsTargets]);

  const tableColumns = useMemo(
    () => columns(activeLocale, isAllowedUpdateReportsTargets, getReportsYears, onRowClick),
    [activeLocale, isAllowedUpdateReportsTargets, getReportsYears, onRowClick]
  );

  const columnOrder = useMemo(() => {
    const yearIds = getReportsYears.map((year) => `year${year}`);
    return ['name', ...yearIds, 'type', 'component'];
  }, [getReportsYears]);

  return (
    <>
      <EditableTable
        columns={tableColumns}
        data={metricsToUse || []}
        enableEditing={false}
        enableSorting={true}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enablePagination={true}
        enableColumnPinning={true}
        initialSorting={[{ id: 'name', desc: false }]}
        tableOptions={{
          enableColumnActions: false,
          enableHiding: false,
          enableColumnDragging: false,
          enableColumnOrdering: false,
          renderToolbarInternalActions: ({ table }: { table: MRT_TableInstance<RowMetric> }) => (
            <>
              <MRT_ToggleDensePaddingButton table={table} />
            </>
          ),
          state: {
            columnOrder,
          },
          initialState: {
            columnPinning: {
              left: ['name'],
            },
          },
        }}
      />
    </>
  );
}
