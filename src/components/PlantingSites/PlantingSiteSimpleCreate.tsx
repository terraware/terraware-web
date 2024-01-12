import NewPlantingSite from './editor/NewPlantingSite';

type PlantingSiteSimpleCreateProps = {
  reloadPlantingSites: () => void;
};

export default function PlantingSiteSimpleCreate(props: PlantingSiteSimpleCreateProps): JSX.Element {
  return <NewPlantingSite siteType={'simple'} reloadPlantingSites={props.reloadPlantingSites} />;
}
