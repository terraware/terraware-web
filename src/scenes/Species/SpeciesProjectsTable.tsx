import React, { useEffect, useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { Button, TableRowType } from '@terraware/web-components';
import { TableColumnType } from '@terraware/web-components/components/table/types';

import Table from 'src/components/common/table';
import { useOrganization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { SearchService } from 'src/services';
import strings from 'src/strings';
import { SearchRequestPayload } from 'src/types/Search';

import AddToProjectModal from './AddToProjectModal';
import RemoveProjectsDialog from './RemoveProjectsDialog';

const columns = (): TableColumnType[] => [
  { key: 'projectName', name: strings.PROJECT, type: 'string' },
  { key: 'submissionStatus', name: strings.STATUS, type: 'string' },
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

type SpeciesProjectsResult = {
  id: number;
  submissionStatus: string;
  projectName: string;
};

type SpeciesProjectsSearchResult = {
  participantProjectSpecies: { id: number; submissionStatus: string; project: { name: string } }[];
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
  const { currentParticipant } = useParticipantData();

  useEffect(() => {
    let updatedResults = searchResults ?? [];
    const allProjects = currentParticipant?.projects;

    if (removedProjectsIds) {
      updatedResults =
        searchResults?.filter((sResults) => {
          !removedProjectsIds?.includes(sResults.id);
        }) || [];
    }
    if (addedProjectsIds) {
      const newProjects = addedProjectsIds?.map((id) => {
        return {
          id: -1,
          submissionStatus: 'Not submitted',
          projectName: allProjects?.find((proj) => proj.projectId === id)?.projectName,
        } as SpeciesProjectsResult;
      });
      updatedResults = [...updatedResults, ...newProjects];
    }

    setFilteredResults(updatedResults);
  }, [addedProjectsIds, removedProjectsIds, searchResults]);

  const onAddHandler = (addedId: number) => {
    // only add new project if it's not already added
    const exsist = searchResults?.find((sr) => {
      sr.id === addedId;
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
        sr.id === removedId;
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
    const getApiSearchResults = async () => {
      const searchParams: SearchRequestPayload = {
        prefix: 'species',
        fields: [
          'participantProjectSpecies.id',
          'participantProjectSpecies.project.name',
          'participantProjectSpecies.submissionStatus',
        ],
        search: {
          operation: 'and',
          children: [
            {
              operation: 'field',
              field: 'organization_id',
              type: 'Exact',
              values: [selectedOrganization.id],
            },
            {
              operation: 'field',
              field: 'id',
              type: 'Exact',
              values: [speciesId],
            },
          ],
        },
        count: 1000,
      };

      const apiSearchResults = (await SearchService.search(searchParams)) as SpeciesProjectsSearchResult[];
      // it will always be one result since we are searching by species id
      const firstApiResult = apiSearchResults[0];
      const projects = firstApiResult?.participantProjectSpecies.map((pps) => {
        return {
          submissionStatus: pps.submissionStatus,
          projectName: pps.project.name,
          id: pps.id,
        } as SpeciesProjectsResult;
      });

      setSearchResults(projects);
      if (reload) {
        setReload(false);
      }
    };
    getApiSearchResults();
  }, [selectedOrganization, reload, speciesId]);

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
      {openedAddToProjectModal && <AddToProjectModal onClose={onCloseAddToProject} onSubmit={onAddHandler} />}
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
              />
            )}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Table
            id='species-projects'
            columns={columns}
            rows={editMode ? filteredResults || [] : searchResults || []}
            orderBy={'projectName'}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
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
          />
        </Grid>
      </Grid>
    </>
  );
}
