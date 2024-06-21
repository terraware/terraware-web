import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { SortOrder, TableColumnType, TableRowType } from '@terraware/web-components';

import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { requestListParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectParticipantProjectSpeciesListRequest } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Deliverable } from 'src/types/Deliverables';

import AddSpeciesModal from './AddSpeciesModal';
import RemoveSpeciesDialog from './RemoveSpeciesDialog';
import TableCellRenderer from './TableCellRenderer';

export function descendingComparator<T>(
  a: T,
  b: T,
  orderBy: keyof T | string,
  order: SortOrder,
  splitDots?: boolean
): number {
  const getValue = (obj: any, path: string) => {
    if (splitDots) {
      const parts = path.split('.');

      return parts.reduce((acc, part) => acc && acc[part], obj);
    }

    return obj[path];
  };

  const aValue = getValue(a, orderBy as string) ?? '';
  const bValue = getValue(b, orderBy as string) ?? '';

  const numCompareResult = descendingNumComparator(aValue, bValue);
  if (numCompareResult !== null) {
    return order === 'desc' ? numCompareResult : -numCompareResult;
  }

  // blank values at the end always (any order)
  if (isEmptyValue(aValue.toString()) && isEmptyValue(bValue.toString())) {
    return 0;
  }

  if (isEmptyValue(aValue.toString())) {
    return 1;
  }

  if (isEmptyValue(bValue.toString())) {
    return -1;
  }

  if (bValue < aValue) {
    return order === 'desc' ? -1 : 1;
  }
  if (bValue > aValue) {
    return order === 'desc' ? 1 : -1;
  }

  return 0;
}

function isEmptyValue(value?: string): boolean {
  if (value === '' || value === null || value?.toString().trim() === '' || value === undefined) {
    return true;
  } else {
    return false;
  }
}

function descendingNumComparator<T>(a: T, b: T): number | null {
  const aNumValue = Number(a);
  const bNumValue = Number(b);

  if (!isNaN(aNumValue) && !isNaN(bNumValue)) {
    return bNumValue - aNumValue;
  }

  return null;
}

const columns = (): TableColumnType[] => [
  { key: 'species.scientificName', name: strings.SCIENTIFIC_NAME, type: 'string' },
  { key: 'species.commonName', name: strings.COMMON_NAME, type: 'string' },
  { key: 'participantProjectSpecies.speciesNativeCategory', name: strings.NATIVE_NON_NATIVE, type: 'string' },
  { key: 'participantProjectSpecies.rationale', name: strings.RATIONALE, type: 'string' },
  { key: 'participantProjectSpecies.submissionStatus', name: strings.STATUS, type: 'string' },
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
  const { currentDeliverables } = useParticipantData();

  const participantProjectSpecies = useAppSelector(selectParticipantProjectSpeciesListRequest(deliverable.projectId));

  const [selectedRows, setSelectedRows] = useState<TableRowType[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [openedAddSpeciesModal, setOpenedAddSpeciesModal] = useState(false);

  const addSpeciesToProjectButtonIsDisabled = useMemo(() => {
    return !currentDeliverables?.find((deliverable) => deliverable.id === deliverable.id);
  }, [currentDeliverables, deliverable]);

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
    goToParticipantProjectSpecies(deliverable.id, row.project.id, row.participantProjectSpecies.id);
  };

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
                disabled={addSpeciesToProjectButtonIsDisabled}
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
            sortComparator={descendingComparator}
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
