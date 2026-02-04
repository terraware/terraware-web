import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { EditableTable, EditableTableColumn } from '@terraware/web-components';
import { DateTime } from 'luxon';
import { MRT_TableInstance, MRT_ToggleDensePaddingButton } from 'material-react-table';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useProjectReports from 'src/hooks/useProjectReports';
import { useOrganization, useUser } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useUpdateProjectMetricTargetsMutation } from 'src/queries/generated/reports';
import strings from 'src/strings';
import { MetricType, SystemMetricName } from 'src/types/AcceleratorReport';
import { UpdateProjectMetricTargets, UpdateStandardMetricTargets, UpdateSystemMetricTargets } from 'src/types/Report';
import useSnackbar from 'src/utils/useSnackbar';

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
  const { isAllowed } = useUser();
  const { selectedOrganization } = useOrganization();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = isAcceleratorRoute ? String(pathParams.projectId) : currentParticipantProject?.id?.toString();
  const [metricsToUse, setMetricsToUse] = useState<RowMetric[]>();
  const snackbar = useSnackbar();

  const { reload, acceleratorReports: reports } = useProjectReports(projectId, true, true);
  const [updateMetricTargets] = useUpdateProjectMetricTargetsMutation();

  const isAllowedUpdateReportsTargets = useMemo(
    () => isAllowed('UPDATE_REPORTS_TARGETS', { organization: selectedOrganization }),
    [isAllowed, selectedOrganization]
  );
  const isAllowedReviewReportTargets = useMemo(() => isAllowed('REVIEW_REPORTS_TARGETS'), [isAllowed]);

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

  const onSaveYearTarget = useCallback(
    async (row: RowMetric, value: any, year: number) => {
      if (!projectId) {
        return;
      }

      const reportIdKey = `reportId${year}`;
      const reportId = row[reportIdKey] as number | undefined;

      if (!reportId) {
        snackbar.toastError();
        return;
      }

      const newTarget = Number(value);
      if (isNaN(newTarget)) {
        snackbar.toastError();
        return;
      }

      let metric: UpdateProjectMetricTargets | UpdateStandardMetricTargets | UpdateSystemMetricTargets;

      switch (row.metricType) {
        case 'project':
          metric = {
            type: 'project',
            metricId: row.id,
            targets: [{ reportId, target: newTarget }],
          };
          break;
        case 'standard':
          metric = {
            type: 'standard',
            metricId: row.id,
            targets: [{ reportId, target: newTarget }],
          };
          break;
        case 'system':
          metric = {
            type: 'system',
            metric: row.name as SystemMetricName,
            targets: [{ reportId, target: newTarget }],
          };
          break;
      }

      try {
        await updateMetricTargets({
          projectId: Number(projectId),
          updateSubmitted: isAllowedReviewReportTargets,
          updateMetricTargetsRequestPayload: { metric },
        }).unwrap();

        snackbar.toastSuccess(strings.CHANGES_SAVED);
        reload();
      } catch (error) {
        snackbar.toastError();
      }
    },
    [projectId, updateMetricTargets, isAllowedReviewReportTargets, snackbar, reload]
  );

  const tableColumns = useMemo(() => {
    const baseColumns: EditableTableColumn<RowMetric>[] = [
      {
        id: 'name',
        header: strings.METRIC,
        accessorKey: 'name',
        size: 300,
        enableEditing: false,
      },
    ];

    const yearColumns: EditableTableColumn<RowMetric>[] = getReportsYears.map((year) => ({
      id: `year${year}`,
      header: year.toString(),
      accessorKey: `year${year}` as keyof RowMetric,
      enableEditing: isAllowedUpdateReportsTargets,
      editConfig: {
        editVariant: 'text',
        onSave: (row: RowMetric, value: any) => onSaveYearTarget(row, value, year),
      },
    }));

    const lastColumns: EditableTableColumn<RowMetric>[] = [
      {
        id: 'type',
        header: strings.TYPE,
        accessorKey: 'type',
        enableEditing: false,
      },
      {
        id: 'component',
        header: strings.COMPONENT,
        accessorKey: 'component',
        enableEditing: false,
      },
    ];

    return [...baseColumns, ...yearColumns, ...lastColumns];
  }, [isAllowedUpdateReportsTargets, getReportsYears, onSaveYearTarget]);

  const columnOrder = useMemo(() => {
    const yearIds = getReportsYears.map((year) => `year${year}`);
    return ['name', ...yearIds, 'type', 'component'];
  }, [getReportsYears]);

  return (
    <EditableTable
      columns={tableColumns}
      data={metricsToUse || []}
      enableEditing={true}
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
        muiTableContainerProps: {
          sx: { maxHeight: 'none', overflowX: 'auto' },
        },
      }}
      sx={{
        padding: 0,
        width: '100%',
        maxWidth: '100%',
        '& .MuiPaper-root': {
          width: '100%',
          maxWidth: '100%',
          borderRadius: '24px',
        },
        '& .MuiTableContainer-root': {
          maxWidth: '100%',
          overflowX: 'auto',
        },
      }}
    />
  );
}
