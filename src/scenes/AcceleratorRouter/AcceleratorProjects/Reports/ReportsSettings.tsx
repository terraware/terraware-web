import React, { type JSX, type ReactNode, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Badge, Button, EditableTableCellContext, EditableTableColumn, Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { IndicatorClass, indicatorClassLabel } from 'src/components/AcceleratorReports/utils';
import Card from 'src/components/common/Card';
import EditableTable from 'src/components/common/EditableTable';
import Link from 'src/components/common/Link';
import useBoolean from 'src/hooks/useBoolean';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization, useUser } from 'src/providers';
import { useListAcceleratorReportConfigQuery } from 'src/queries/generated/acceleratorReports';
import {
  ExistingCommonIndicatorPayload,
  ExistingProjectIndicatorPayload,
  ProjectAutoCalculatedIndicatorPayload,
  useListProjectAutoCalculatedIndicatorsQuery,
  useListProjectCommonIndicatorsQuery,
  useListProjectSpecificIndicatorsQuery,
} from 'src/queries/generated/indicators';

import EditAutoCalculatedIndicatorModal from './EditAutoCalculatedIndicatorModal';
import EditCommonIndicatorModal from './EditCommonIndicatorModal';
import EditProjectIndicatorModal from './EditProjectIndicatorModal';

type IndicatorRow = {
  id: string;
  name: string;
  unit?: string;
  description?: string;
  isCommon: boolean;
  reference?: string;
  category: string;
  classId?: IndicatorClass;
  level: string;
  active: boolean;
  primaryDataSource?: string;
  frequencyOfReporting?: string;
  tfOwnerReviewer?: string;
  notes?: string;
  indicatorType: 'project' | 'common' | 'autoCalculated';
  originalProjectIndicator?: ExistingProjectIndicatorPayload;
  originalCommonIndicator?: ExistingCommonIndicatorPayload;
  originalAutoCalculatedIndicator?: ProjectAutoCalculatedIndicatorPayload;
};

type SortableRow = { getValue: (columnId: string) => unknown };

/** Ref IDs are optional per project; rows without one sort after the rest. */
const refIdSortingFn = (rowA: SortableRow, rowB: SortableRow, columnId: string) => {
  const a = rowA.getValue(columnId) as string | undefined;
  const b = rowB.getValue(columnId) as string | undefined;
  if (!a || !b) {
    return a ? -1 : b ? 1 : 0;
  }
  return a.localeCompare(b);
};

type ReportsSettingsProps = {
  header?: ReactNode;
};

export default function ReportsSettings({ header }: ReportsSettingsProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const { strings } = useLocalization();
  const theme = useTheme();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const { goToAcceleratorEditReportSettings, goToNewIndicator } = useNavigateTo();
  const [selectedProjectIndicator, setSelectedProjectIndicator] = useState<ExistingProjectIndicatorPayload>();
  const [selectedCommonIndicator, setSelectedCommonIndicator] = useState<ExistingCommonIndicatorPayload>();
  const [selectedAutoCalculatedIndicator, setSelectedAutoCalculatedIndicator] =
    useState<ProjectAutoCalculatedIndicatorPayload>();
  const [editProjectIndicatorModalOpened, , openEditProjectIndicatorModal, closeEditProjectIndicatorModal] =
    useBoolean(false);
  const [editCommonIndicatorModalOpened, , openEditCommonIndicatorModal, closeEditCommonIndicatorModal] =
    useBoolean(false);
  const [
    editAutoCalculatedIndicatorModalOpened,
    ,
    openEditAutoCalculatedIndicatorModal,
    closeEditAutoCalculatedIndicatorModal,
  ] = useBoolean(false);
  const { isAllowed } = useUser();

  const listProjectReportConfigResponse = useListAcceleratorReportConfigQuery(projectId);
  const projectReportConfig = useMemo(
    () => listProjectReportConfigResponse.data?.configs?.[0],
    [listProjectReportConfigResponse.data?.configs]
  );

  const { data: projectIndicatorsResponse } = useListProjectSpecificIndicatorsQuery(projectId);
  const projectIndicators = useMemo(
    () => projectIndicatorsResponse?.indicators ?? [],
    [projectIndicatorsResponse?.indicators]
  );

  const { data: autoCalculatedIndicatorsResponse } = useListProjectAutoCalculatedIndicatorsQuery(projectId);
  const autoCalculatedIndicators = useMemo(
    () => autoCalculatedIndicatorsResponse?.indicators ?? [],
    [autoCalculatedIndicatorsResponse?.indicators]
  );

  const { data: commonIndicatorsResponse } = useListProjectCommonIndicatorsQuery(projectId);
  const commonIndicators = useMemo(
    () => commonIndicatorsResponse?.indicators ?? [],
    [commonIndicatorsResponse?.indicators]
  );

  const gridSize = isMobile ? 12 : 4;

  const gridStyle = {
    borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(4),
  };

  const data: Record<string, any>[] = useMemo(() => {
    return [
      { label: strings.START_DATE, value: projectReportConfig?.reportingStartDate },
      { label: strings.END_DATE, value: projectReportConfig?.reportingEndDate },
    ];
  }, [projectReportConfig, strings]);

  const goToEditSettings = useCallback(() => {
    goToAcceleratorEditReportSettings(projectId.toString());
  }, [goToAcceleratorEditReportSettings, projectId]);

  const editSettingsButton = isAllowed('UPDATE_REPORTS_SETTINGS') && (
    <Button icon='iconEdit' onClick={goToEditSettings} priority='secondary' label={strings.EDIT_SETTINGS} />
  );

  const goToAddIndicator = useCallback(() => {
    goToNewIndicator(projectId.toString());
  }, [goToNewIndicator, projectId]);

  const allIndicatorRows = useMemo((): IndicatorRow[] => {
    const projectRows: IndicatorRow[] = projectIndicators.map((ind) => ({
      id: `project-${ind.id}`,
      name: ind.name,
      unit: ind.unit,
      description: ind.description,
      isCommon: false,
      reference: ind.refId,
      category: ind.category,
      classId: ind.classId,
      level: ind.level,
      active: ind.active,
      primaryDataSource: ind.primaryDataSource,
      frequencyOfReporting: ind.frequency,
      tfOwnerReviewer: ind.tfOwner,
      notes: ind.notes,
      indicatorType: 'project',
      originalProjectIndicator: ind,
    }));

    const commonRows: IndicatorRow[] = commonIndicators.map((ind: ExistingCommonIndicatorPayload) => ({
      id: `common-${ind.id}`,
      name: ind.name,
      unit: ind.unit,
      description: ind.description,
      isCommon: true,
      reference: ind.refId,
      category: ind.category,
      classId: ind.classId,
      level: ind.level,
      active: ind.active,
      primaryDataSource: ind.primaryDataSource,
      frequencyOfReporting: ind.frequency,
      tfOwnerReviewer: ind.tfOwner,
      notes: ind.notes,
      indicatorType: 'common',
      originalCommonIndicator: ind,
    }));

    const autoRows: IndicatorRow[] = autoCalculatedIndicators.map((ind: ProjectAutoCalculatedIndicatorPayload) => ({
      id: `auto-${ind.indicator}`,
      name: ind.name,
      unit: ind.unit,
      description: ind.description,
      isCommon: true,
      reference: ind.refId,
      category: ind.category,
      classId: ind.classId,
      level: ind.level,
      active: ind.active,
      primaryDataSource: ind.primaryDataSource ?? strings.TW_DATA,
      frequencyOfReporting: ind.frequency,
      tfOwnerReviewer: ind.tfOwner,
      notes: ind.notes,
      indicatorType: 'autoCalculated',
      originalAutoCalculatedIndicator: ind,
    }));

    return [...autoRows, ...commonRows, ...projectRows];
  }, [projectIndicators, commonIndicators, autoCalculatedIndicators, strings.TW_DATA]);

  const onClickIndicatorRow = useCallback(
    (row: IndicatorRow) => {
      if (row.originalProjectIndicator) {
        setSelectedProjectIndicator(row.originalProjectIndicator);
        openEditProjectIndicatorModal();
      } else if (row.originalCommonIndicator) {
        setSelectedCommonIndicator(row.originalCommonIndicator);
        openEditCommonIndicatorModal();
      } else if (row.originalAutoCalculatedIndicator) {
        setSelectedAutoCalculatedIndicator(row.originalAutoCalculatedIndicator);
        openEditAutoCalculatedIndicatorModal();
      }
    },
    [openEditProjectIndicatorModal, openEditCommonIndicatorModal, openEditAutoCalculatedIndicatorModal]
  );

  const NameCell = useCallback(
    ({ row: { original: row } }: EditableTableCellContext<IndicatorRow>) => {
      if (isAllowed('UPDATE_REPORTS_SETTINGS')) {
        return (
          <Link fontSize='16px' onClick={() => onClickIndicatorRow(row)} style={{ textAlign: 'left' }}>
            {row.name}
          </Link>
        );
      }
      return <span>{row.name}</span>;
    },
    [isAllowed, onClickIndicatorRow]
  );

  const CategoryCell = useCallback(
    ({ cell }: EditableTableCellContext<IndicatorRow>) => {
      const category = cell.getValue() as string;
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

  const CommonCell = useCallback(
    ({ cell }: EditableTableCellContext<IndicatorRow>) => {
      const isCommon = Boolean(cell.getValue());
      if (isCommon) {
        return (
          <Badge
            label={strings.COMMON}
            backgroundColor={theme.palette.TwClrBgSuccessTertiary}
            borderColor={theme.palette.TwClrBrdrSuccess}
            labelColor={theme.palette.TwClrTxtSuccess}
          />
        );
      }
      return (
        <Badge
          label={strings.PROJECT}
          backgroundColor={theme.palette.TwClrBgWarningTertiary}
          borderColor={theme.palette.TwClrBrdrWarning}
          labelColor={theme.palette.TwClrTxtWarning}
        />
      );
    },
    [theme, strings.COMMON, strings.PROJECT]
  );

  const PrimaryDataSourceCell = useCallback(
    ({ cell }: EditableTableCellContext<IndicatorRow>) => {
      const value = cell.getValue() as string;
      if (value === strings.TW_DATA) {
        return (
          <Badge
            label={value}
            backgroundColor={theme.palette.TwClrBgSuccessTertiary}
            borderColor={theme.palette.TwClrBrdrSuccess}
            labelColor={theme.palette.TwClrTxtSuccess}
          />
        );
      }
      return <span>{value ?? ''}</span>;
    },
    [theme, strings.TW_DATA]
  );

  const ClassIdCell = useCallback(
    ({ cell }: EditableTableCellContext<IndicatorRow>) => {
      return <>{indicatorClassLabel(cell.getValue() as IndicatorClass, strings)}</>;
    },
    [strings]
  );

  const ReferenceCell = useCallback(({ cell }: EditableTableCellContext<IndicatorRow>) => {
    return <>{(cell.getValue() as string | undefined) || '-'}</>;
  }, []);

  const ActiveCell = useCallback(
    ({ cell }: EditableTableCellContext<IndicatorRow>) => {
      const isActive = Boolean(cell.getValue());
      return <>{isActive ? strings.YES : strings.NO}</>;
    },
    [strings]
  );

  const indicatorColumns = useMemo(
    (): EditableTableColumn<IndicatorRow>[] => [
      {
        id: 'name',
        header: strings.INDICATOR_NAME,
        accessorKey: 'name',
        enableEditing: false,
        size: 240,
        Cell: NameCell,
      },
      {
        id: 'unit',
        header: strings.UNIT,
        accessorKey: 'unit',
        enableEditing: false,
        size: 100,
      },
      {
        id: 'description',
        header: strings.DEFINITION,
        accessorKey: 'description',
        enableEditing: false,
        size: 220,
      },
      {
        id: 'isCommon',
        header: strings.COMMON_QUESTION,
        accessorKey: 'isCommon',
        enableEditing: false,
        size: 120,
        Cell: CommonCell,
      },
      {
        id: 'reference',
        header: strings.REF_ID,
        accessorKey: 'reference',
        enableEditing: false,
        size: 100,
        Cell: ReferenceCell,
        sortingFn: refIdSortingFn,
      },
      {
        id: 'category',
        header: strings.CATEGORY,
        accessorKey: 'category',
        enableEditing: false,
        size: 140,
        Cell: CategoryCell,
      },
      {
        id: 'classId',
        header: strings.IS_CUMULATIVE,
        accessorKey: 'classId',
        enableEditing: false,
        size: 160,
        Cell: ClassIdCell,
      },
      {
        id: 'level',
        header: strings.INDICATOR_LEVEL,
        accessorKey: 'level',
        enableEditing: false,
        size: 140,
      },
      {
        id: 'active',
        header: strings.ACTIVE,
        accessorKey: 'active',
        enableEditing: false,
        size: 120,
        Cell: ActiveCell,
      },
      {
        id: 'primaryDataSource',
        header: strings.PRIMARY_DATA_SOURCE,
        accessorKey: 'primaryDataSource',
        enableEditing: false,
        size: 180,
        Cell: PrimaryDataSourceCell,
      },
      {
        id: 'frequencyOfReporting',
        header: strings.FREQUENCY_OF_REPORTING,
        accessorKey: 'frequencyOfReporting',
        enableEditing: false,
        size: 180,
      },
      {
        id: 'tfOwnerReviewer',
        header: strings.TF_OWNER_REVIEWER,
        accessorKey: 'tfOwnerReviewer',
        enableEditing: false,
        size: 180,
      },
      {
        id: 'notes',
        header: strings.NOTES,
        accessorKey: 'notes',
        enableEditing: false,
        size: 200,
      },
    ],
    [strings, NameCell, CommonCell, CategoryCell, ReferenceCell, PrimaryDataSourceCell, ActiveCell, ClassIdCell]
  );

  return (
    <>
      {editProjectIndicatorModalOpened && selectedProjectIndicator && (
        <EditProjectIndicatorModal
          onClose={closeEditProjectIndicatorModal}
          projectIndicator={selectedProjectIndicator}
        />
      )}
      {editCommonIndicatorModalOpened && selectedCommonIndicator && (
        <EditCommonIndicatorModal onClose={closeEditCommonIndicatorModal} commonIndicator={selectedCommonIndicator} />
      )}
      {editAutoCalculatedIndicatorModalOpened && selectedAutoCalculatedIndicator && (
        <EditAutoCalculatedIndicatorModal
          onClose={closeEditAutoCalculatedIndicatorModal}
          autoCalculatedIndicator={selectedAutoCalculatedIndicator}
        />
      )}
      <Card
        style={{ display: 'flex', flexDirection: 'column' }}
        rightComponent={header ? undefined : editSettingsButton}
      >
        {header && (
          <Box
            alignItems='center'
            display='flex'
            justifyContent='space-between'
            marginBottom={theme.spacing(2)}
            minHeight='42px'
          >
            {header}
            {editSettingsButton}
          </Box>
        )}
        <Grid container sx={gridStyle}>
          {data.map((datum, index) => (
            <Grid key={index} marginTop={2} size={gridSize}>
              <Textfield
                id={`plot-observation-${index}`}
                label={datum.label}
                value={datum.value}
                type={datum.text ? 'textarea' : 'text'}
                preserveNewlines={true}
                display={true}
              />
            </Grid>
          ))}
          <Grid marginTop={2} size={gridSize}>
            <Box>
              <Typography
                fontSize={'14px'}
                color={theme.palette.TwClrTxtSecondary}
                paddingBottom={'12px'}
                lineHeight={'20px'}
              >
                {strings.LOG_FRAME_AND_ME_PLAN_URL}
              </Typography>
              <Link to={projectReportConfig?.logframeUrl} target='_blank' fontSize={'16px'}>
                {projectReportConfig?.logframeUrl}
              </Link>
            </Box>
          </Grid>
        </Grid>
        {isAllowed('UPDATE_REPORTS_SETTINGS') && (
          <Box display='flex' justifyContent='flex-end' marginBottom={theme.spacing(2)}>
            <Button icon='plus' label={strings.ADD_INDICATOR} onClick={goToAddIndicator} priority='secondary' />
          </Box>
        )}
        <EditableTable
          supportsV2
          clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
          columns={indicatorColumns}
          data={allIndicatorRows}
          enableEditing={false}
          enableSorting={true}
          enableGlobalFilter={true}
          enableColumnFilters={false}
          enablePagination={false}
          enableColumnPinning={true}
          enableTopToolbar={false}
          initialSorting={[{ id: 'name', desc: false }]}
          enableColumnActions={false}
          enableHiding={false}
          enableColumnDragging={false}
          enableColumnOrdering={false}
          containerProps={{
            sx: { maxHeight: 'none', overflowX: 'auto' },
          }}
          tableOptions={{
            initialState: {
              columnPinning: { left: ['name'] },
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
      </Card>
    </>
  );
}
