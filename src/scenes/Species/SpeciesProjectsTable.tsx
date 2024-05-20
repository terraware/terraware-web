import React, { useEffect, useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { Button, TableRowType } from '@terraware/web-components';
import { TableColumnType } from '@terraware/web-components/components/table/types';

import Table from 'src/components/common/table';
import { useOrganization } from 'src/providers';
import { requestProjectsForSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectProjectsForSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { SpeciesProjectsResult } from 'src/services/ParticipantProjectSpeciesService';
import strings from 'src/strings';
import { Project } from 'src/types/Project';

import AddToProjectModal from './AddToProjectModal';
import RemoveProjectsDialog from './RemoveProjectsDialog';
import SpeciesProjectsCellRenderer from './SpeciesProjectsCellRenderer';

const columns = (): TableColumnType[] => [
  { key: 'projectName', name: strings.PROJECT, type: 'string' },
  { key: 'submissionStatus', name: strings.STATUS, type: 'string' },
];

const viewColumns = (): TableColumnType[] => [
  ...columns(),
  {
    key: 'deliverableId',
    name: '',
    type: 'string',
  } as TableColumnType,
];

type SpeciesProjectsTableProps = {
  speciesId: number;
  editMode: boolean;
  onAdd?: (id: number) => void;
  onRemoveNew?: (ids: number[]) => void;
  onRemoveExisting?: (ids: number[]) => void;
  addedProjectsIds?: number[];
  removedProjectsIds?: number[];
};

export default function SpeciesProjectsTable({
  speciesId,
  editMode,
  onAdd,
  onRemoveNew,
  onRemoveExisting,
  addedProjectsIds,
  removedProjectsIds,
}: SpeciesProjectsTableProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const [searchResults, setSearchResults] = useState<SpeciesProjectsResult[] | null>();
  const [filteredResults, setFilteredResults] = useState<SpeciesProjectsResult[] | null>();
  const [selectedRows, setSelectedRows] = useState<TableRowType[]>([]);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [reload, setReload] = useState(false);
  const [openedAddToProjectModal, setOpenedAddToProjectModal] = useState(false);
  const allProjects = useAppSelector(selectProjects);
  const [selectableProjects, setSelectableProjects] = useState<Project[]>([]);
  const projectForSpecies = useAppSelector(selectProjectsForSpecies(speciesId));
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(requestProjects(selectedOrganization.id));
  }, [selectedOrganization]);

  useEffect(() => {
    void dispatch(requestProjectsForSpecies(selectedOrganization.id, speciesId));
  }, [selectedOrganization, reload, speciesId]);

  useEffect(() => {
    const assignedProjectsIds = filteredResults?.map((fr) => Number(fr.projectId));
    const pendingProjects = allProjects?.filter((project) => {
      return !assignedProjectsIds?.includes(project.id);
    });
    setSelectableProjects(pendingProjects || []);
  }, [filteredResults, allProjects]);

  useEffect(() => {
    let updatedResults = searchResults ?? [];

    if (removedProjectsIds) {
      updatedResults =
        searchResults?.filter((sResults) => {
          return !removedProjectsIds?.includes(Number(sResults.id));
        }) || [];
    }
    if (addedProjectsIds) {
      const newProjects = addedProjectsIds?.map((id) => {
        return {
          id: id,
          submissionStatus: 'Not Submitted',
          projectName: allProjects?.find((proj) => proj.id === id)?.name,
          projectId: id,
        } as SpeciesProjectsResult;
      });
      updatedResults = [...updatedResults, ...newProjects];
    }

    setFilteredResults(updatedResults);
  }, [addedProjectsIds, removedProjectsIds, searchResults]);

  const onAddHandler = (addedId: number) => {
    // only add new project if it's not already added
    const exsist = searchResults?.find((sr) => {
      sr.id.toString() === addedId.toString();
    });
    if (!exsist && onAdd) {
      onAdd(addedId);
    }
  };

  const onRemoveHandler = (removedIds: number[]) => {
    const existingIdsToRemove: number[] = [];
    const newIdsToRemove: number[] = [];
    removedIds.forEach((removedId) => {
      const exists = searchResults?.find((sr) => {
        return sr.id.toString() === removedId.toString();
      });

      if (exists) {
        existingIdsToRemove.push(removedId);
      } else {
        newIdsToRemove.push(removedId);
      }
    });

    if (onRemoveExisting && existingIdsToRemove.length) {
      onRemoveExisting(existingIdsToRemove);
    }

    if (onRemoveNew && newIdsToRemove.length) {
      onRemoveNew(newIdsToRemove);
    }
  };

  useEffect(() => {
    setSearchResults(projectForSpecies);
  }, [projectForSpecies]);

  const onCloseRemoveProjects = (reload?: boolean) => {
    setShowRemoveDialog(false);
    if (reload) {
      setReload(true);
    }
  };

  const onCloseAddToProject = (reload?: boolean) => {
    setOpenedAddToProjectModal(false);
    if (reload) {
      setReload(true);
    }
  };

  return (
    <>
      {showRemoveDialog && (
        <RemoveProjectsDialog
          onClose={onCloseRemoveProjects}
          ppSpeciesToRemove={selectedRows.map((row) => Number(row.id))}
          onSubmit={onRemoveHandler}
        />
      )}
      {openedAddToProjectModal && (
        <AddToProjectModal onClose={onCloseAddToProject} onSubmit={onAddHandler} projects={selectableProjects} />
      )}
      <Grid item xs={12}>
        <Grid item xs={12}>
          <Box
            alignItems='center'
            display='flex'
            flexDirection='row'
            justifyContent='space-between'
            marginBottom={2}
            width='100%'
          >
            <Typography fontSize='20px' fontWeight={600}>
              {strings.PROJECTS}
            </Typography>
            {editMode && (
              <Button
                icon='plus'
                id='add-species-to-project'
                label='Add to Project'
                onClick={() => setOpenedAddToProjectModal(true)}
                priority='secondary'
                size='medium'
                disabled={selectableProjects?.length < 1}
              />
            )}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Table
            id='species-projects'
            columns={editMode ? columns : viewColumns}
            rows={editMode ? filteredResults || [] : searchResults || []}
            orderBy={'projectName'}
            selectedRows={editMode ? selectedRows : undefined}
            setSelectedRows={editMode ? setSelectedRows : undefined}
            showCheckbox={editMode}
            showTopBar={true}
            topBarButtons={[
              {
                buttonText: strings.REMOVE,
                buttonType: 'destructive',
                onButtonClick: () => setShowRemoveDialog(true),
                icon: 'iconTrashCan',
              },
            ]}
            Renderer={SpeciesProjectsCellRenderer}
          />
        </Grid>
      </Grid>
    </>
  );
}
