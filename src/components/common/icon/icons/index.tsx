import React from 'react';

import { ReactComponent as BlobbyGrayIconUploadToTheCloud } from './blobby-gray-icon-upload-to-the-cloud.svg';
import { ReactComponent as BlobbyIconHappy } from './blobby-icon-happy.svg';
import { ReactComponent as BlobbyIconLeaf } from './blobby-icon-leaf.svg';
import { ReactComponent as BlobbyIconLibrary } from './blobby-icon-library.svg';
import { ReactComponent as BlobbyIconSeedBank } from './blobby-icon-seed-bank.svg';
import { ReactComponent as BlobbyIconWrench } from './blobby-icon-wrench.svg';
import { ReactComponent as Bug } from './bug.svg';
import { ReactComponent as Calendar } from './calendar.svg';
import { ReactComponent as Cancel } from './icon-cancel.svg';
import { ReactComponent as CaretDown } from './caret-down.svg';
import { ReactComponent as CaretLeft } from './caret-left.svg';
import { ReactComponent as CaretUp } from './caret-up.svg';
import { ReactComponent as ChargingBattery } from './icon-charging-battery.svg';
import { ReactComponent as Checkmark } from './icon-checkmark.svg';
import { ReactComponent as ChevronDown } from './chevron-down.svg';
import { ReactComponent as ChevronUp } from './chevron-up.svg';
import { ReactComponent as Close } from './close.svg';
import { ReactComponent as Critical } from './critical.svg';
import { ReactComponent as Dashboard } from './icon-dashboard.svg';
import { ReactComponent as Edit } from './edit.svg';
import { ReactComponent as Error } from './error.svg';
import { ReactComponent as Export } from './export.svg';
import { ReactComponent as Filter } from './filter.svg';
import { ReactComponent as Folder } from './folder.svg';
import { ReactComponent as Help } from './help.svg';
import { ReactComponent as Home } from './home.svg';
import { ReactComponent as Info } from './info.svg';
import { ReactComponent as IconMenu } from './icon-menu.svg';
import { ReactComponent as Key } from './key.svg';
import { ReactComponent as Leaf } from './leaf.svg';
import { ReactComponent as Lock } from './lock.svg';
import { ReactComponent as Mail } from './icon-mail.svg';
import { ReactComponent as MenuVertical } from './menu-vertical.svg';
import { ReactComponent as Monitoring } from './blobby-icon-heart-monitor.svg';
import { ReactComponent as MonitoringNav } from './icon-heart-monitor.svg';
import { ReactComponent as Notification } from './notification.svg';
import { ReactComponent as Organization } from './blobby-icon-organization.svg';
import { ReactComponent as OrganizationNav } from './icon-org.svg';
import { ReactComponent as People } from './blobby-icon-people.svg';
import { ReactComponent as PeopleNav } from './icon-manager.svg';
import { ReactComponent as Person } from './person.svg';
import { ReactComponent as Plus } from './plus.svg';
import { ReactComponent as RestorationSite } from './restoration-site.svg';
import { ReactComponent as Search } from './search.svg';
import { ReactComponent as SeedBank } from './blobby-icon-seed-bank.svg';
import { ReactComponent as SeedBankNav } from './icon-seed-bank.svg';
import { ReactComponent as Seeds } from './seeds.svg';
import { ReactComponent as Sparkles } from './sparkles.svg';
import { ReactComponent as Species } from './species.svg';
import { ReactComponent as Species2 } from './species2.svg';
import { ReactComponent as Spinner } from './spinner.svg';
import { ReactComponent as Success } from './success.svg';
import { ReactComponent as Touchscreen } from './touchscreen.svg';
import { ReactComponent as UploadCloud } from './upload-cloud.svg';
import { ReactComponent as Warning } from './warning.svg';
import { ReactComponent as Wifi } from './icon-wifi.svg';

export type IconName =
  | 'blobbyGrayIconUploadToTheCloud'
  | 'blobbyIconSeedBank'
  | 'blobbyIconHappy'
  | 'blobbyIconLeaf'
  | 'blobbyIconLibrary'
  | 'blobbyIconWrench'
  | 'bug'
  | 'calendar'
  | 'cancel'
  | 'caretDown'
  | 'caretLeft'
  | 'caretUp'
  | 'chargingBattery'
  | 'checkmark'
  | 'chevronDown'
  | 'chevronUp'
  | 'close'
  | 'critical'
  | 'dashboard'
  | 'edit'
  | 'error'
  | 'export'
  | 'filter'
  | 'folder'
  | 'help'
  | 'home'
  | 'iconMenu'
  | 'info'
  | 'key'
  | 'leaf'
  | 'lock'
  | 'mail'
  | 'menuVertical'
  | 'monitoring'
  | 'monitoringNav'
  | 'notification'
  | 'organization'
  | 'organizationNav'
  | 'people'
  | 'peopleNav'
  | 'person'
  | 'plus'
  | 'restorationSite'
  | 'search'
  | 'seedbank'
  | 'seedbankNav'
  | 'seeds'
  | 'sparkles'
  | 'species'
  | 'species2'
  | 'spinner'
  | 'success'
  | 'touchscreen'
  | 'uploadCloud'
  | 'warning'
  | 'wifi';

type SVGComponent = React.FunctionComponent<
  React.SVGProps<SVGSVGElement> & {
    title?: string | undefined;
  }
>;
const icons: Record<IconName, SVGComponent> = {
  blobbyGrayIconUploadToTheCloud: BlobbyGrayIconUploadToTheCloud,
  blobbyIconSeedBank: BlobbyIconSeedBank,
  blobbyIconHappy: BlobbyIconHappy,
  blobbyIconLeaf: BlobbyIconLeaf,
  blobbyIconLibrary: BlobbyIconLibrary,
  blobbyIconWrench: BlobbyIconWrench,
  bug: Bug,
  calendar: Calendar,
  cancel: Cancel,
  caretDown: CaretDown,
  caretLeft: CaretLeft,
  caretUp: CaretUp,
  chargingBattery: ChargingBattery,
  checkmark: Checkmark,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  close: Close,
  critical: Critical,
  dashboard: Dashboard,
  edit: Edit,
  error: Error,
  export: Export,
  filter: Filter,
  folder: Folder,
  help: Help,
  home: Home,
  iconMenu: IconMenu,
  info: Info,
  key: Key,
  leaf: Leaf,
  lock: Lock,
  mail: Mail,
  menuVertical: MenuVertical,
  monitoring: Monitoring,
  monitoringNav: MonitoringNav,
  notification: Notification,
  organization: Organization,
  organizationNav: OrganizationNav,
  people: People,
  peopleNav: PeopleNav,
  person: Person,
  plus: Plus,
  restorationSite: RestorationSite,
  search: Search,
  seedbank: SeedBank,
  seedbankNav: SeedBankNav,
  seeds: Seeds,
  sparkles: Sparkles,
  species: Species,
  species2: Species2,
  spinner: Spinner,
  success: Success,
  touchscreen: Touchscreen,
  uploadCloud: UploadCloud,
  warning: Warning,
  wifi: Wifi,
};

export default icons;
