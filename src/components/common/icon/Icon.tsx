import { Size } from '../types';
import icons, { IconName } from './icons';
import './styles.scss';

export interface Props {
  name: IconName;
  size?: Size;
  className?: string;
}

export default function Icon({ size = 'small', name, className }: Props): JSX.Element {
  const SVGComponent = icons[name];

  return <SVGComponent className={`tw-icon tw-icon--${size} ${className ?? className}`} />;
}
