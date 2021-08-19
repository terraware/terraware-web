import { Size } from '../types';
import icons, { IconName } from './icons';
import './styles.scss';

export interface Props {
  name: IconName;
  size?: Size;
}

export default function Icon({ size = 'small', name }: Props): JSX.Element {
  const SVGComponent = icons[name];

  return <SVGComponent className={`tw-icon tw-icon--${size}`} />;
}
