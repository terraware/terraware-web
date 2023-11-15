import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Box } from '@mui/material';
import { PillListItem, Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import InventoryFilters, { InventoryFiltersType } from './InventoryFiltersPopover';
import { getNurseryName } from './FilterUtils';
import { useOrganization } from 'src/providers/hooks';
import { PillList } from '@terraware/web-components';
import theme from 'src/theme';
import { OriginPage } from './InventoryBatch';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from '../../redux/features/species/speciesThunks';

interface SearchProps {
  searchValue: string;
  onSearch: (value: string) => void;
  filters: InventoryFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<InventoryFiltersType>>;
  origin?: OriginPage;
}

export default function Search(props: SearchProps): JSX.Element | null {
  const { searchValue, onSearch, filters, setFilters } = props;
  const origin = props.origin || 'Species';

  const { selectedOrganization } = useOrganization();
  const dispatch = useAppDispatch();

  const species = useAppSelector(selectSpecies);

  const [filterPillData, setFilterPillData] = useState<PillListItem<string>[]>();

  const getSpeciesName = useCallback(
    (speciesId: number) => (species || []).find((s) => s.id === speciesId)?.commonName,
    [species]
  );

  useEffect(() => {
    let data: PillListItem<string>[] = [];
    if ((filters.facilityIds?.length ?? 0) > 0) {
      data = [
        {
          id: 'filterPillData',
          label: strings.NURSERY,
          value: filters.facilityIds?.map((id) => getNurseryName(id, selectedOrganization)).join(', ') ?? '',
        },
      ];
    } else if ((filters.speciesIds?.length ?? 0) > 0) {
      data = [
        {
          id: 'filterPillData',
          label: strings.SPECIES,
          value: filters.speciesIds?.map(getSpeciesName).join(', ') ?? '',
        },
      ];
    }

    setFilterPillData(data);
  }, [selectedOrganization, filters.facilityIds, filters.speciesIds, getSpeciesName]);

  useEffect(() => {
    if (origin === 'Nursery') {
      void dispatch(requestSpecies(selectedOrganization.id));
    }
  }, [origin, dispatch, selectedOrganization.id]);

  if (origin === 'Nursery' && !species) {
    return null;
  }

  return (
    <>
      <Box display='flex' flexDirection='row' alignItems='center'>
        <Box width='300px'>
          <Textfield
            placeholder={strings.SEARCH}
            iconLeft='search'
            label=''
            id='search'
            type='text'
            onChange={(value) => onSearch(value as string)}
            value={searchValue}
            iconRight='cancel'
            onClickRightIcon={() => onSearch('')}
          />
        </Box>
        <InventoryFilters filters={filters} setFilters={setFilters} origin={origin} />
      </Box>
      <Grid
        display='flex'
        flexDirection='row'
        alignItems='center'
        sx={{ marginTop: theme.spacing(0.5), marginLeft: theme.spacing(1) }}
      >
        <PillList data={filterPillData ?? []} onRemove={() => setFilters({})} />
      </Grid>
    </>
  );
}
