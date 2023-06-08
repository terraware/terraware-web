import { useState } from 'react';
import { useAppSelector } from 'src/redux/store';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { searchObservations } from 'src/redux/features/observations/observationsSelectors';
import ListMapView from 'src/components/ListMapView';
import Search from './search';
import OrgObservationsListView from './org/OrgObservationsListView';
import ObservationMapView from './map/ObservationMapView';

export type ObservationsDataViewProps = {
  selectedPlantingSiteId: number;
};

export default function ObservationsDataView({ selectedPlantingSiteId }: ObservationsDataViewProps): JSX.Element {
  const [search, setSearch] = useState<string>('');
  const defaultTimeZone = useDefaultTimeZone();
  const observationsResults = useAppSelector((state) =>
    searchObservations(state, selectedPlantingSiteId, defaultTimeZone.get(), search)
  );

  return (
    <ListMapView
      initialView='list'
      search={<Search value={search} onSearch={(value: string) => setSearch(value)} />}
      list={<OrgObservationsListView observationsResults={observationsResults} />}
      map={selectedPlantingSiteId === -1 ? undefined : <ObservationMapView observationsResults={observationsResults} />}
    />
  );
}
