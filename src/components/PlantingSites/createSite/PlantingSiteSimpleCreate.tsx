import PlantingSiteCreateFlow from './PlantingSiteCreateFlow';

type PlantingSiteSimpleCreateProps = {
  reloadPlantingSites: () => void;
};

export default function PlantingSiteSimpleCreate(props: PlantingSiteSimpleCreateProps): JSX.Element {
  return <PlantingSiteCreateFlow siteType={'simple'} reloadPlantingSites={props.reloadPlantingSites} />;
}
