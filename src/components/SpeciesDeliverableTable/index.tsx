import React, { useEffect, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { TableColumnType, TableRowType } from '@terraware/web-components';

import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { requestListParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectParticipantProjectSpeciesListRequest } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

import AddSpeciesModal from './AddSpeciesModal';
import RemoveSpeciesDialog from './RemoveSpeciesDialog';
import TableCellRenderer from './TableCellRenderer';

const columns = (): TableColumnType[] => [
  { key: 'speciesScientificName', name: strings.SCIENTIFIC_NAME, type: 'string' },
  { key: 'speciesCommonName', name: strings.COMMON_NAME, type: 'string' },
  { key: 'rationale', name: strings.RATIONALE, type: 'string' },
  { key: 'status', name: strings.STATUS, type: 'string' },
];

const SpeciesDeliverableTable = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { currentParticipantProject } = useParticipantData();
  const participantProjectSpecies = useAppSelector(
    selectParticipantProjectSpeciesListRequest(currentParticipantProject?.id || -1)
  );

  const [selectedRows, setSelectedRows] = useState<TableRowType[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [openedAddSpeciesModal, setOpenedAddSpeciesModal] = useState(false);

  useEffect(() => {
    if (!currentParticipantProject?.id) {
      return;
    }

    void dispatch(requestListParticipantProjectSpecies(currentParticipantProject.id));
  }, []);

  const reload = () => {
    if (currentParticipantProject) {
      dispatch(requestListParticipantProjectSpecies(currentParticipantProject.id));
    }
  };

  return (
    <>
      {activeLocale && (
        <>
          <RemoveSpeciesDialog
            onClose={() => setShowConfirmDialog(false)}
            open={showConfirmDialog}
            speciesToRemove={selectedRows.map((row) => row.id)}
          />

          {openedAddSpeciesModal && (
            <AddSpeciesModal
              onClose={() => setOpenedAddSpeciesModal(false)}
              participantProjectSpecies={participantProjectSpecies?.data || []}
              reload={reload}
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

            <Button
              icon='plus'
              id='add-species-to-project'
              label='Add Species to Project'
              onClick={() => {
                setOpenedAddSpeciesModal(true);
              }}
              priority='secondary'
              size='medium'
            />
          </Box>

          <Table
            columns={columns}
            emptyTableMessage={strings.THERE_ARE_NO_SPECIES_ADDED_TO_THIS_PROJET_YET}
            id='species-deliverable-table'
            orderBy='speciesScientificName'
            Renderer={TableCellRenderer}
            rows={participantProjectSpecies?.data || []}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            showCheckbox={true}
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
          />
        </>
      )}
    </>
  );
};

export default SpeciesDeliverableTable;
