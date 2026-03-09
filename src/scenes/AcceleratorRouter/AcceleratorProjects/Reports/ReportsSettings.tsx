import React, { type JSX, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import {
  Badge,
  Button,
  EditableTable,
  EditableTableColumn,
  TableColumnType,
  Textfield,
} from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { MRT_Cell } from 'material-react-table';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import Table from 'src/components/common/table';
import isEnabled from 'src/features';
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
import {
  ExistingStandardMetricPayload,
  useListStandardMetricQuery,
  useListSystemMetricsQuery,
} from 'src/queries/generated/reportMetrics';
import {
  ExistingProjectMetricPayload,
  useListAcceleratorReportConfigQuery,
  useListProjectMetricsQuery,
} from 'src/queries/generated/reports';
import { ProjectMetric, StandardMetric, SystemMetric } from 'src/types/AcceleratorReport';

import DefaultMetricsRenderer from './DefaultMetricsRenderer';
import EditCommonIndicatorModal from './EditCommonIndicatorModal';
import EditMetricModal from './EditMetricModal';
import EditProjectIndicatorModal from './EditProjectIndicatorModal';
import EditStandardMetricModal from './EditStandardMetricModal';
import SystemMetricsRenderer from './SystemMetricsRenderer';

export default function ReportsSettings(): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const { strings } = useLocalization();
  const theme = useTheme();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const improvedReportsEnabled = isEnabled('Improved Reports');

  const { goToAcceleratorEditReportSettings, goToNewProjectMetric, goToNewStandardMetric } = useNavigateTo();
  const [selectedProjectMetric, setSelectedProjectMetric] = useState<ExistingProjectMetricPayload>();
  const [selectedStandardMetric, setSelectedStandardMetric] = useState<ExistingStandardMetricPayload>();
  const [selectedProjectIndicator, setSelectedProjectIndicator] = useState<ExistingProjectIndicatorPayload>();
  const [selectedCommonIndicator, setSelectedCommonIndicator] = useState<ExistingCommonIndicatorPayload>();
  const [editProjectMetricModalOpened, , openEditProjectMetricModal, closeEditProjectMetricModal] = useBoolean(false);
  const [editStandardMetricModalOpened, , openEditStandardMetricModal, closeEditStandardMetricModal] =
    useBoolean(false);
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

  const listProjectMetricsResponse = useListProjectMetricsQuery(projectId);
  const projectMetrics = useMemo(
    () => listProjectMetricsResponse.data?.metrics,
    [listProjectMetricsResponse.data?.metrics]
  );

  const { data: standardMetricsResponse } = useListStandardMetricQuery();
  const standardMetrics = useMemo(() => standardMetricsResponse?.metrics, [standardMetricsResponse?.metrics]);

  const { data: systemMetricsResponse } = useListSystemMetricsQuery();
  const systemMetrics = useMemo(() => systemMetricsResponse?.metrics, [systemMetricsResponse?.metrics]);

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

  const title = (text: string, marginTop?: number, marginBottom?: number) => (
    <Typography
      fontSize='20px'
      lineHeight='28px'
      fontWeight={600}
      color={theme.palette.TwClrTxt}
      margin={theme.spacing(marginTop ?? 3, 0, marginBottom ?? 2)}
    >
      {text}
    </Typography>
  );

  const goToEditSettings = useCallback(() => {
    goToAcceleratorEditReportSettings(projectId.toString());
  }, [goToAcceleratorEditReportSettings, projectId]);

  const columns = useCallback(
    (): TableColumnType[] => [
      {
        key: 'name',
        name: strings.NAME,
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
        key: 'unit',
        name: strings.UNIT,
        type: 'string',
      },
      {
        key: 'isPublishable',
        name: strings.PUBLISH,
        type: 'boolean',
      },
    ],
    [strings]
  );

  const onClickProjectMetricRow = useCallback(
    (metric: ProjectMetric) => {
      setSelectedProjectMetric(metric);
      openEditProjectMetricModal();
    },
    [openEditProjectMetricModal]
  );

  const onClickStandardMetricRow = useCallback(
    (metric: StandardMetric) => {
      setSelectedStandardMetric(metric);
      openEditStandardMetricModal();
    },
    [openEditStandardMetricModal]
  );

  const goToAddProjectMetric = useCallback(() => {
    goToNewProjectMetric(projectId.toString());
  }, [goToNewProjectMetric, projectId]);

  const goToAddStandardMetric = useCallback(() => {
    goToNewStandardMetric(projectId.toString());
  }, [goToNewStandardMetric, projectId]);

  const clickable = useCallback(() => false, []);

  const filteredSystemMetrics: SystemMetric[] = useMemo(() => {
    if (systemMetrics) {
      return systemMetrics;
    } else {
      return [];
    }
  }, [systemMetrics]);

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
          <Link fontSize='16px' onClick={() => onClickIndicatorRow(row)}>
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
    [strings, NameCell, CommonCell, CategoryCell, PrimaryDataSourceCell, ActiveCell]
  );

  return (
    <>
      {editProjectMetricModalOpened && selectedProjectMetric && (
        <EditMetricModal onClose={closeEditProjectMetricModal} projectMetric={selectedProjectMetric} />
      )}
      {editStandardMetricModalOpened && selectedStandardMetric && (
        <EditStandardMetricModal onClose={closeEditStandardMetricModal} standardMetric={selectedStandardMetric} />
      )}
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
        {improvedReportsEnabled && (
          <EditableTable
            columns={indicatorColumns}
            data={allIndicatorRows}
            enableEditing={false}
            enableSorting={true}
            enableGlobalFilter={true}
            enableColumnFilters={false}
            enablePagination={true}
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
        )}
        {!improvedReportsEnabled && (
          <>
            <Grid container sx={gridStyle}>
              <Grid item xs={12} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
                {title(strings.PROJECT_SPECIFIC_METRICS)}
                {isAllowed('UPDATE_REPORTS_SETTINGS') && (
                  <Box>
                    <Button
                      label={strings.ADD_METRIC}
                      icon='plus'
                      onClick={goToAddProjectMetric}
                      priority='secondary'
                    />
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} textAlign={'center'}>
                {projectMetrics && projectMetrics.length > 0 ? (
                  <Table
                    id='project-specific-metrics-table'
                    columns={columns}
                    rows={projectMetrics}
                    orderBy='name'
                    topBarButtons={[
                      {
                        buttonText: strings.REMOVE,
                        buttonType: 'destructive',
                        onButtonClick: () => true,
                        icon: 'iconTrashCan',
                      },
                    ]}
                    Renderer={DefaultMetricsRenderer}
                    onSelect={onClickProjectMetricRow}
                    controlledOnSelect={true}
                    isClickable={clickable}
                  />
                ) : (
                  <Typography>{strings.NO_PROJECT_SPECIFIC_METRICS_TO_SHOW}</Typography>
                )}
              </Grid>
            </Grid>
            <Grid container sx={gridStyle}>
              <Grid item xs={12}>
                {title(strings.SYSTEM_METRICS)}
              </Grid>
              <Grid item xs={12}>
                <Table
                  id='system-metrics-table'
                  columns={columns}
                  rows={filteredSystemMetrics}
                  orderBy='name'
                  showCheckbox={false}
                  Renderer={SystemMetricsRenderer}
                />
              </Grid>
            </Grid>
            <Grid container sx={gridStyle}>
              <Grid item alignItems='center' display='flex' justifyContent='space-between' xs={12}>
                {title(strings.STANDARD_METRICS)}
                {isAllowed('UPDATE_REPORTS_SETTINGS') && (
                  <Box>
                    <Button
                      label={strings.ADD_METRIC}
                      icon='plus'
                      onClick={goToAddStandardMetric}
                      priority='secondary'
                    />
                  </Box>
                )}
              </Grid>
              <Grid item textAlign='center' xs={12}>
                <Table
                  id='standard-metrics-table'
                  columns={columns}
                  controlledOnSelect
                  isClickable={clickable}
                  rows={standardMetrics || []}
                  orderBy='name'
                  onSelect={onClickStandardMetricRow}
                  Renderer={DefaultMetricsRenderer}
                  showCheckbox={false}
                />
              </Grid>
            </Grid>
          </>
        )}
      </Card>
    </>
  );
}
