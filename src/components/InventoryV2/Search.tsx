import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Box } from '@mui/material';
import { PillListItem, Textfield } from '@terraware/web-components';
import { PillList } from '@terraware/web-components';
import strings from 'src/strings';
import { useOrganization } from 'src/providers/hooks';
import theme from 'src/theme';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { getNurseryName } from './FilterUtils';
import InventoryFilters, { InventoryFiltersType } from './InventoryFiltersPopover';
import { OriginPage } from './InventoryBatch';

interface SearchProps {
  searchValue: string;
  onSearch: (value: string) => void;
  filters: InventoryFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<InventoryFiltersType>>;
  origin?: OriginPage;
}

type PillListItemWithEmptyValue = PillListItem<string> & { emptyValue: unknown };

export default function Search(props: SearchProps): JSX.Element | null {
  const { searchValue, onSearch, filters, setFilters } = props;
  const origin = props.origin || 'Species';

  const { selectedOrganization } = useOrganization();
  const dispatch = useAppDispatch();

  const species = useAppSelector(selectSpecies);

  const [filterPillData, setFilterPillData] = useState<PillListItemWithEmptyValue[]>([]);

  const getSpeciesName = useCallback(
    (speciesId: number) => (species || []).find((s) => s.id === speciesId)?.scientificName,
    [species]
  );

  useEffect(() => {
    let data: PillListItemWithEmptyValue[] = [];
    if ((filters.facilityIds?.length ?? 0) > 0) {
      data = [
        {
          id: 'facilityIds',
          label: strings.NURSERY,
          value: filters.facilityIds?.map((id) => getNurseryName(id, selectedOrganization)).join(', ') ?? '',
          emptyValue: [],
        },
      ];
    } else if ((filters.speciesIds?.length ?? 0) > 0) {
      data = [
        {
          id: 'speciesIds',
          label: strings.SPECIES,
          value: filters.speciesIds?.map(getSpeciesName).join(', ') ?? '',
          emptyValue: [],
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

  const onRemovePillList = useCallback(
    (filterId: string) => {
      const filter = filterPillData?.find((filterPillDatum) => filterPillDatum.id === filterId);
      setFilters({ [filterId]: filter?.emptyValue || null });
    },
    [filterPillData, setFilters]
  );

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
        <PillList data={filterPillData} onRemove={onRemovePillList} />
      </Grid>
    </>
  );
}
