import React from 'react';
import { ReactComponent as CaretDown } from './caret-down.svg';
import { ReactComponent as CaretUp } from './caret-up.svg';
import { ReactComponent as ChevronDown } from './chevron-down.svg';
import { ReactComponent as ChevronUp } from './chevron-up.svg';
import { ReactComponent as Folder } from './folder.svg';
import { ReactComponent as Home } from './home.svg';
import { ReactComponent as Key } from './key.svg';
import { ReactComponent as Lock } from './lock.svg';
import { ReactComponent as Plus } from './plus.svg';
import { ReactComponent as RestorationSite } from './restoration-site.svg';
import { ReactComponent as Seeds } from './seeds.svg';
import { ReactComponent as Site } from './site.svg';
import { ReactComponent as Species } from './species.svg';
import { ReactComponent as Spinner } from './spinner.svg';

export type IconName =
  | 'caretDown'
  | 'caretUp'
  | 'chevronUp'
  | 'chevronDown'
  | 'folder'
  | 'home'
  | 'key'
  | 'lock'
  | 'plus'
  | 'restorationSite'
  | 'seeds'
  | 'site'
  | 'species'
  | 'spinner';

type SVGComponent = React.FunctionComponent<
  React.SVGProps<SVGSVGElement> & {
    title?: string | undefined;
  }
>;
const icons: Record<IconName, SVGComponent> = {
  caretDown: CaretDown,
  caretUp: CaretUp,
  chevronUp: ChevronUp,
  chevronDown: ChevronDown,
  folder: Folder,
  home: Home,
  key: Key,
  lock: Lock,
  plus: Plus,
  restorationSite: RestorationSite,
  seeds: Seeds,
  site: Site,
  species: Species,
  spinner: Spinner,
};

export default icons;
