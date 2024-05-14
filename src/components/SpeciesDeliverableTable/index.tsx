import React, { useEffect, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { TableColumnType, TableRowType } from '@terraware/web-components';

import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { requestListParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectParticipantProjectSpeciesListRequest } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Deliverable } from 'src/types/Deliverables';

import AddSpeciesModal from './AddSpeciesModal';
import RemoveSpeciesDialog from './RemoveSpeciesDialog';
import TableCellRenderer from './TableCellRenderer';

const columns = (): TableColumnType[] => [
  { key: 'scientificName', name: strings.SCIENTIFIC_NAME, type: 'string' },
  { key: 'commonName', name: strings.COMMON_NAME, type: 'string' },
  { key: 'rationale', name: strings.RATIONALE, type: 'string' },
  { key: 'submissionStatus', name: strings.STATUS, type: 'string' },
];

const consoleColumns = (): TableColumnType[] => [
  ...columns(),
  { key: 'reject', name: '', type: 'string' },
  { key: 'approve', name: '', type: 'string' },
];

type SpeciesDeliverableTableProps = {
  deliverable: Deliverable;
};

const SpeciesDeliverableTable = ({ deliverable }: SpeciesDeliverableTableProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { goToParticipantProjectSpecies } = useNavigateTo();

  const participantProjectSpecies = useAppSelector(selectParticipantProjectSpeciesListRequest(deliverable.projectId));

  const [selectedRows, setSelectedRows] = useState<TableRowType[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [openedAddSpeciesModal, setOpenedAddSpeciesModal] = useState(false);

  useEffect(() => {
    void dispatch(requestListParticipantProjectSpecies(deliverable.projectId));
  }, [deliverable.projectId]);

  const reload = () => {
    dispatch(requestListParticipantProjectSpecies(deliverable.projectId));
  };

  const onCloseRemoveSpecies = (_reload?: boolean) => {
    setShowConfirmDialog(false);
    if (_reload) {
      reload();
    }
  };

  const onAcceleratorSpeciesClick = (row: any) => {
    goToParticipantProjectSpecies(deliverable.id, row.projectId, row.id);
  };

  return (
    <>
      {activeLocale && (
        <>
          <RemoveSpeciesDialog
            onClose={onCloseRemoveSpecies}
            open={showConfirmDialog}
            speciesToRemove={selectedRows.map((row) => row.id)}
          />

          {openedAddSpeciesModal && (
            <AddSpeciesModal
              onClose={() => setOpenedAddSpeciesModal(false)}
              participantProjectSpecies={participantProjectSpecies?.data || []}
              reload={reload}
              projectId={deliverable.projectId}
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
            columns={isAcceleratorRoute ? consoleColumns : columns}
            emptyTableMessage={strings.THERE_ARE_NO_SPECIES_ADDED_TO_THIS_PROJET_YET}
            id='species-deliverable-table'
            orderBy='speciesScientificName'
            Renderer={TableCellRenderer}
            rows={participantProjectSpecies?.data || []}
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
