import { ObservationResults } from 'src/types/Observations';

export type OrgObservationsListViewProps = {
  observationsResults?: ObservationResults[];
};

export default function OrgObservationsListView({ observationsResults }: OrgObservationsListViewProps): JSX.Element {
  return <div>Placeholder for list view of observations results. Total count: {observationsResults?.length}</div>;
}
