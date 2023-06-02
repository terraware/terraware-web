import { useAppSelector } from 'src/redux/store';
import { selectPlantingSiteObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import ListMapView from 'src/components/ListMapView';

export type ObservationsDataViewProps = {
  selectedPlantingSiteId: number;
};

export default function ObservationsDataView({ selectedPlantingSiteId }: ObservationsDataViewProps): JSX.Element {
  const observationsResults = useAppSelector((state) =>
    selectPlantingSiteObservationsResults(state, selectedPlantingSiteId)
  );

  return (
    <ListMapView
      initialView='list'
      search={<div>search placeholder</div>}
      list={<div>Placeholder for list view of observations results. Total count: {observationsResults?.length}</div>}
      map={
        selectedPlantingSiteId === -1 ? undefined : (
          <div>Placeholder for map view of observations results. Total count: {observationsResults?.length}</div>
        )
      }
    />
  );
}
