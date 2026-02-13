import React, { type JSX, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { EditableTable, EditableTableColumn } from '@terraware/web-components';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useOrganization, useUser } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useListStandardMetricQuery, useListSystemMetricsQuery } from 'src/queries/generated/reportMetrics';
import {
  useLazyGetAcceleratorReportYearsQuery,
  useLazyGetProjectMetricTargetsQuery,
  useLazyGetStandardMetricTargetsQuery,
  useLazyGetSystemMetricTargetsQuery,
  useLazyListProjectMetricsQuery,
  useUpdateProjectMetricTargetMutation,
  useUpdateStandardMetricTargetMutation,
  useUpdateSystemMetricTargetMutation,
} from 'src/queries/generated/reports';
import strings from 'src/strings';
import { MetricType, SystemMetricName } from 'src/types/AcceleratorReport';
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
  const projectId = isAcceleratorRoute ? Number(pathParams.projectId) : currentParticipantProject?.id;
  const snackbar = useSnackbar();

  const [getReportsYears, getReportsYearsResponse] = useLazyGetAcceleratorReportYearsQuery();
  const [listProjectMetrics, listProjectMetricsResponse] = useLazyListProjectMetricsQuery();
  const listStandardMetricsResponse = useListStandardMetricQuery();
  const listSystemMetricsResponse = useListSystemMetricsQuery();
  const [updateProjectMetricTarget] = useUpdateProjectMetricTargetMutation();
  const [updateStandardMetricTarget] = useUpdateStandardMetricTargetMutation();
  const [updateSystemMetricTarget] = useUpdateSystemMetricTargetMutation();

  const [listProjectMetricTargets, listProjectMetricTargetsResponse] = useLazyGetProjectMetricTargetsQuery();
  const [listStandardMetricTargets, listStandardMetricTargetsResponse] = useLazyGetStandardMetricTargetsQuery();
  const [listSystemMetricTargets, listSystemMetricTargetsResponse] = useLazyGetSystemMetricTargetsQuery();

  const isAllowedUpdateReportsTargets = useMemo(
    () => isAllowed('UPDATE_REPORTS_TARGETS', { organization: selectedOrganization }),
    [isAllowed, selectedOrganization]
  );

  const yearRange = useMemo(() => {
    if (getReportsYearsResponse.data?.years) {
      const endYear = getReportsYearsResponse.data.years.endYear;
      const startYear = getReportsYearsResponse.data.years.startYear;
      return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    } else {
      return [];
    }
  }, [getReportsYearsResponse.data?.years]);

  const projectMetrics = useMemo(
    () => listProjectMetricsResponse.data?.metrics ?? [],
    [listProjectMetricsResponse.data?.metrics]
  );
  const standardMetrics = useMemo(
    () => listStandardMetricsResponse.data?.metrics ?? [],
    [listStandardMetricsResponse.data?.metrics]
  );
  const systemMetrics = useMemo(
    () => listSystemMetricsResponse.data?.metrics ?? [],
    [listSystemMetricsResponse.data?.metrics]
  );

  const projectMetricTargets = useMemo(
    () => listProjectMetricTargetsResponse.data?.targets ?? [],
    [listProjectMetricTargetsResponse.data?.targets]
  );
  const standardMetricTargets = useMemo(
    () => listStandardMetricTargetsResponse.data?.targets ?? [],
    [listStandardMetricTargetsResponse.data?.targets]
  );
  const systemMetricTargets = useMemo(
    () => listSystemMetricTargetsResponse.data?.targets ?? [],
    [listSystemMetricTargetsResponse.data?.targets]
  );

  const allMetricRows = useMemo((): RowMetric[] => {
    const systemMetricRows = systemMetrics.map((sm): RowMetric => {
      const metricTargets = systemMetricTargets.filter((metricTarget) => metricTarget.metric === sm.metric);
      const targetByYear: { [yearKey: string]: number | undefined } = {};

      metricTargets.forEach((metricTarget) => {
        const yearKey = `year${metricTarget.year}`;
        targetByYear[yearKey] = metricTarget.target;
      });

      return {
        name: sm.metric,
        type: sm.type,
        component: sm.component,
        id: -1,
        description: sm.description,
        metricType: 'system',
        ...targetByYear,
      };
    });

    const projectMetricRows = projectMetrics.map((pm): RowMetric => {
      const metricTargets = projectMetricTargets.filter((metricTarget) => metricTarget.metricId === pm.id);
      const targetByYear: { [yearKey: string]: number | undefined } = {};

      metricTargets.forEach((metricTarget) => {
        const yearKey = `year${metricTarget.year}`;
        targetByYear[yearKey] = metricTarget.target;
      });

      return {
        name: pm.name,
        type: pm.type,
        component: pm.component,
        id: pm.id,
        description: pm.description,
        metricType: 'project',
        ...targetByYear,
      };
    });

    const standardMetricRows = standardMetrics.map((sm): RowMetric => {
      const metricTargets = standardMetricTargets.filter((metricTarget) => metricTarget.metricId === sm.id);
      const targetByYear: { [yearKey: string]: number | undefined } = {};

      metricTargets.forEach((metricTarget) => {
        const yearKey = `year${metricTarget.year}`;
        targetByYear[yearKey] = metricTarget.target;
      });

      return {
        name: sm.name,
        type: sm.type,
        component: sm.component,
        id: sm.id,
        description: sm.description,
        metricType: 'standard',
        ...targetByYear,
      };
    });

    return [...systemMetricRows, ...standardMetricRows, ...projectMetricRows];
  }, [
    projectMetricTargets,
    projectMetrics,
    standardMetricTargets,
    standardMetrics,
    systemMetricTargets,
    systemMetrics,
  ]);

  useEffect(() => {
    if (projectId) {
      void getReportsYears(projectId, true);
      void listProjectMetrics(projectId, true);
      void listProjectMetricTargets(projectId, true);
      void listStandardMetricTargets(projectId, true);
      void listSystemMetricTargets(projectId, true);
    }
  }, [
    getReportsYears,
    listProjectMetricTargets,
    listProjectMetrics,
    listStandardMetricTargets,
    listSystemMetricTargets,
    projectId,
  ]);

  const onSaveYearTarget = useCallback(
    async (row: RowMetric, value: any, year: number) => {
      if (!projectId) {
        return;
      }

      const newTarget = Number(value);
      if (isNaN(newTarget)) {
        snackbar.toastError();
        return;
      }

      try {
        switch (row.metricType) {
          case 'project':
            await updateProjectMetricTarget({
              projectId,
              updateProjectMetricTargetRequestPayload: {
                metricId: row.id,
                target: newTarget,
                year,
              },
            }).unwrap();
            break;
          case 'standard':
            await updateStandardMetricTarget({
              projectId,
              updateStandardMetricTargetRequestPayload: {
                metricId: row.id,
                target: newTarget,
                year,
              },
            }).unwrap();
            break;
          case 'system':
            await updateSystemMetricTarget({
              projectId,
              updateSystemMetricTargetRequestPayload: {
                metric: row.name as SystemMetricName,
                target: newTarget,
                year,
              },
            }).unwrap();
        }
        snackbar.toastSuccess(strings.CHANGES_SAVED);
      } catch (error) {
        snackbar.toastError();
      }
    },
    [projectId, snackbar, updateProjectMetricTarget, updateStandardMetricTarget, updateSystemMetricTarget]
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

    const yearColumns: EditableTableColumn<RowMetric>[] = yearRange.map((year) => ({
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
  }, [yearRange, isAllowedUpdateReportsTargets, onSaveYearTarget]);

  const columnOrder = useMemo(() => {
    const yearIds = yearRange.map((year) => `year${year}`);
    return ['name', ...yearIds, 'type', 'component'];
  }, [yearRange]);

  return (
    <EditableTable
      columns={tableColumns}
      data={allMetricRows}
      enableEditing={true}
      enableSorting={true}
      enableGlobalFilter={true}
      enableColumnFilters={true}
      enablePagination={false}
      enableColumnPinning={true}
      enableTopToolbar={false}
      initialSorting={[{ id: 'name', desc: false }]}
      tableOptions={{
        enableColumnActions: false,
        enableHiding: false,
        enableColumnDragging: false,
        enableColumnOrdering: false,
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
          paddingTop: '12px',
        },
        '& .MuiTableContainer-root': {
          maxWidth: '100%',
          overflowX: 'auto',
        },
      }}
    />
  );
}
