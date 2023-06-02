import { useAppSelector } from 'src/redux/store';
import {
  selectCompletedObservationsResults,
  selectPlantingSiteObservationsResults,
} from 'src/redux/features/observations/observationsSelectors';
import ListMapView from 'src/components/ListMapView';

export type ObservationsViewProps = {
  selectedPlantingSiteId: number;
};

export default function ObservationsView({ selectedPlantingSiteId }: ObservationsViewProps): JSX.Element {
  const allObservationsResults = useAppSelector(selectCompletedObservationsResults);
  const plantingSiteObservationsResults = useAppSelector((state) =>
    selectPlantingSiteObservationsResults(state, selectedPlantingSiteId)
  );

  return (
    <ListMapView
      initialView='list'
      search={<div>search placeholder</div>}
      list={
        <div>
          Placeholder for list view of observations results. Total count:{' '}
          {plantingSiteObservationsResults?.length || allObservationsResults?.length}
        </div>
      }
      map={
        selectedPlantingSiteId === -1 ? undefined : (
          <div>
            Placeholder for map view of observations results. Total count:{' '}
            {plantingSiteObservationsResults?.length || allObservationsResults?.length}
          </div>
        )
      }
    />
  );
}
