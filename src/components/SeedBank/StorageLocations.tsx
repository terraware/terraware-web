import { Grid, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import strings from 'src/strings';
import { SeedBankService } from 'src/services';
import { DEFAULT_STORAGE_LOCATIONS, PartialStorageLocation } from 'src/types/Facility';
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
import _ from 'lodash';

export type StorageLocationsProps = {
  seedBankId?: number;
  onEdit?: (storageLocations: PartialStorageLocation[]) => void;
};

const storageLocationWith = (name: string, id: number) => ({
  name,
  id: -id,
  activeAccessions: 0,
});

export default function StorageLocations({ seedBankId, onEdit }: StorageLocationsProps): JSX.Element | null {
  const { activeLocale } = useLocalization();
  const numberFormatter = useNumberFormatter();
  const [selectedRows, setSelectedRows] = useState<PartialStorageLocation[]>([]);
  const [selectedStorageLocation, setSelectedStorageLocation] = useState<PartialStorageLocation | undefined>();
  const [storageLocations, setStorageLocations] = useState<PartialStorageLocation[]>([]);
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

    if (featureEnabled) {
      if (seedBankId) {
        fetchStorageLocations();
      } else {
        setStorageLocations(DEFAULT_STORAGE_LOCATIONS().map((name, index) => storageLocationWith(name, index)));
      }
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
        onButtonClick: () => deleteStorageLocations(selectedRows.filter((location) => !location.activeAccessions)),
      });
    }

    return topBarButtons;
  };

  const onStorageLocationSelected = (location: PartialStorageLocation, fromColumn?: string) => {
    if (fromColumn === 'name') {
      setSelectedStorageLocation(location);
      setOpenStorageLocationModal(true);
    }
  };

  const onAddStorageLocationClick = () => {
    setSelectedStorageLocation(undefined);
    setOpenStorageLocationModal(true);
  };

  const setNewStorageLocations = (locations: PartialStorageLocation[]) => {
    setStorageLocations(locations);
    if (onEdit) {
      onEdit(locations);
    }
  };

  const addStorageLocation = (name: string) => {
    setNewStorageLocations([...storageLocations, storageLocationWith(name, Date.now())]);
  };

  const editStorageLocation = (location: PartialStorageLocation) => {
    setNewStorageLocations([...storageLocations.filter((l) => l.id !== location.id), location]);
  };

  const deleteStorageLocations = (locations: PartialStorageLocation[]) => {
    setNewStorageLocations([..._.differenceWith(storageLocations, locations, (l1, l2) => l1.id === l2.id)]);
  };

  const editMode: boolean = !!onEdit;

  if (!featureEnabled) {
    return null;
  }

  return (
    <>
      <AddEditStorageLocationModal
        open={openStorageLocationModal}
        onClose={() => setOpenStorageLocationModal(false)}
        onAddStorageLocation={(locationName: string) => addStorageLocation(locationName)}
        onEditStorageLocation={(location: PartialStorageLocation) => editStorageLocation(location)}
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
        {(storageLocations.length > 0 || editMode) && (
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
        )}
        {storageLocations.length === 0 && !editMode && (
          <Typography fontSize='14px' fontWeight={400}>
            {strings.NO_SUB_LOCATIONS}
          </Typography>
        )}
      </Grid>
    </>
  );
}
