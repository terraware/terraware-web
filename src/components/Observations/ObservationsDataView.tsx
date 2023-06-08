import { useAppSelector } from 'src/redux/store';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { searchObservations } from 'src/redux/features/observations/observationsSelectors';
import ListMapView from 'src/components/ListMapView';
import Search, { SearchInputProps } from './search';
import OrgObservationsListView from './org/OrgObservationsListView';
import ObservationMapView from './map/ObservationMapView';

export type ObservationsDataViewProps = SearchInputProps & {
  selectedPlantingSiteId: number;
};

export default function ObservationsDataView({
  selectedPlantingSiteId,
  search,
  onSearch,
}: ObservationsDataViewProps): JSX.Element {
  const defaultTimeZone = useDefaultTimeZone();
  const observationsResults = useAppSelector((state) =>
    searchObservations(state, selectedPlantingSiteId, defaultTimeZone.get(), search)
  );

  return (
    <ListMapView
      initialView='list'
      search={<Search search={search} onSearch={onSearch} />}
      list={<OrgObservationsListView observationsResults={observationsResults} />}
      map={selectedPlantingSiteId === -1 ? undefined : <ObservationMapView observationsResults={observationsResults} />}
    />
  );
}
