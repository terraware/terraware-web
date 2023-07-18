type PlantingProgressMapProps = {
  plantingSiteId: number;
};

export default function PlantingProgressMap({ plantingSiteId }: PlantingProgressMapProps): JSX.Element {
  return <p>{`I am a map of planting site ${plantingSiteId}`}</p>;
}
