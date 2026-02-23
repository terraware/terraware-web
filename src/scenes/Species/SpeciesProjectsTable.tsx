import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { TableRowType } from '@terraware/web-components';
import { TableColumnType } from '@terraware/web-components/components/table/types';

import TooltipButton from 'src/components/common/button/TooltipButton';
import Table from 'src/components/common/table';
import { useLocalization, useOrganization } from 'src/providers';
import { requestGetProjectsForSpecies } from 'src/redux/features/acceleratorProjectSpecies/acceleratorProjectSpeciesAsyncThunks';
import { selectProjectsForSpeciesRequest } from 'src/redux/features/acceleratorProjectSpecies/acceleratorProjectSpeciesSelectors';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorProjectForSpecies } from 'src/types/AcceleratorProjectSpecies';
import { Project } from 'src/types/Project';
import useSnackbar from 'src/utils/useSnackbar';

import AddToProjectModal, { ProjectSpecies } from './AddToProjectModal';
import RemoveProjectsDialog from './RemoveProjectsDialog';
import SpeciesProjectsCellRenderer from './SpeciesProjectsCellRenderer';

const columns = (): TableColumnType[] => [
  { key: 'projectName', name: strings.PROJECT, type: 'string' },
  { key: 'acceleratorProjectSpeciesNativeCategory', name: strings.NATIVE_NON_NATIVE, type: 'string' },
  { key: 'acceleratorProjectSpeciesSubmissionStatus', name: strings.STATUS, type: 'string' },
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
  const { activeLocale } = useLocalization();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { selectedOrganization } = useOrganization();
  const allProjects = useAppSelector(selectProjects);

  const [requestId, setRequestId] = useState('');
  const projectsForSpeciesRequest = useAppSelector(selectProjectsForSpeciesRequest(requestId));

  const [searchResults, setSearchResults] = useState<AcceleratorProjectForSpecies[] | null>();
  const [filteredResults, setFilteredResults] = useState<AcceleratorProjectForSpecies[] | null>();
  const [selectedRows, setSelectedRows] = useState<TableRowType[]>([]);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [reload, setReload] = useState(false);
  const [openedAddToProjectModal, setOpenedAddToProjectModal] = useState(false);
  const [selectableProjects, setSelectableProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (selectedOrganization) {
      void dispatch(requestProjects(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization]);

  useEffect(() => {
    const request = dispatch(requestGetProjectsForSpecies({ speciesId }));
    setRequestId(request.requestId);
  }, [dispatch, selectedOrganization, reload, speciesId]);

  useEffect(() => {
    if (projectsForSpeciesRequest?.status === 'success') {
      setSearchResults(projectsForSpeciesRequest.data);
    } else if (projectsForSpeciesRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [projectsForSpeciesRequest, snackbar]);

  useEffect(() => {
    const assignedProjectsIds = filteredResults?.map((fr) => Number(fr.projectId));
    const pendingProjects = allProjects?.filter((project) => {
      return project.phase && !assignedProjectsIds?.includes(project.id);
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
        } as AcceleratorProjectForSpecies;
      });
      updatedResults = [...updatedResults, ...newProjects];
    }

    setFilteredResults(updatedResults);
  }, [addedProjectsSpecies, allProjects, removedProjectsIds, searchResults, speciesId]);

  const onAddHandler = (projectsSpeciesAdded: ProjectSpecies[]) => {
    // only add new project if it's not already added
    const netNewProj = projectsSpeciesAdded.filter(
      (pS) => !searchResults?.find((sr) => Number(sr.projectId) === pS.project.id)
    );
    if (netNewProj.length > 0 && onAdd) {
      onAdd(netNewProj);
    }
  };

  const buttonTooltip = useMemo(() => {
    if (!activeLocale || selectableProjects.length > 0) {
      return undefined;
    }

    return strings.NO_AVAILABLE_PROJECTS_FOR_SPECIES;
  }, [activeLocale, selectableProjects]);

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

  const onCloseRemoveProjects = (shouldReload?: boolean) => {
    setShowRemoveDialog(false);
    if (shouldReload) {
      setReload(true);
    }
  };

  const onCloseAddToProject = (shouldReload?: boolean) => {
    setOpenedAddToProjectModal(false);
    if (shouldReload) {
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
