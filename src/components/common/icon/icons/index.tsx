import React from 'react';
import { ReactComponent as Bug } from './bug.svg';
import { ReactComponent as Calendar } from './calendar.svg';
import { ReactComponent as CaretDown } from './caret-down.svg';
import { ReactComponent as CaretLeft } from './caret-left.svg';
import { ReactComponent as CaretUp } from './caret-up.svg';
import { ReactComponent as ChevronDown } from './chevron-down.svg';
import { ReactComponent as ChevronUp } from './chevron-up.svg';
import { ReactComponent as Critical } from './critical.svg';
import { ReactComponent as Edit } from './edit.svg';
import { ReactComponent as Error } from './error.svg';
import { ReactComponent as Folder } from './folder.svg';
import { ReactComponent as Help } from './help.svg';
import { ReactComponent as Home } from './home.svg';
import { ReactComponent as Info } from './info.svg';
import { ReactComponent as Key } from './key.svg';
import { ReactComponent as Leaf } from './leaf.svg';
import { ReactComponent as Lock } from './lock.svg';
import { ReactComponent as MenuVertical } from './menu-vertical.svg';
import { ReactComponent as Notification } from './notification.svg';
import { ReactComponent as Organization } from './organization.svg';
import { ReactComponent as People } from './people.svg';
import { ReactComponent as Person } from './person.svg';
import { ReactComponent as Plus } from './plus.svg';
import { ReactComponent as Project } from './project.svg';
import { ReactComponent as RestorationSite } from './restoration-site.svg';
import { ReactComponent as Search } from './search.svg';
import { ReactComponent as Seeds } from './seeds.svg';
import { ReactComponent as Site } from './site.svg';
import { ReactComponent as Sites } from './sites.svg';
import { ReactComponent as Sparkles } from './sparkles.svg';
import { ReactComponent as Species } from './species.svg';
import { ReactComponent as Species2 } from './species2.svg';
import { ReactComponent as Spinner } from './spinner.svg';
import { ReactComponent as Success } from './success.svg';
import { ReactComponent as Touchscreen } from './touchscreen.svg';
import { ReactComponent as UploadCloud } from './upload-cloud.svg';
import { ReactComponent as Warning } from './warning.svg';

export type IconName =
  | 'bug'
  | 'calendar'
  | 'caretDown'
  | 'caretLeft'
  | 'caretUp'
  | 'chevronUp'
  | 'chevronDown'
  | 'critical'
  | 'edit'
  | 'error'
  | 'folder'
  | 'help'
  | 'home'
  | 'info'
  | 'key'
  | 'leaf'
  | 'lock'
  | 'menuVertical'
  | 'notification'
  | 'organization'
  | 'people'
  | 'person'
  | 'plus'
  | 'project'
  | 'restorationSite'
  | 'search'
  | 'seeds'
  | 'site'
  | 'sites'
  | 'sparkles'
  | 'species'
  | 'species2'
  | 'spinner'
  | 'success'
  | 'touchscreen'
  | 'uploadCloud'
  | 'warning';

type SVGComponent = React.FunctionComponent<
  React.SVGProps<SVGSVGElement> & {
    title?: string | undefined;
  }
>;
const icons: Record<IconName, SVGComponent> = {
  bug: Bug,
  calendar: Calendar,
  caretDown: CaretDown,
  caretLeft: CaretLeft,
  caretUp: CaretUp,
  chevronUp: ChevronUp,
  chevronDown: ChevronDown,
  critical: Critical,
  edit: Edit,
  error: Error,
  folder: Folder,
  help: Help,
  home: Home,
  info: Info,
  key: Key,
  leaf: Leaf,
  lock: Lock,
  menuVertical: MenuVertical,
  notification: Notification,
  organization: Organization,
  people: People,
  person: Person,
  plus: Plus,
  project: Project,
  restorationSite: RestorationSite,
  search: Search,
  seeds: Seeds,
  site: Site,
  sites: Sites,
  sparkles: Sparkles,
  species: Species,
  species2: Species2,
  spinner: Spinner,
  success: Success,
  touchscreen: Touchscreen,
  uploadCloud: UploadCloud,
  warning: Warning,
};

export default icons;
