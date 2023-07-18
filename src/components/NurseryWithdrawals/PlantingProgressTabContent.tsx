import { useEffect, useMemo, useState } from 'react';
import { Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { useLocalization } from 'src/providers';
import { FieldOptionsMap } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Card from 'src/components/common/Card';
import ListMapView from 'src/components/ListMapView';
import { FilterField } from 'src/components/common/FilterGroup';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import PlantingProgressList from './PlantingProgressList';
import PlantingProgressMap from './PlantingProgressMap';
import { View } from 'src/components/common/ListMapSelector';
import PlantingSiteSelector from 'src/components/common/PlantingSiteSelector';

const initialView: View = 'list';

export default function PlantingProgress(): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const [search, setSearch] = useState<string>('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [filterOptions, setFilterOptions] = useState<FieldOptionsMap>({});
  const [activeView, setActiveView] = useState<View>(initialView);
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number>(-1);

  const filterColumns = useMemo<FilterField[]>(
    () =>
      activeLocale ? [{ name: 'plantingCompleted', label: strings.PLANTING_COMPLETE, type: 'single_selection' }] : [],
    [activeLocale]
  );

  const searchProps = useMemo<SearchProps>(
    () => ({
      search,
      onSearch: (value: string) => setSearch(value),
      filtersProps: {
        filters,
        setFilters: (value: Record<string, any>) => setFilters(value),
        filterColumns,
        filterOptions,
      },
    }),
    [filters, filterColumns, filterOptions, search]
  );

  useEffect(() => {
    setFilterOptions({
      plantingCompleted: {
        partial: false,
        values: [strings.YES, strings.NO],
      },
    });
  }, [activeLocale]);

  return (
    <Card flushMobile>
      <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt} marginBottom={theme.spacing(1)}>
        {strings.PLANTING_PROGRESS}
      </Typography>
      <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxt}>
        {strings.PLANTING_PROGRESS_TABLE_DESCRIPTION}
      </Typography>
      <ListMapView
        style={{ padding: isMobile ? theme.spacing(3) : theme.spacing(3, 0, 0) }}
        initialView={initialView}
        onView={setActiveView}
        search={<SearchComponent view={activeView} onChangePlantingSite={setSelectedPlantingSiteId} {...searchProps} />}
        list={<PlantingProgressList />}
        map={<PlantingProgressMap plantingSiteId={selectedPlantingSiteId} />}
      />
    </Card>
  );
}

type SearchComponentProps = SearchProps & {
  view: View;
  onChangePlantingSite: (newSiteId: number) => void;
};

function SearchComponent(props: SearchComponentProps): JSX.Element {
  const { search, onSearch, filtersProps, view, onChangePlantingSite } = props;
  return (
    <>
      <div style={{ display: view === 'list' ? 'flex' : 'none' }}>
        <Search search={search} onSearch={onSearch} filtersProps={filtersProps} />
      </div>
      <div style={{ display: view === 'map' ? 'flex' : 'none' }}>
        <PlantingSiteSelector onChange={onChangePlantingSite} />
      </div>
    </>
  );
}
