import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { Button } from '@terraware/web-components';
import { TopBarButton } from '@terraware/web-components/components/table';
import _ from 'lodash';

import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { useLocalization } from 'src/providers';
import { SubLocationService } from 'src/services';
import strings from 'src/strings';
import { DEFAULT_SUB_LOCATIONS, PartialSubLocation } from 'src/types/Facility';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import AddEditSubLocationModal from './AddEditSubLocationModal';
import SubLocationsCellRenderer from './SubLocationsCellRenderer';

export type FacilityType = 'seedbank' | 'nursery';

export type SublocationsProps = {
  facilityType: FacilityType;
  facilityId?: number;
  onEdit?: (subLocations: PartialSubLocation[]) => void;
  renderLink?: (facilityId: number, subLocationName: string) => string;
};

const subLocationWith = (name: string, id: number, facilityType: FacilityType) => ({
  name,
  id: -id,
  activeAccessions: facilityType === 'seedbank' ? 0 : undefined,
  activeBatches: facilityType === 'nursery' ? 0 : undefined,
});

const baseColumn = (): TableColumnType => ({ key: 'name', name: strings.NAME, type: 'string' });

const seedBankColumn = (): TableColumnType => ({
  key: 'activeAccessions',
  name: strings.ACTIVE_ACCESSIONS,
  type: 'number',
});

const nurseryColumn = (): TableColumnType => ({
  key: 'activeBatches',
  name: strings.BATCHES,
  type: 'number',
  tooltipTitle: strings.BATCHES_COLUMN_TOOLTIP,
});

export default function SubLocations({
  facilityType,
  facilityId,
  onEdit,
  renderLink,
}: SublocationsProps): JSX.Element | null {
  const isSeedbank = facilityType === 'seedbank';
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const numberFormatter = useNumberFormatter(activeLocale);
  const [selectedRows, setSelectedRows] = useState<PartialSubLocation[]>([]);
  const [selectedSubLocation, setSelectedSubLocation] = useState<PartialSubLocation | undefined>();
  const [subLocations, setSubLocations] = useState<PartialSubLocation[]>([]);
  const [openSubLocationModal, setOpenSubLocationModal] = useState<boolean>(false);

  const columns = useCallback(() => {
    if (!activeLocale) {
      return [];
    }
    return [baseColumn(), isSeedbank ? seedBankColumn() : nurseryColumn()];
  }, [activeLocale, isSeedbank]);

  useEffect(() => {
    const fetchSubLocations = async () => {
      const response = await SubLocationService.getSubLocations(facilityId!);
      if (response.requestSucceeded) {
        if (activeLocale) {
          const collator = new Intl.Collator(activeLocale);
          setSubLocations(response.subLocations.sort((a, b) => collator.compare(a.name, b.name)));
        }
      }
    };

    if (facilityId) {
      void fetchSubLocations();
    } else if (isSeedbank) {
      setSubLocations(DEFAULT_SUB_LOCATIONS().map((name, index) => subLocationWith(name, index, facilityType)));
    }
  }, [facilityId, activeLocale, isSeedbank, facilityType]);

  const getTopBarButtons = () => {
    const topBarButtons: TopBarButton[] = [
      {
        buttonType: 'destructive',
        buttonText: strings.DELETE,
        // we don't want to delete locations that have active data
        disabled: selectedRows.some((location) => location.activeAccessions || location.activeBatches),
        onButtonClick: () =>
          deleteSubLocations(selectedRows.filter((location) => !(location.activeAccessions || location.activeBatches))),
      },
    ];

    return topBarButtons;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    setNewSubLocations([...subLocations, subLocationWith(name, Date.now(), facilityType)]);
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
            priority='secondary'
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
            Renderer={SubLocationsCellRenderer({ facilityId, numberFormatter, editMode, renderLink })}
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
              {isSeedbank ? strings.NO_SUB_LOCATIONS : strings.NO_SUB_LOCATIONS_NURSERY}
            </Typography>
          </Box>
        )}
      </Grid>
    </>
  );
}
