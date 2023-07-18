import { useAppSelector } from 'src/redux/store';
import { searchPlantingProgress } from 'src/redux/features/plantings/plantingsSelectors';

export default function PlantingProgressList(): JSX.Element {
  const data = useAppSelector((state: any) => searchPlantingProgress(state, ''));
  return <p>I am a list {data.length}</p>;
}
