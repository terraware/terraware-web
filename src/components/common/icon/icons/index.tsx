import React from 'react';
import { ReactComponent as Calendar } from './calendar.svg';
import { ReactComponent as CaretDown } from './caret-down.svg';
import { ReactComponent as CaretLeft } from './caret-left.svg';
import { ReactComponent as CaretUp } from './caret-up.svg';
import { ReactComponent as ChevronDown } from './chevron-down.svg';
import { ReactComponent as ChevronUp } from './chevron-up.svg';
import { ReactComponent as Error } from './error.svg';
import { ReactComponent as Folder } from './folder.svg';
import { ReactComponent as Home } from './home.svg';
import { ReactComponent as Key } from './key.svg';
import { ReactComponent as Leaf } from './leaf.svg';
import { ReactComponent as Lock } from './lock.svg';
import { ReactComponent as Organization } from './organization.svg';
import { ReactComponent as People } from './people.svg';
import { ReactComponent as Person } from './person.svg';
import { ReactComponent as Plus } from './plus.svg';
import { ReactComponent as Project } from './project.svg';
import { ReactComponent as RestorationSite } from './restoration-site.svg';
import { ReactComponent as Seeds } from './seeds.svg';
import { ReactComponent as Site } from './site.svg';
import { ReactComponent as Sites } from './sites.svg';
import { ReactComponent as Species } from './species.svg';
import { ReactComponent as Species2 } from './species2.svg';
import { ReactComponent as Spinner } from './spinner.svg';
import { ReactComponent as Warning } from './warning.svg';

export type IconName =
  | 'calendar'
  | 'caretDown'
  | 'caretLeft'
  | 'caretUp'
  | 'chevronUp'
  | 'chevronDown'
  | 'error'
  | 'folder'
  | 'home'
  | 'key'
  | 'leaf'
  | 'lock'
  | 'organization'
  | 'people'
  | 'person'
  | 'plus'
  | 'project'
  | 'restorationSite'
  | 'seeds'
  | 'site'
  | 'sites'
  | 'species'
  | 'species2'
  | 'spinner'
  | 'warning';

type SVGComponent = React.FunctionComponent<
  React.SVGProps<SVGSVGElement> & {
    title?: string | undefined;
  }
>;
const icons: Record<IconName, SVGComponent> = {
  calendar: Calendar,
  caretDown: CaretDown,
  caretLeft: CaretLeft,
  caretUp: CaretUp,
  chevronUp: ChevronUp,
  chevronDown: ChevronDown,
  folder: Folder,
  home: Home,
  key: Key,
  leaf: Leaf,
  lock: Lock,
  organization: Organization,
  people: People,
  person: Person,
  plus: Plus,
  project: Project,
  restorationSite: RestorationSite,
  seeds: Seeds,
  site: Site,
  sites: Sites,
  species: Species,
  species2: Species2,
  spinner: Spinner,
  error: Error,
  warning: Warning,
};

export default icons;
