import React, { type JSX, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { EditableTable, EditableTableColumn } from '@terraware/web-components';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useOrganization, useUser } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import {
  AutoCalculatedIndicatorPayload,
  useLazyListProjectIndicatorsQuery,
  useListAutoCalculatedIndicatorsQuery,
  useListCommonIndicatorsQuery,
} from 'src/queries/generated/indicators';
import {
  useLazyGetAcceleratorReportYearsQuery,
  useLazyGetAutoCalculatedIndicatorTargetsQuery,
  useLazyGetCommonIndicatorTargetsQuery,
  useLazyGetProjectIndicatorTargetsQuery,
  useUpdateAutoCalculatedIndicatorBaselineTargetMutation,
  useUpdateAutoCalculatedIndicatorTargetMutation,
  useUpdateCommonIndicatorBaselineTargetMutation,
  useUpdateCommonIndicatorTargetMutation,
  useUpdateProjectIndicatorBaselineTargetMutation,
  useUpdateProjectIndicatorTargetMutation,
} from 'src/queries/generated/reports';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

export type RowMetric = {
  name: string;
  description?: string;
  type: string;
  component: string;
  id: number;
  metricType: 'projectIndicator' | 'commonIndicator' | 'autoCalculatedIndicator';
  baseline?: number;
  endOfProjectTarget?: number;
  indicatorSystemName?: string;
  [key: string]: string | number | undefined;
};

export default function AcceleratorReportTargetsTable(): JSX.Element {
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { currentAcceleratorProject } = useParticipantData();
  const { isAllowed } = useUser();
  const { selectedOrganization } = useOrganization();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = isAcceleratorRoute ? Number(pathParams.projectId) : currentAcceleratorProject?.id;
  const snackbar = useSnackbar();

  const [getReportsYears, getReportsYearsResponse] = useLazyGetAcceleratorReportYearsQuery();
  const [listProjectIndicators, listProjectIndicatorsResponse] = useLazyListProjectIndicatorsQuery();
  const listAutoCalculatedIndicatorsResponse = useListAutoCalculatedIndicatorsQuery();
  const listCommonIndicatorsResponse = useListCommonIndicatorsQuery();

  const [updateProjectIndicatorTarget] = useUpdateProjectIndicatorTargetMutation();
  const [updateCommonIndicatorTarget] = useUpdateCommonIndicatorTargetMutation();
  const [updateAutoCalculatedIndicatorTarget] = useUpdateAutoCalculatedIndicatorTargetMutation();
  const [updateProjectIndicatorBaselineTarget] = useUpdateProjectIndicatorBaselineTargetMutation();
  const [updateCommonIndicatorBaselineTarget] = useUpdateCommonIndicatorBaselineTargetMutation();
  const [updateAutoCalculatedIndicatorBaselineTarget] = useUpdateAutoCalculatedIndicatorBaselineTargetMutation();

  const [listProjectIndicatorTargets, listProjectIndicatorTargetsResponse] = useLazyGetProjectIndicatorTargetsQuery();
  const [listCommonIndicatorTargets, listCommonIndicatorTargetsResponse] = useLazyGetCommonIndicatorTargetsQuery();
  const [listAutoCalculatedIndicatorTargets, listAutoCalculatedIndicatorTargetsResponse] =
    useLazyGetAutoCalculatedIndicatorTargetsQuery();

  const isAllowedUpdateReportsTargets = useMemo(
    () => isAllowed('UPDATE_REPORTS_TARGETS', { organization: selectedOrganization }),
    [isAllowed, selectedOrganization]
  );

  const getReportsYearsResponseDataYears = getReportsYearsResponse.data?.years;

  const yearRange = useMemo(() => {
    if (getReportsYearsResponseDataYears) {
      const endYear = getReportsYearsResponseDataYears.endYear;
      const startYear = getReportsYearsResponseDataYears.startYear;
      return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    } else {
      return [];
    }
  }, [getReportsYearsResponseDataYears]);

  const projectIndicators = useMemo(
    () => listProjectIndicatorsResponse.data?.indicators ?? [],
    [listProjectIndicatorsResponse.data?.indicators]
  );
  const autoCalculatedIndicators = useMemo(
    () => listAutoCalculatedIndicatorsResponse.data?.indicators ?? [],
    [listAutoCalculatedIndicatorsResponse.data?.indicators]
  );
  const commonIndicators = useMemo(
    () => listCommonIndicatorsResponse.data?.indicators ?? [],
    [listCommonIndicatorsResponse.data?.indicators]
  );

  const projectIndicatorTargets = useMemo(
    () => listProjectIndicatorTargetsResponse.data?.targets ?? [],
    [listProjectIndicatorTargetsResponse.data?.targets]
  );
  const commonIndicatorTargets = useMemo(
    () => listCommonIndicatorTargetsResponse.data?.targets ?? [],
    [listCommonIndicatorTargetsResponse.data?.targets]
  );
  const autoCalculatedIndicatorTargets = useMemo(
    () => listAutoCalculatedIndicatorTargetsResponse.data?.targets ?? [],
    [listAutoCalculatedIndicatorTargetsResponse.data?.targets]
  );

  const allIndicatorRows = useMemo((): RowMetric[] => {
    const projectIndicatorRows = projectIndicators.map((ind): RowMetric => {
      const targets = projectIndicatorTargets.find((t) => t.indicatorId === ind.id);
      const targetByYear: { [yearKey: string]: number | undefined } = {};
      targets?.yearlyTargets.forEach((yt) => {
        targetByYear[`year${yt.year}`] = yt.target;
      });
      return {
        name: ind.name,
        type: ind.level,
        component: ind.category,
        id: ind.id,
        description: ind.description,
        metricType: 'projectIndicator',
        baseline: targets?.baseline,
        endOfProjectTarget: targets?.endOfProjectTarget,
        ...targetByYear,
      };
    });

    const commonIndicatorRows = commonIndicators.map((ind): RowMetric => {
      const targets = commonIndicatorTargets.find((t) => t.indicatorId === ind.id);
      const targetByYear: { [yearKey: string]: number | undefined } = {};
      targets?.yearlyTargets.forEach((yt) => {
        targetByYear[`year${yt.year}`] = yt.target;
      });
      return {
        name: ind.name,
        type: ind.level,
        component: ind.category,
        id: ind.id,
        description: ind.description,
        metricType: 'commonIndicator',
        baseline: targets?.baseline,
        endOfProjectTarget: targets?.endOfProjectTarget,
        ...targetByYear,
      };
    });

    const autoCalculatedIndicatorRows = autoCalculatedIndicators.map((ind): RowMetric => {
      const targets = autoCalculatedIndicatorTargets.find((t) => t.indicatorId === ind.indicator);
      const targetByYear: { [yearKey: string]: number | undefined } = {};
      targets?.yearlyTargets.forEach((yt) => {
        targetByYear[`year${yt.year}`] = yt.target;
      });
      return {
        name: ind.name,
        type: ind.level,
        component: ind.category,
        id: -1,
        description: ind.description,
        metricType: 'autoCalculatedIndicator',
        indicatorSystemName: ind.indicator,
        baseline: targets?.baseline,
        endOfProjectTarget: targets?.endOfProjectTarget,
        ...targetByYear,
      };
    });

    return [...projectIndicatorRows, ...commonIndicatorRows, ...autoCalculatedIndicatorRows];
  }, [
    autoCalculatedIndicatorTargets,
    autoCalculatedIndicators,
    commonIndicatorTargets,
    commonIndicators,
    projectIndicatorTargets,
    projectIndicators,
  ]);

  useEffect(() => {
    if (projectId) {
      void getReportsYears(projectId, true);
      void listProjectIndicators(projectId, true);
      void listProjectIndicatorTargets(projectId, true);
      void listCommonIndicatorTargets(projectId, true);
      void listAutoCalculatedIndicatorTargets(projectId, true);
    }
  }, [
    getReportsYears,
    listAutoCalculatedIndicatorTargets,
    listCommonIndicatorTargets,
    listProjectIndicatorTargets,
    listProjectIndicators,
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
          case 'projectIndicator':
            await updateProjectIndicatorTarget({
              projectId,
              updateProjectIndicatorTargetRequestPayload: {
                indicatorId: row.id,
                target: newTarget,
                year,
              },
            }).unwrap();
            break;
          case 'commonIndicator':
            await updateCommonIndicatorTarget({
              projectId,
              updateCommonIndicatorTargetRequestPayload: {
                indicatorId: row.id,
                target: newTarget,
                year,
              },
            }).unwrap();
            break;
          case 'autoCalculatedIndicator':
            await updateAutoCalculatedIndicatorTarget({
              projectId,
              updateAutoCalculatedIndicatorTargetRequestPayload: {
                indicator: row.indicatorSystemName as AutoCalculatedIndicatorPayload['indicator'],
                target: newTarget,
                year,
              },
            }).unwrap();
            break;
        }
        snackbar.toastSuccess(strings.CHANGES_SAVED);
      } catch (error) {
        snackbar.toastError();
      }
    },
    [
      projectId,
      snackbar,
      updateAutoCalculatedIndicatorTarget,
      updateCommonIndicatorTarget,
      updateProjectIndicatorTarget,
    ]
  );

  const onSaveBaseline = useCallback(
    async (row: RowMetric, value: any) => {
      if (!projectId) {
        return;
      }

      const newBaseline = value === '' || value === null || value === undefined ? undefined : Number(value);
      if (newBaseline !== undefined && isNaN(newBaseline)) {
        snackbar.toastError();
        return;
      }

      try {
        switch (row.metricType) {
          case 'projectIndicator':
            await updateProjectIndicatorBaselineTarget({
              projectId,
              updateProjectIndicatorBaselineTargetRequestPayload: {
                indicatorId: row.id,
                baseline: newBaseline,
                endOfProjectTarget: row.endOfProjectTarget,
              },
            }).unwrap();
            break;
          case 'commonIndicator':
            await updateCommonIndicatorBaselineTarget({
              projectId,
              updateCommonIndicatorBaselineTargetRequestPayload: {
                indicatorId: row.id,
                baseline: newBaseline,
                endOfProjectTarget: row.endOfProjectTarget,
              },
            }).unwrap();
            break;
          case 'autoCalculatedIndicator':
            await updateAutoCalculatedIndicatorBaselineTarget({
              projectId,
              updateAutoCalculatedIndicatorBaselineTargetRequestPayload: {
                indicator: row.indicatorSystemName as AutoCalculatedIndicatorPayload['indicator'],
                baseline: newBaseline,
                endOfProjectTarget: row.endOfProjectTarget,
              },
            }).unwrap();
            break;
          default:
            return;
        }
        snackbar.toastSuccess(strings.CHANGES_SAVED);
      } catch (error) {
        snackbar.toastError();
      }
    },
    [
      projectId,
      snackbar,
      updateAutoCalculatedIndicatorBaselineTarget,
      updateCommonIndicatorBaselineTarget,
      updateProjectIndicatorBaselineTarget,
    ]
  );

  const onSaveEndOfProjectTarget = useCallback(
    async (row: RowMetric, value: any) => {
      if (!projectId) {
        return;
      }

      const newEndOfProjectTarget = value === '' || value === null || value === undefined ? undefined : Number(value);
      if (newEndOfProjectTarget !== undefined && isNaN(newEndOfProjectTarget)) {
        snackbar.toastError();
        return;
      }

      try {
        switch (row.metricType) {
          case 'projectIndicator':
            await updateProjectIndicatorBaselineTarget({
              projectId,
              updateProjectIndicatorBaselineTargetRequestPayload: {
                indicatorId: row.id,
                baseline: row.baseline,
                endOfProjectTarget: newEndOfProjectTarget,
              },
            }).unwrap();
            break;
          case 'commonIndicator':
            await updateCommonIndicatorBaselineTarget({
              projectId,
              updateCommonIndicatorBaselineTargetRequestPayload: {
                indicatorId: row.id,
                baseline: row.baseline,
                endOfProjectTarget: newEndOfProjectTarget,
              },
            }).unwrap();
            break;
          case 'autoCalculatedIndicator':
            await updateAutoCalculatedIndicatorBaselineTarget({
              projectId,
              updateAutoCalculatedIndicatorBaselineTargetRequestPayload: {
                indicator: row.indicatorSystemName as AutoCalculatedIndicatorPayload['indicator'],
                baseline: row.baseline,
                endOfProjectTarget: newEndOfProjectTarget,
              },
            }).unwrap();
            break;
          default:
            return;
        }
        snackbar.toastSuccess(strings.CHANGES_SAVED);
      } catch (error) {
        snackbar.toastError();
      }
    },
    [
      projectId,
      snackbar,
      updateAutoCalculatedIndicatorBaselineTarget,
      updateCommonIndicatorBaselineTarget,
      updateProjectIndicatorBaselineTarget,
    ]
  );

  const tableColumns = useMemo(() => {
    const baseColumns: EditableTableColumn<RowMetric>[] = [
      {
        id: 'name',
        header: strings.INDICATOR_NAME,
        accessorKey: 'name',
        size: 300,
        enableEditing: false,
      },
      {
        id: 'baseline',
        header: strings.BASELINE,
        accessorKey: 'baseline',
        enableEditing: isAllowedUpdateReportsTargets,
        editConfig: {
          editVariant: 'text',
          onSave: (row: RowMetric, value: any) => onSaveBaseline(row, value),
        },
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
      {
        id: 'endOfProjectTarget',
        header: strings.END_OF_PROJECT_TARGET,
        accessorKey: 'endOfProjectTarget',
        enableEditing: isAllowedUpdateReportsTargets,
        editConfig: {
          editVariant: 'text',
          onSave: (row: RowMetric, value: any) => onSaveEndOfProjectTarget(row, value),
        },
      },
    ];

    return [...baseColumns, ...yearColumns, ...lastColumns];
  }, [yearRange, isAllowedUpdateReportsTargets, onSaveYearTarget, onSaveBaseline, onSaveEndOfProjectTarget]);

  const columnOrder = useMemo(() => {
    const yearIds = yearRange.map((year) => `year${year}`);
    return ['name', 'baseline', ...yearIds, 'type', 'component', 'endOfProjectTarget'];
  }, [yearRange]);

  return (
    <EditableTable
      columns={tableColumns}
      data={allIndicatorRows}
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
            right: ['endOfProjectTarget'],
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
