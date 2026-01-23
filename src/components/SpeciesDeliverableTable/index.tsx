import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { TableColumnType, TableRowType } from '@terraware/web-components';

import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization, useUser } from 'src/providers';
import { useSpeciesDeliverableSearch } from 'src/providers/Participant/useSpeciesDeliverableSearch';
import { requestListParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectParticipantProjectSpeciesListRequest } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { DeliverableWithOverdue } from 'src/types/Deliverables';

import AddSpeciesModal from './AddSpeciesModal';
import RemoveSpeciesDialog from './RemoveSpeciesDialog';
import TableCellRenderer from './TableCellRenderer';

const columns = (): TableColumnType[] => [
  { key: 'species_scientificName', name: strings.SCIENTIFIC_NAME, type: 'string' },
  { key: 'species_commonName', name: strings.COMMON_NAME, type: 'string' },
  { key: 'participantProjectSpecies_speciesNativeCategory', name: strings.NATIVE_NON_NATIVE, type: 'string' },
  { key: 'participantProjectSpecies_rationale', name: strings.RATIONALE, type: 'string' },
  { key: 'participantProjectSpecies_submissionStatus', name: strings.STATUS, type: 'string' },
];

const consoleUpdateColumns = (): TableColumnType[] => [
  ...columns(),
  { key: 'reject', name: '', type: 'string' },
  { key: 'approve', name: '', type: 'string' },
];

type SpeciesDeliverableTableProps = {
  deliverable: DeliverableWithOverdue;
};

const SpeciesDeliverableTable = ({ deliverable }: SpeciesDeliverableTableProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
  const theme = useTheme();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { goToParticipantProjectSpecies } = useNavigateTo();
  const {
    hasActiveDeliverable,
    hasRecentDeliverable,
    reload: reloadSpeciesDeliverableSearch,
  } = useSpeciesDeliverableSearch();

  const participantProjectSpecies = useAppSelector(selectParticipantProjectSpeciesListRequest(deliverable.projectId));

  const [selectedRows, setSelectedRows] = useState<TableRowType[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [openedAddSpeciesModal, setOpenedAddSpeciesModal] = useState(false);

  const rows = useMemo(() => {
    return (participantProjectSpecies?.data || []).map((value) => ({
      ...value,
      species_scientificName: value.species.scientificName,
      species_commonName: value.species.commonName,
      participantProjectSpecies_speciesNativeCategory: value.participantProjectSpecies.speciesNativeCategory,
      participantProjectSpecies_rationale: value.participantProjectSpecies.rationale,
      participantProjectSpecies_submissionStatus: value.participantProjectSpecies.submissionStatus,
    }));
  }, [participantProjectSpecies]);

  const isAllowedUpdateDeliverable = isAllowed('UPDATE_DELIVERABLE');

  useEffect(() => {
    void dispatch(requestListParticipantProjectSpecies(deliverable.projectId));
  }, [deliverable.projectId, dispatch]);

  const reload = useCallback(() => {
    void dispatch(requestListParticipantProjectSpecies(deliverable.projectId));
    reloadSpeciesDeliverableSearch();
  }, [deliverable.projectId, dispatch, reloadSpeciesDeliverableSearch]);

  const onCloseRemoveSpecies = useCallback(
    (_reload?: boolean) => {
      setShowConfirmDialog(false);
      if (_reload) {
        reload();
      }
    },
    [reload]
  );

  const onAcceleratorSpeciesClick = useCallback(
    (row: any) => {
      goToParticipantProjectSpecies(deliverable.id, row.project.id, row.participantProjectSpecies.id);
    },
    [deliverable.id, goToParticipantProjectSpecies]
  );

  const closeAddSpeciesModal = useCallback(() => setOpenedAddSpeciesModal(false), []);

  return (
    <>
      {activeLocale && (
        <>
          <RemoveSpeciesDialog
            onClose={onCloseRemoveSpecies}
            open={showConfirmDialog}
            speciesToRemove={selectedRows.map((row) => row.participantProjectSpecies.id)}
          />

          {openedAddSpeciesModal && (
            <AddSpeciesModal
              onClose={closeAddSpeciesModal}
              participantProjectSpecies={participantProjectSpecies?.data || []}
              reload={reload}
              projectId={deliverable.projectId}
              hasActiveDeliverable={hasActiveDeliverable}
              hasRecentDeliverable={hasRecentDeliverable}
            />
          )}

          <Box
            alignItems='center'
            display='flex'
            flexDirection='row'
            justifyContent='space-between'
            marginBottom={theme.spacing(2)}
            width='100%'
          >
            <Typography fontSize='20px' fontWeight={600} lineHeight='28px'>
              {strings.SPECIES}
            </Typography>

            {!isAcceleratorRoute && (
              <Button
                icon='plus'
                id='add-species-to-project'
                label='Add Species to Project'
                onClick={() => setOpenedAddSpeciesModal(true)}
                priority='secondary'
                size='medium'
              />
            )}
          </Box>

          <Table
            columns={isAcceleratorRoute && isAllowedUpdateDeliverable ? consoleUpdateColumns : columns}
            emptyTableMessage={strings.THERE_ARE_NO_SPECIES_ADDED_TO_THIS_PROJET_YET}
            id='species-deliverable-table'
            orderBy='speciesScientificName'
            Renderer={TableCellRenderer}
            rows={rows}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            showCheckbox={!isAcceleratorRoute}
            showTopBar={true}
            topBarButtons={[
              {
                buttonText: strings.REMOVE,
                buttonType: 'destructive',
                onButtonClick: () => setShowConfirmDialog(true),
                icon: 'iconTrashCan',
              },
            ]}
            isClickable={() => false}
            reloadData={reload}
            onSelect={onAcceleratorSpeciesClick}
          />
        </>
      )}
    </>
  );
};

export default SpeciesDeliverableTable;
