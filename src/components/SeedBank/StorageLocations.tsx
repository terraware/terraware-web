import { Grid, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import strings from 'src/strings';
import { SeedBankService } from 'src/services';
import { StorageLocation } from 'src/types/Facility';
import { useLocalization } from 'src/providers/hooks';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { useNumberFormatter } from 'src/utils/useNumber';
import isEnabled from 'src/features';
import StorageLocationsCellRenderer from './StorageLocationsCellRenderer';
import { TopBarButton } from '@terraware/web-components/components/table';
import { Button } from '@terraware/web-components';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import AddEditStorageLocationModal from './AddEditStorageLocationModal';

export type StorageLocationsProps = {
  seedBankId?: number;
  onEdit?: (storageLocations: StorageLocation[]) => void;
};

export default function StorageLocations({ seedBankId, onEdit }: StorageLocationsProps): JSX.Element | null {
  const { activeLocale } = useLocalization();
  const numberFormatter = useNumberFormatter();
  const [selectedRows, setSelectedRows] = useState<StorageLocation[]>([]);
  const [selectedStorageLocation, setSelectedStorageLocation] = useState<StorageLocation | undefined>();
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>([]);
  const [openStorageLocationModal, setOpenStorageLocationModal] = useState<boolean>(false);
  const numericFormatter = useMemo(() => numberFormatter(activeLocale), [numberFormatter, activeLocale]);
  const columns: TableColumnType[] = [
    { key: 'name', name: strings.NAME, type: 'string' },
    { key: 'activeAccessions', name: strings.ACTIVE_ACCESSIONS, type: 'number' },
  ];
  const { isMobile } = useDeviceInfo();
  const featureEnabled = isEnabled('Storage locations');

  useEffect(() => {
    const fetchStorageLocations = async () => {
      const response = await SeedBankService.getStorageLocations(seedBankId!);
      if (response.requestSucceeded) {
        if (activeLocale) {
          const collator = new Intl.Collator(activeLocale);
          setStorageLocations(response.storageLocations.sort((a, b) => collator.compare(a.name, b.name)));
        }
      }
    };

    if (featureEnabled && seedBankId) {
      fetchStorageLocations();
    }
  }, [seedBankId, activeLocale, featureEnabled]);

  const getTopBarButtons = () => {
    const topBarButtons: TopBarButton[] = [];
    if (selectedRows.length) {
      topBarButtons.push({
        buttonType: 'destructive',
        buttonText: strings.DELETE,
        // we don't want to delete locations that have active accessions
        disabled: !selectedRows.some((location) => !location.activeAccessions),
        onButtonClick: () =>
          selectedRows
            .filter((location) => !location.activeAccessions)
            .forEach((location) => deleteStorageLocation(location)),
      });
    }

    return topBarButtons;
  };

  const onStorageLocationSelected = (location: StorageLocation, fromColumn?: string) => {
    if (fromColumn === 'name') {
      setSelectedStorageLocation(location);
      setOpenStorageLocationModal(true);
    }
  };

  const onAddStorageLocationClick = () => {
    setSelectedStorageLocation(undefined);
    setOpenStorageLocationModal(true);
  };

  const setNewStorageLocations = (locations: StorageLocation[]) => {
    setStorageLocations(locations);
    if (onEdit) {
      onEdit(locations);
    }
  };

  const addStorageLocation = (name: string) => {
    setNewStorageLocations([
      ...storageLocations,
      { name, id: -Date.now(), activeAccessions: 0, facilityId: seedBankId! },
    ]);
  };

  const editStorageLocation = (location: StorageLocation) => {
    setNewStorageLocations([...storageLocations.filter((l) => l.id !== location.id), location]);
  };

  const deleteStorageLocation = (location: StorageLocation) => {
    setNewStorageLocations([...storageLocations.filter((l) => l.id !== location.id)]);
  };

  const editMode: boolean = !!onEdit;

  if (!featureEnabled || !(storageLocations.length || editMode)) {
    return null;
  }

  return (
    <>
      <AddEditStorageLocationModal
        open={openStorageLocationModal}
        onClose={() => setOpenStorageLocationModal(false)}
        onAddStorageLocation={(locationName: string) => addStorageLocation(locationName)}
        onEditStorageLocation={(location: StorageLocation) => editStorageLocation(location)}
        selectedStorageLocation={selectedStorageLocation}
        storageLocations={storageLocations}
      />
      <Grid
        item
        xs={12}
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        marginTop={4}
        marginBottom={2}
      >
        <Typography fontSize='16px' fontWeight={600}>
          {strings.SUB_LOCATIONS}
        </Typography>
        {editMode && (
          <Button
            id='new-batch'
            icon='plus'
            label={isMobile ? '' : strings.ADD_SUB_LOCATION}
            onClick={onAddStorageLocationClick}
            size='small'
          />
        )}
      </Grid>
      <Grid item xs={12}>
        <Table
          id='storage-sub-locations-table'
          columns={columns}
          rows={storageLocations}
          orderBy='name'
          Renderer={StorageLocationsCellRenderer({ seedBankId, numericFormatter, editMode })}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          showCheckbox={editMode}
          isClickable={() => false}
          showTopBar={editMode}
          topBarButtons={getTopBarButtons()}
          onSelect={onStorageLocationSelected}
          controlledOnSelect={true}
        />
      </Grid>
    </>
  );
}
