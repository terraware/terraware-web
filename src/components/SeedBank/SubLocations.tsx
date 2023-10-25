import { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import strings from 'src/strings';
import { SeedBankService } from 'src/services';
import { DEFAULT_SUB_LOCATIONS, PartialSubLocation } from 'src/types/Facility';
import { useLocalization } from 'src/providers';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { useNumberFormatter } from 'src/utils/useNumber';
import SubLocationsCellRenderer from 'src/components/SeedBank/SubLocationsCellRenderer';
import { TopBarButton } from '@terraware/web-components/components/table';
import { Button } from '@terraware/web-components';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import AddEditSubLocationModal from 'src/components/SeedBank/AddEditSubLocationModal';
import _ from 'lodash';

export type SublocationsProps = {
  seedBankId?: number;
  onEdit?: (subLocations: PartialSubLocation[]) => void;
};

const subLocationWith = (name: string, id: number) => ({
  name,
  id: -id,
  activeAccessions: 0,
});

const columns = (): TableColumnType[] => [
  { key: 'name', name: strings.NAME, type: 'string' },
  { key: 'activeAccessions', name: strings.ACTIVE_ACCESSIONS, type: 'number' },
];

export default function SubLocations({ seedBankId, onEdit }: SublocationsProps): JSX.Element | null {
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const numberFormatter = useNumberFormatter();
  const [selectedRows, setSelectedRows] = useState<PartialSubLocation[]>([]);
  const [selectedSubLocation, setSelectedSubLocation] = useState<PartialSubLocation | undefined>();
  const [subLocations, setSubLocations] = useState<PartialSubLocation[]>([]);
  const [openSubLocationModal, setOpenSubLocationModal] = useState<boolean>(false);
  const numericFormatter = useMemo(() => numberFormatter(activeLocale), [numberFormatter, activeLocale]);

  useEffect(() => {
    const fetchSubLocations = async () => {
      const response = await SeedBankService.getSubLocations(seedBankId!);
      if (response.requestSucceeded) {
        if (activeLocale) {
          const collator = new Intl.Collator(activeLocale);
          setSubLocations(response.subLocations.sort((a, b) => collator.compare(a.name, b.name)));
        }
      }
    };

    if (seedBankId) {
      fetchSubLocations();
    } else {
      setSubLocations(DEFAULT_SUB_LOCATIONS().map((name, index) => subLocationWith(name, index)));
    }
  }, [seedBankId, activeLocale]);

  const getTopBarButtons = () => {
    const topBarButtons: TopBarButton[] = [
      {
        buttonType: 'destructive',
        buttonText: strings.DELETE,
        // we don't want to delete locations that have active accessions
        disabled: !selectedRows.some((location) => !location.activeAccessions),
        onButtonClick: () => deleteSubLocations(selectedRows.filter((location) => !location.activeAccessions)),
      },
    ];

    return topBarButtons;
  };

  const onSubLocationSelected = (location: PartialSubLocation, fromColumn?: string) => {
    setSelectedSubLocation(location);
    setOpenSubLocationModal(true);
  };

  const onAddSubLocationClick = () => {
    setSelectedSubLocation(undefined);
    setOpenSubLocationModal(true);
  };

  const setNewSubLocations = (locations: PartialSubLocation[]) => {
    setSubLocations(locations);
    if (onEdit) {
      onEdit(locations);
    }
  };

  const addSubLocation = (name: string) => {
    setNewSubLocations([...subLocations, subLocationWith(name, Date.now())]);
  };

  const editSubLocation = (location: PartialSubLocation) => {
    setNewSubLocations([...subLocations.filter((l) => l.id !== location.id), location]);
  };

  const deleteSubLocations = (locations: PartialSubLocation[]) => {
    setNewSubLocations([..._.differenceWith(subLocations, locations, (l1, l2) => l1.id === l2.id)]);
  };

  const editMode: boolean = !!onEdit;

  return (
    <>
      <AddEditSubLocationModal
        open={openSubLocationModal}
        onClose={() => setOpenSubLocationModal(false)}
        onAddSubLocation={(locationName: string) => addSubLocation(locationName)}
        onEditSubLocation={(location: PartialSubLocation) => editSubLocation(location)}
        selectedSubLocation={selectedSubLocation}
        subLocations={subLocations}
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
            onClick={onAddSubLocationClick}
            size='small'
          />
        )}
      </Grid>
      <Grid item xs={12}>
        {(subLocations.length > 0 || editMode) && (
          <Table
            id='sub-locations-table'
            columns={columns}
            rows={subLocations}
            orderBy='name'
            Renderer={SubLocationsCellRenderer({ seedBankId, numericFormatter, editMode })}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            showCheckbox={editMode}
            isClickable={() => false}
            showTopBar={editMode}
            topBarButtons={getTopBarButtons()}
            onSelect={onSubLocationSelected}
            controlledOnSelect={true}
          />
        )}
        {subLocations.length === 0 && !editMode && (
          <Box paddingY={isMobile ? 3 : 6} textAlign='center'>
            <Typography fontSize='14px' fontWeight={400}>
              {strings.NO_SUB_LOCATIONS}
            </Typography>
          </Box>
        )}
      </Grid>
    </>
  );
}
