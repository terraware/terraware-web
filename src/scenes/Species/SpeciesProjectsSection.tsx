import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { TableRowType } from '@terraware/web-components';

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
import RemoveProjectsDialog from './RemoveProjectsDialog';
import SpeciesNativityBadge from './SpeciesNativityBadge';

type Nativity = NonNullable<SpeciesProjectElement['calculatedNativity']>;

type ProjectRow = {
  projectId: number;
  projectName: string;
  nativity?: Nativity;
  dataSourceDate?: string;
  isNew: boolean;
};

const columns = (): TableColumnType[] => [
  { key: 'projectName', name: strings.PROJECT, type: 'string' },
  { key: 'status', name: strings.STATUS, type: 'string' },
  { key: 'action', name: strings.ACTION, type: 'string', alignment: 'right' },
];

type SpeciesProjectsSectionProps = {
  speciesProjects?: SpeciesProjectElement[];
  editMode?: boolean;
  addedProjectIds?: number[];
  removedProjectIds?: number[];
  onAddProjectIds?: (projectIds: number[]) => void;
  onRemoveProjectIds?: (projectIds: number[]) => void;
};

export default function SpeciesProjectsSection({
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

  const rows = useMemo<ProjectRow[]>(() => {
    const removed = editMode ? removedProjectIds ?? [] : [];
    const existingRows: ProjectRow[] = (speciesProjects ?? [])
      .filter((project): project is SpeciesProjectElement & { projectId: number } => project.projectId !== undefined)
      .filter((project) => !removed.includes(project.projectId))
      .map((project) => ({
        projectId: project.projectId,
        projectName: getProjectName(project.projectId),
        nativity: project.overriddenNativity ?? project.calculatedNativity,
        dataSourceDate: project.calculatedNativitySource?.datasetDate,
        isNew: false,
      }));

    const addedRows: ProjectRow[] = (editMode ? addedProjectIds ?? [] : []).map((projectId) => ({
      projectId,
      projectName: getProjectName(projectId),
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

  const Renderer = useCallback(
    (props: RendererProps<TableRowType>): JSX.Element => {
      const { column, row, index } = props;
      const projectRow = row as ProjectRow;

      if (column.key === 'status') {
        return (
          <CellRenderer
            {...props}
            value={
              <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: theme.spacing(1) }}>
                <SpeciesNativityBadge nativity={projectRow.nativity} />
                {projectRow.dataSourceDate && (
                  <Typography component='span' fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
                    {strings.formatString(strings.SPECIES_PROJECT_DATA_SOURCE_SYNC, projectRow.dataSourceDate)}
                  </Typography>
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
                  label={strings.OVERRIDE}
                  priority='secondary'
                  type='passive'
                  size='small'
                  // TODO: open the override-nativity modal (follow-up)
                  onClick={() => undefined}
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

      {editMode && (
        <Box
          alignItems='center'
          display='flex'
          flexDirection='row'
          justifyContent='space-between'
          marginBottom={theme.spacing(2)}
          width='100%'
        >
          <Typography fontSize='20px' fontWeight={600}>
            {strings.PROJECTS}
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
