import React, { type JSX, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Badge, Button, EditableTable, EditableTableColumn, Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { MRT_Cell } from 'material-react-table';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import useBoolean from 'src/hooks/useBoolean';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization, useUser } from 'src/providers';
import {
  AutoCalculatedIndicatorPayload,
  ExistingCommonIndicatorPayload,
  ExistingProjectIndicatorPayload,
  useListAutoCalculatedIndicatorsQuery,
  useListCommonIndicatorsQuery,
  useListProjectIndicatorsQuery,
} from 'src/queries/generated/indicators';
import { useListAcceleratorReportConfigQuery } from 'src/queries/generated/reports';

import EditCommonIndicatorModal from './EditCommonIndicatorModal';
import EditProjectIndicatorModal from './EditProjectIndicatorModal';

export default function ReportsSettings(): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const { strings } = useLocalization();
  const theme = useTheme();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const { goToAcceleratorEditReportSettings } = useNavigateTo();
  const [selectedProjectIndicator, setSelectedProjectIndicator] = useState<ExistingProjectIndicatorPayload>();
  const [selectedCommonIndicator, setSelectedCommonIndicator] = useState<ExistingCommonIndicatorPayload>();
  const [editProjectIndicatorModalOpened, , openEditProjectIndicatorModal, closeEditProjectIndicatorModal] =
    useBoolean(false);
  const [editCommonIndicatorModalOpened, , openEditCommonIndicatorModal, closeEditCommonIndicatorModal] =
    useBoolean(false);
  const { isAllowed } = useUser();

  const listProjectReportConfigResponse = useListAcceleratorReportConfigQuery(projectId);
  const projectReportConfig = useMemo(
    () => listProjectReportConfigResponse.data?.configs?.[0],
    [listProjectReportConfigResponse.data?.configs]
  );

  const { data: projectIndicatorsResponse } = useListProjectIndicatorsQuery(projectId);
  const projectIndicators = useMemo(
    () => projectIndicatorsResponse?.indicators ?? [],
    [projectIndicatorsResponse?.indicators]
  );

  const { data: autoCalculatedIndicatorsResponse } = useListAutoCalculatedIndicatorsQuery();
  const autoCalculatedIndicators = useMemo(
    () => autoCalculatedIndicatorsResponse?.indicators ?? [],
    [autoCalculatedIndicatorsResponse?.indicators]
  );

  const { data: commonIndicatorsResponse } = useListCommonIndicatorsQuery();
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

  type IndicatorRow = {
    id: string;
    name: string;
    unit?: string;
    description?: string;
    isCommon: boolean;
    reference: string;
    category: string;
    classId?: string;
    level: string;
    active: boolean;
    primaryDataSource?: string;
    frequencyOfReporting?: string;
    tfOwnerReviewer?: string;
    notes?: string;
    indicatorType: 'project' | 'common' | 'autoCalculated';
    originalProjectIndicator?: ExistingProjectIndicatorPayload;
    originalCommonIndicator?: ExistingCommonIndicatorPayload;
  };

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

    const autoRows: IndicatorRow[] = autoCalculatedIndicators.map((ind: AutoCalculatedIndicatorPayload) => ({
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
      primaryDataSource: strings.TW_DATA,
      frequencyOfReporting: ind.frequency,
      tfOwnerReviewer: ind.tfOwner,
      notes: ind.notes,
      indicatorType: 'autoCalculated',
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
      }
    },
    [openEditProjectIndicatorModal, openEditCommonIndicatorModal]
  );

  const NameCell = useCallback(
    ({ cell }: { cell: MRT_Cell<IndicatorRow> }) => {
      const row = cell.row.original;
      if (row.indicatorType !== 'autoCalculated' && isAllowed('UPDATE_REPORTS_SETTINGS')) {
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
    ({ cell }: { cell: MRT_Cell<IndicatorRow> }) => {
      const category = cell.getValue<string>();
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
    ({ cell }: { cell: MRT_Cell<IndicatorRow> }) => {
      const isCommon = cell.getValue<boolean>();
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
    ({ cell }: { cell: MRT_Cell<IndicatorRow> }) => {
      const value = cell.getValue<string | undefined>();
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
    ({ cell }: { cell: MRT_Cell<IndicatorRow> }) => {
      const classId = cell.getValue<string>();
      return <>{classId === 'Cumulative' ? strings.CUMULATIVE : strings.LEVEL}</>;
    },
    [strings]
  );

  const ActiveCell = useCallback(
    ({ cell }: { cell: MRT_Cell<IndicatorRow> }) => {
      const isActive = cell.getValue<boolean>();
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
        header: strings.CUMULATIVE_OR_LEVEL,
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
    [strings, NameCell, CommonCell, CategoryCell, PrimaryDataSourceCell, ActiveCell, ClassIdCell]
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
      <Card
        style={{ display: 'flex', flexDirection: 'column' }}
        title={strings.SETTINGS}
        rightComponent={
          isAllowed('UPDATE_REPORTS_SETTINGS') && (
            <Button icon='iconEdit' onClick={goToEditSettings} priority='secondary' label={strings.EDIT_SETTINGS} />
          )
        }
      >
        <Grid container sx={gridStyle}>
          {data.map((datum, index) => (
            <Grid key={index} item xs={gridSize} marginTop={2}>
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
          <Grid item xs={gridSize} marginTop={2}>
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
        <EditableTable
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
          tableOptions={{
            enableColumnActions: false,
            enableHiding: false,
            enableColumnDragging: false,
            enableColumnOrdering: false,
            initialState: {
              columnPinning: { left: ['name'] },
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
      </Card>
    </>
  );
}
