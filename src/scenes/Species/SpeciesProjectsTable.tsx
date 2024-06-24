import React, { useEffect, useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { TableRowType } from '@terraware/web-components';
import { TableColumnType } from '@terraware/web-components/components/table/types';

import Table from 'src/components/common/table';
import { useOrganization } from 'src/providers';
import { requestGetProjectsForSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectProjectsForSpeciesRequest } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ParticipantProjectForSpecies } from 'src/types/ParticipantProjectSpecies';
import { Project } from 'src/types/Project';
import useSnackbar from 'src/utils/useSnackbar';

import AddToProjectModal, { ProjectSpecies } from './AddToProjectModal';
import RemoveProjectsDialog from './RemoveProjectsDialog';
import SpeciesProjectsCellRenderer from './SpeciesProjectsCellRenderer';

const columns = (): TableColumnType[] => [
  { key: 'projectName', name: strings.PROJECT, type: 'string' },
  { key: 'participantProjectSpeciesNativeCategory', name: strings.NATIVE_NON_NATIVE, type: 'string' },
  { key: 'participantProjectSpeciesSubmissionStatus', name: strings.STATUS, type: 'string' },
];

const viewColumns = (): TableColumnType[] => [
  ...columns(),
  {
    key: 'activeDeliverableId',
    name: '',
    type: 'string',
  } as TableColumnType,
];

type SpeciesProjectsTableProps = {
  speciesId: number;
  editMode: boolean;
  onAdd?: (projectsSpecies: ProjectSpecies[]) => void;
  onRemoveNew?: (ids: number[]) => void;
  onRemoveExisting?: (ids: number[]) => void;
  addedProjectsSpecies?: ProjectSpecies[];
  removedProjectsIds?: number[];
};

export default function SpeciesProjectsTable({
  speciesId,
  editMode,
  onAdd,
  onRemoveNew,
  onRemoveExisting,
  addedProjectsSpecies,
  removedProjectsIds,
}: SpeciesProjectsTableProps): JSX.Element {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { selectedOrganization } = useOrganization();

  const allProjects = useAppSelector(selectProjects);

  const [requestId, setRequestId] = useState('');
  const projectsForSpeciesRequest = useAppSelector(selectProjectsForSpeciesRequest(requestId));

  const [searchResults, setSearchResults] = useState<ParticipantProjectForSpecies[] | null>();
  const [filteredResults, setFilteredResults] = useState<ParticipantProjectForSpecies[] | null>();
  const [selectedRows, setSelectedRows] = useState<TableRowType[]>([]);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [reload, setReload] = useState(false);
  const [openedAddToProjectModal, setOpenedAddToProjectModal] = useState(false);
  const [selectableProjects, setSelectableProjects] = useState<Project[]>([]);

  useEffect(() => {
    void dispatch(requestProjects(selectedOrganization.id));
  }, [selectedOrganization]);

  useEffect(() => {
    const request = dispatch(requestGetProjectsForSpecies({ speciesId }));
    setRequestId(request.requestId);
  }, [selectedOrganization, reload, speciesId]);

  useEffect(() => {
    if (projectsForSpeciesRequest?.status === 'success') {
      setSearchResults(projectsForSpeciesRequest.data);
    } else if (projectsForSpeciesRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [projectsForSpeciesRequest]);

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
          return !removedProjectsIds?.includes(Number(sResults.participantProjectSpeciesId));
        }) || [];
    }

    if (addedProjectsSpecies) {
      const newProjects = addedProjectsSpecies?.map((pS) => {
        return {
          participantProjectSpeciesId: pS.project.id,
          participantProjectSpeciesSubmissionStatus: 'Not Submitted',
          projectId: pS.project.id,
          projectName: allProjects?.find((proj) => proj.id === pS.project.id)?.name,
          speciesId,
          participantProjectSpeciesNativeCategory: pS.nativeCategory,
        } as ParticipantProjectForSpecies;
      });
      updatedResults = [...updatedResults, ...newProjects];
    }

    setFilteredResults(updatedResults);
  }, [addedProjectsSpecies, removedProjectsIds, searchResults]);

  const onAddHandler = (projectsSpeciesAdded: ProjectSpecies[]) => {
    // only add new project if it's not already added
    const netNewProj = projectsSpeciesAdded.filter(
      (pS) => !searchResults?.find((sr) => Number(sr.projectId) === pS.project.id)
    );
    if (netNewProj.length > 0 && onAdd) {
      onAdd(netNewProj);
    }
  };

  const onRemoveHandler = (removedIds: number[]) => {
    const existingIdsToRemove: number[] = [];
    const newIdsToRemove: number[] = [];

    removedIds.forEach((removedId) => {
      const exists = searchResults?.find((sr) => {
        return sr.participantProjectSpeciesId.toString() === removedId.toString();
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
          ppSpeciesToRemove={selectedRows.map((row) => Number(row.participantProjectSpeciesId))}
          onSubmit={onRemoveHandler}
        />
      )}
      {openedAddToProjectModal && selectableProjects && (
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
