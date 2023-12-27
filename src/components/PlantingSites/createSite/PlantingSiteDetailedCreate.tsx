import NewPlantingSiteCreate from './NewPlantingSiteCreate';

type PlantingSiteDetailedCreateProps = {
  reloadPlantingSites: () => void;
};

export default function PlantingSiteDetailedCreate(props: PlantingSiteDetailedCreateProps): JSX.Element {
  return <NewPlantingSiteCreate siteType={'detailed'} reloadPlantingSites={props.reloadPlantingSites} />;
}
