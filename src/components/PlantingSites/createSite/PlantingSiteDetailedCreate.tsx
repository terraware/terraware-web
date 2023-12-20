import PlantingSiteCreateFlow from './PlantingSiteCreateFlow';

type PlantingSiteDetailedCreateProps = {
  reloadPlantingSites: () => void;
};

export default function PlantingSiteDetailedCreate(props: PlantingSiteDetailedCreateProps): JSX.Element {
  return <PlantingSiteCreateFlow siteType={'detailed'} reloadPlantingSites={props.reloadPlantingSites} />;
}
