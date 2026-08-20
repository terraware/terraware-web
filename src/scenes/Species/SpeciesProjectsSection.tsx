import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { Badge, TableRowType } from '@terraware/web-components';

import Button from 'src/components/common/button/Button';
import TooltipButton from 'src/components/common/button/TooltipButton';
import Table from 'src/components/common/table';
import CellRenderer from 'src/components/common/table/TableCellRenderer';
import { RendererProps, TableColumnType } from 'src/components/common/table/types';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { Project } from 'src/types/Project';
import { SpeciesProjectElement } from 'src/types/Species';

import AddSpeciesToProjectModal from './AddSpeciesToProjectModal';
import OverrideSpeciesModal from './OverrideSpeciesModal';
import RemoveProjectsDialog from './RemoveProjectsDialog';
import { speciesDataSourceAcronymLabel } from './SpeciesDataSourceBadge';
import SpeciesNativityBadge from './SpeciesNativityBadge';
import StatusDetailsModal from './StatusDetailsModal';

type Nativity = NonNullable<SpeciesProjectElement['calculatedNativity']>;

type ProjectRow = {
  projectId: number;
  projectName: string;
  nativity?: Nativity;
  overridden: boolean;
  justification?: string;
  overriddenBy?: string;
  overriddenTime?: string;
  dataSourceDate?: string;
  dataSourceType?: string;
  isNew: boolean;
};

const columns = (): TableColumnType[] => [
  { key: 'projectName', name: strings.PROJECT, type: 'string' },
  { key: 'status', name: strings.STATUS, type: 'string' },
  { key: 'action', name: strings.ACTION, type: 'string', alignment: 'right' },
];

type SpeciesProjectsSectionProps = {
  speciesId: number;
  speciesName: string;
  speciesProjects?: SpeciesProjectElement[];
  editMode?: boolean;
  addedProjectIds?: number[];
  removedProjectIds?: number[];
  onAddProjectIds?: (projectIds: number[]) => void;
  onRemoveProjectIds?: (projectIds: number[]) => void;
};

export default function SpeciesProjectsSection({
  speciesId,
  speciesName,
  speciesProjects,
  editMode = false,
  addedProjectIds,
  removedProjectIds,
  onAddProjectIds,
  onRemoveProjectIds,
}: SpeciesProjectsSectionProps): JSX.Element {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { availableProjects, getProjectName } = useProjects();

  const [openedAddToProjectModal, setOpenedAddToProjectModal] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [selectedRows, setSelectedRows] = useState<TableRowType[]>([]);
  const [overrideProjectId, setOverrideProjectId] = useState<number>();
  const [detailsProjectId, setDetailsProjectId] = useState<number>();

  const rows = useMemo<ProjectRow[]>(() => {
    const removed = editMode ? removedProjectIds ?? [] : [];
    const existingRows: ProjectRow[] = (speciesProjects ?? [])
      .filter((project): project is SpeciesProjectElement & { projectId: number } => project.projectId !== undefined)
      .filter((project) => !removed.includes(project.projectId))
      .map((project) => ({
        projectId: project.projectId,
        projectName: getProjectName(project.projectId),
        nativity: project.overriddenNativity ?? project.calculatedNativity,
        overridden: !!project.overriddenNativity,
        justification: project.overriddenJustification,
        overriddenBy: project.overriddenByName,
        overriddenTime: project.overriddenTime,
        dataSourceDate: project.calculatedNativitySource?.datasetDate ?? project.pendingNativitySource?.datasetDate,
        dataSourceType: project.calculatedNativitySource?.datasetType ?? project.pendingNativitySource?.datasetType,
        isNew: false,
      }));

    const addedRows: ProjectRow[] = (editMode ? addedProjectIds ?? [] : []).map((projectId) => ({
      projectId,
      projectName: getProjectName(projectId),
      overridden: false,
      isNew: true,
    }));

    return [...existingRows, ...addedRows];
  }, [speciesProjects, editMode, addedProjectIds, removedProjectIds, getProjectName]);

  const selectableProjects = useMemo<Project[]>(() => {
    const assignedIds = new Set(rows.map((row) => row.projectId));
    return (availableProjects ?? []).filter((project) => !assignedIds.has(project.id));
  }, [availableProjects, rows]);

  const buttonTooltip = useMemo(() => {
    if (!activeLocale || selectableProjects.length > 0) {
      return undefined;
    }
    return strings.NO_AVAILABLE_PROJECTS_FOR_SPECIES;
  }, [activeLocale, selectableProjects]);

  const onRemove = useCallback(() => {
    const removedIds = selectedRows.map((row) => (row as ProjectRow).projectId);
    if (removedIds.length && onRemoveProjectIds) {
      onRemoveProjectIds(removedIds);
    }
    setSelectedRows([]);
    setShowRemoveDialog(false);
  }, [onRemoveProjectIds, selectedRows]);

  const overrideTarget = useMemo(() => {
    if (overrideProjectId === undefined) {
      return undefined;
    }
    const project = availableProjects?.find((p) => p.id === overrideProjectId);
    const row = rows.find((r) => r.projectId === overrideProjectId);
    return project ? { project, row } : undefined;
  }, [availableProjects, overrideProjectId, rows]);

  const detailsRow = useMemo(
    () => (detailsProjectId === undefined ? undefined : rows.find((r) => r.projectId === detailsProjectId)),
    [detailsProjectId, rows]
  );

  const Renderer = useCallback(
    (props: RendererProps<TableRowType>): JSX.Element => {
      const { column, row, index } = props;
      const projectRow = row as ProjectRow;

      if (column.key === 'status') {
        return (
          <CellRenderer
            {...props}
            sx={{ '& > p': { maxWidth: 'none', overflow: 'visible' } }}
            value={
              <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'nowrap', gap: theme.spacing(1) }}>
                {projectRow.nativity ? (
                  <>
                    {projectRow.dataSourceType ? (
                      <Tooltip title={speciesDataSourceAcronymLabel(projectRow.dataSourceType)}>
                        <Box component='span' sx={{ display: 'inline-flex' }}>
                          <SpeciesNativityBadge nativity={projectRow.nativity} />
                        </Box>
                      </Tooltip>
                    ) : (
                      <SpeciesNativityBadge nativity={projectRow.nativity} />
                    )}
                    {projectRow.dataSourceDate && (
                      <Typography
                        component='span'
                        fontSize='14px'
                        color={theme.palette.TwClrTxtSecondary}
                        whiteSpace='nowrap'
                      >
                        {strings.formatString(strings.SPECIES_PROJECT_DATA_SOURCE_SYNC, projectRow.dataSourceDate)}
                      </Typography>
                    )}
                    {projectRow.overridden && (
                      <Typography
                        component='span'
                        onClick={() => setDetailsProjectId(projectRow.projectId)}
                        sx={{
                          color: theme.palette.TwClrTxtBrand,
                          cursor: 'pointer',
                          fontSize: '14px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {strings.SEE_DETAILS}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Badge
                    label={strings.NOT_SET}
                    backgroundColor={theme.palette.TwClrBgSecondary}
                    borderColor={theme.palette.TwClrBrdrSecondary}
                    labelColor={theme.palette.TwClrTxtSecondary}
                  />
                )}
              </Box>
            }
          />
        );
      }

      if (column.key === 'action') {
        return (
          <CellRenderer
            {...props}
            value={
              projectRow.isNew ? (
                ''
              ) : (
                <Button
                  id={`override-${projectRow.projectId}`}
                  label={projectRow.overridden ? strings.EDIT : strings.OVERRIDE}
                  priority='secondary'
                  type='passive'
                  size='small'
                  disabled={!projectRow.nativity}
                  onClick={() => setOverrideProjectId(projectRow.projectId)}
                />
              )
            }
          />
        );
      }

      return <CellRenderer {...props} index={index} />;
    },
    [theme]
  );

  return (
    <>
      {editMode && openedAddToProjectModal && onAddProjectIds && (
        <AddSpeciesToProjectModal
          onClose={() => setOpenedAddToProjectModal(false)}
          onAdd={onAddProjectIds}
          availableProjects={selectableProjects}
        />
      )}

      {editMode && showRemoveDialog && (
        <RemoveProjectsDialog
          onClose={() => setShowRemoveDialog(false)}
          ppSpeciesToRemove={selectedRows.map((row) => (row as ProjectRow).projectId)}
          onSubmit={onRemove}
        />
      )}

      {overrideTarget && (
        <OverrideSpeciesModal
          onClose={() => setOverrideProjectId(undefined)}
          speciesId={speciesId}
          speciesName={speciesName}
          project={overrideTarget.project}
          currentNativity={overrideTarget.row?.nativity}
          currentJustification={overrideTarget.row?.justification}
        />
      )}

      {detailsRow && (
        <StatusDetailsModal
          onClose={() => setDetailsProjectId(undefined)}
          onEdit={() => {
            const projectId = detailsRow.projectId;
            setDetailsProjectId(undefined);
            setOverrideProjectId(projectId);
          }}
          nativity={detailsRow.nativity}
          overriddenBy={detailsRow.overriddenBy}
          overriddenTime={detailsRow.overriddenTime}
          justification={detailsRow.justification}
        />
      )}

      {editMode ? (
        <Box
          alignItems='center'
          display='flex'
          flexDirection='row'
          justifyContent='space-between'
          marginBottom={theme.spacing(2)}
          width='100%'
        >
          <Typography fontSize='20px' fontWeight={600}>
            {strings.PROJECT_NATIVE_INVASIVE_STATUS}
          </Typography>
          <TooltipButton
            icon='plus'
            id='add-species-to-project'
            label={strings.ADD_TO_PROJECT}
            onClick={() => setOpenedAddToProjectModal(true)}
            priority='secondary'
            size='medium'
            disabled={selectableProjects.length === 0}
            tooltip={buttonTooltip}
          />
        </Box>
      ) : (
        <Typography fontSize='20px' fontWeight={600} marginBottom={theme.spacing(2)}>
          {strings.PROJECT_NATIVE_INVASIVE_STATUS}
        </Typography>
      )}

      <Table
        id='species-projects-section'
        columns={columns}
        rows={rows}
        orderBy={'projectName'}
        Renderer={Renderer}
        showCheckbox={editMode}
        showTopBar={editMode}
        selectedRows={editMode ? selectedRows : undefined}
        setSelectedRows={editMode ? setSelectedRows : undefined}
        topBarButtons={[
          {
            buttonText: strings.REMOVE,
            buttonType: 'destructive',
            onButtonClick: () => setShowRemoveDialog(true),
            icon: 'iconTrashCan',
          },
        ]}
      />
    </>
  );
}
