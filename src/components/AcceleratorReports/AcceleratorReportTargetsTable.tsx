import React, { type JSX, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { useTheme } from '@mui/material';
import {
  Badge,
  EditableTable,
  EditableTableColumn,
  EditableTableColumnV2,
  EditableTableV2,
} from '@terraware/web-components';
import { MRT_Cell } from 'material-react-table';

import { IndicatorClass, indicatorClassLabel } from 'src/components/AcceleratorReports/utils';
import { useFeatureEnabled } from 'src/features';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import {
  AutoCalculatedIndicatorPayload,
  useLazyListProjectIndicatorsQuery,
  useListAutoCalculatedIndicatorsQuery,
  useListCommonIndicatorsQuery,
} from 'src/queries/generated/acceleratorReportIndicators';
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
} from 'src/queries/generated/acceleratorReports';
import { formatPrecision } from 'src/utils/numbers';
import useSnackbar from 'src/utils/useSnackbar';

type RowIndicator = {
  name: string;
  description?: string;
  type: string;
  component: string;
  id: number;
  indicatorType: 'projectIndicator' | 'commonIndicator' | 'autoCalculatedIndicator';
  baseline?: number;
  endOfProjectTarget?: number;
  indicatorSystemName?: string;
  classId?: IndicatorClass;
  notes?: string;
  precision: number;
  [key: string]: string | number | undefined;
};

type TargetsColumn = {
  id: string;
  header: string;
  accessorKey: keyof RowIndicator;
  size?: number;
  enableEditing: boolean;
  render?: (value: unknown, row: RowIndicator) => ReactNode;
  onSave?: (row: RowIndicator, value: unknown) => Promise<void>;
};

const toColumnV1 = (column: TargetsColumn): EditableTableColumn<RowIndicator> => {
  const { render, onSave, ...rest } = column;
  return {
    ...rest,
    Cell: render
      ? ({ cell }: { cell: MRT_Cell<RowIndicator> }) => <>{render(cell.getValue(), cell.row.original)}</>
      : undefined,
    editConfig: onSave ? { editVariant: 'text', onSave } : undefined,
  };
};

const toColumnV2 = (column: TargetsColumn): EditableTableColumnV2<RowIndicator> => {
  const { render, onSave, ...rest } = column;
  return {
    ...rest,
    Cell: render ? ({ getValue, row }) => render(getValue(), row.original) : undefined,
    editConfig: onSave ? { editVariant: 'text', onSave: (row, value) => onSave(row, value) } : undefined,
  };
};

export default function AcceleratorReportTargetsTable(): JSX.Element {
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { currentAcceleratorProject } = useParticipantData();
  const { isAllowed } = useUser();
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = isAcceleratorRoute ? Number(pathParams.projectId) : currentAcceleratorProject?.id;
  const snackbar = useSnackbar();
  const isEditableTableV2Enabled = useFeatureEnabled('Editable Table V2');

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

  const years = getReportsYearsResponse.data?.years;

  const yearRange = useMemo(() => {
    if (years) {
      const endYear = years.endYear;
      const startYear = years.startYear;
      return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    } else {
      return [];
    }
  }, [years]);

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

  const allIndicatorRows = useMemo((): RowIndicator[] => {
    const projectIndicatorRows = projectIndicators.map((ind): RowIndicator => {
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
        indicatorType: 'projectIndicator',
        baseline: targets?.baseline,
        endOfProjectTarget: targets?.endOfProjectTarget,
        classId: ind.classId,
        notes: ind.notes,
        precision: ind.precision,
        ...targetByYear,
      };
    });

    const commonIndicatorRows = commonIndicators.map((ind): RowIndicator => {
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
        indicatorType: 'commonIndicator',
        baseline: targets?.baseline,
        endOfProjectTarget: targets?.endOfProjectTarget,
        classId: ind.classId,
        notes: ind.notes,
        precision: ind.precision,
        ...targetByYear,
      };
    });

    const autoCalculatedIndicatorRows = autoCalculatedIndicators.map((ind): RowIndicator => {
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
        indicatorType: 'autoCalculatedIndicator',
        indicatorSystemName: ind.indicator,
        baseline: targets?.baseline,
        endOfProjectTarget: targets?.endOfProjectTarget,
        classId: ind.classId,
        notes: ind.notes,
        precision: ind.precision,
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
    async (row: RowIndicator, value: any, year: number) => {
      if (!projectId) {
        return;
      }

      const newTarget = Number(value);
      if (isNaN(newTarget)) {
        snackbar.toastError();
        return;
      }

      try {
        switch (row.indicatorType) {
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
      strings,
      updateAutoCalculatedIndicatorTarget,
      updateCommonIndicatorTarget,
      updateProjectIndicatorTarget,
    ]
  );

  const onSaveBaseline = useCallback(
    async (row: RowIndicator, value: any) => {
      if (!projectId) {
        return;
      }

      const newBaseline = value === '' || value === null || value === undefined ? undefined : Number(value);
      if (newBaseline !== undefined && isNaN(newBaseline)) {
        snackbar.toastError();
        return;
      }

      try {
        switch (row.indicatorType) {
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
      strings,
      updateAutoCalculatedIndicatorBaselineTarget,
      updateCommonIndicatorBaselineTarget,
      updateProjectIndicatorBaselineTarget,
    ]
  );

  const onSaveEndOfProjectTarget = useCallback(
    async (row: RowIndicator, value: any) => {
      if (!projectId) {
        return;
      }

      const newEndOfProjectTarget = value === '' || value === null || value === undefined ? undefined : Number(value);
      if (newEndOfProjectTarget !== undefined && isNaN(newEndOfProjectTarget)) {
        snackbar.toastError();
        return;
      }

      try {
        switch (row.indicatorType) {
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
      strings,
      updateAutoCalculatedIndicatorBaselineTarget,
      updateCommonIndicatorBaselineTarget,
      updateProjectIndicatorBaselineTarget,
    ]
  );

  const theme = useTheme();

  const renderCategory = useCallback(
    (value: unknown) => {
      const category = value as string;
      const isGreen = category === 'Biodiversity' || category === 'Climate' || category === 'Project Objectives';
      return (
        <Badge
          label={category}
          backgroundColor={isGreen ? theme.palette.TwClrBgSuccessTertiary : theme.palette.TwClrBgWarningTertiary}
          borderColor={isGreen ? theme.palette.TwClrBrdrSuccess : theme.palette.TwClrBrdrWarning}
          labelColor={isGreen ? theme.palette.TwClrTxtSuccess : theme.palette.TwClrTxtWarning}
        />
      );
    },
    [theme]
  );

  const renderClassId = useCallback(
    (value: unknown) => <>{indicatorClassLabel(value as IndicatorClass | undefined, strings)}</>,
    [strings]
  );

  const renderNumeric = useCallback((raw: unknown, row: RowIndicator) => {
    if (raw === undefined || raw === null || raw === '') {
      return null;
    }
    const value = Number(raw);
    if (isNaN(value)) {
      return null;
    }
    return <>{formatPrecision(value, row.precision ?? 0)}</>;
  }, []);

  const tableColumns = useMemo((): TargetsColumn[] => {
    const baseColumns: TargetsColumn[] = [
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
        render: renderNumeric,
        onSave: onSaveBaseline,
      },
    ];

    const yearColumns: TargetsColumn[] = yearRange.map((year) => ({
      id: `year${year}`,
      header: year.toString(),
      accessorKey: `year${year}`,
      enableEditing: isAllowedUpdateReportsTargets,
      render: renderNumeric,
      onSave: (row: RowIndicator, value: unknown) => onSaveYearTarget(row, value, year),
    }));

    const lastColumns: TargetsColumn[] = [
      {
        id: 'category',
        header: strings.CATEGORY,
        accessorKey: 'component',
        enableEditing: false,
        render: renderCategory,
      },
      {
        id: 'indicatorLevel',
        header: strings.INDICATOR_LEVEL,
        accessorKey: 'type',
        enableEditing: false,
      },
      {
        id: 'cumulativeOrLevel',
        header: strings.IS_CUMULATIVE,
        accessorKey: 'classId',
        enableEditing: false,
        render: renderClassId,
      },
      {
        id: 'notes',
        header: strings.NOTES,
        accessorKey: 'notes',
        enableEditing: false,
      },
      {
        id: 'endOfProjectTarget',
        header: strings.END_OF_PROJECT_TARGET,
        accessorKey: 'endOfProjectTarget',
        enableEditing: isAllowedUpdateReportsTargets,
        render: renderNumeric,
        onSave: onSaveEndOfProjectTarget,
      },
    ];

    return [...baseColumns, ...yearColumns, ...lastColumns];
  }, [
    strings,
    yearRange,
    isAllowedUpdateReportsTargets,
    onSaveYearTarget,
    onSaveBaseline,
    onSaveEndOfProjectTarget,
    renderCategory,
    renderClassId,
    renderNumeric,
  ]);

  const tableColumnsV1 = useMemo(() => tableColumns.map(toColumnV1), [tableColumns]);
  const tableColumnsV2 = useMemo(() => tableColumns.map(toColumnV2), [tableColumns]);

  const columnOrder = useMemo(() => {
    const yearIds = yearRange.map((year) => `year${year}`);
    const metaColumns = ['category', 'indicatorLevel', 'cumulativeOrLevel', 'notes'];
    return ['name', 'baseline', ...yearIds, ...metaColumns, 'endOfProjectTarget'];
  }, [yearRange]);

  const sx = {
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
  };

  if (isEditableTableV2Enabled) {
    return (
      <EditableTableV2
        clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
        columns={tableColumnsV2}
        data={allIndicatorRows}
        enableEditing={true}
        enableSorting={true}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enablePagination={false}
        enableColumnPinning={true}
        enableColumnActions={false}
        enableHiding={false}
        enableTopToolbar={false}
        initialSorting={[{ id: 'name', desc: false }]}
        tableOptions={{
          state: {
            columnOrder,
          },
          initialState: {
            columnPinning: {
              left: ['name'],
              right: ['endOfProjectTarget'],
            },
          },
        }}
        containerProps={{ sx: { maxHeight: 'none', overflowX: 'auto' } }}
        sx={sx}
      />
    );
  }

  return (
    <EditableTable
      clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
      columns={tableColumnsV1}
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
      sx={sx}
    />
  );
}
