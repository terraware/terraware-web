import NewPlantingSite from './editor/NewPlantingSite';

type PlantingSiteDetailedCreateProps = {
  reloadPlantingSites: () => void;
};

export default function PlantingSiteDetailedCreate(props: PlantingSiteDetailedCreateProps): JSX.Element {
  return <NewPlantingSite siteType={'detailed'} reloadPlantingSites={props.reloadPlantingSites} />;
}
