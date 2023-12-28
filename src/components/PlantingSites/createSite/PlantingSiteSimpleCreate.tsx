import NewPlantingSiteCreate from './NewPlantingSiteCreate';

type PlantingSiteSimpleCreateProps = {
  reloadPlantingSites: () => void;
};

export default function PlantingSiteSimpleCreate(props: PlantingSiteSimpleCreateProps): JSX.Element {
  return <NewPlantingSiteCreate siteType={'simple'} reloadPlantingSites={props.reloadPlantingSites} />;
}
