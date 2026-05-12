import { useLocalization } from 'src/providers';
import { SupportedLocaleId } from 'src/strings/locales';

export type TerrawarePath =
  | '/home'
  | '/myaccount'
  | '/myaccount/edit'
  | '/organization'
  | '/organization/edit'
  | '/people'
  | '/projects'
  | '/reports'
  | '/species'
  | '/species/new'
  | '/accessions'
  | '/accessions/new'
  | '/accessions.*tab=detail'
  | '/accessions.*tab=history'
  | '/accessions.*tab=viabilityTesting'
  | '/inventory'
  | '/inventory/new'
  | '/inventory/batch'
  | '/inventory/withdraw'
  | '/batch/withdraw'
  | '/nursery/withdrawals'
  | '/plants/planting-progress'
  | '/observations'
  | '/observations.*tab=biomassMeasurements'
  | '/observations.*/biomassMeasurements'
  | '/observations.*type=biomass'
  | '/observations.*/survival-rate-settings'
  | '/planting-sites'
  | '/seedbanks'
  | '/nurseries'
  | '/contactus'
  | '/modules'
  | '/deliverables'
  | '/applications'
  | '/plants/dashboard'
  | '/activity-log'
  | '/seed-fund-reports'
  | '/help-support'
  | '/seeds-dashboard';

type KnowledgeBaseLink = Record<TerrawarePath, string>;

const KNOWLEDGE_BASE_LINKS: Record<SupportedLocaleId, KnowledgeBaseLink> = {
  en: {
    '/home': 'https://knowledge.terraformation.com/hc/en-us/categories/19696828903700-Terraware',
    '/myaccount': 'https://knowledge.terraformation.com/hc/en-us/articles/27577397264020-Managing-Your-Account',
    '/myaccount/edit': 'https://knowledge.terraformation.com/hc/en-us/articles/27577397264020-Managing-Your-Account',
    '/organization':
      'https://knowledge.terraformation.com/hc/en-us/articles/19699454569236-Creating-and-Managing-Your-Organization',
    '/organization/edit':
      'https://knowledge.terraformation.com/hc/en-us/articles/19699454569236-Creating-and-Managing-Your-Organization',
    '/people': 'https://knowledge.terraformation.com/hc/en-us/articles/19699591247764-Managing-People',
    '/projects': 'https://knowledge.terraformation.com/hc/en-us/articles/24405062807060-Managing-Projects',
    '/reports': 'https://knowledge.terraformation.com/hc/en-us/articles/19718368767636-Reporting',
    '/species': 'https://knowledge.terraformation.com/hc/en-us/articles/19699832923796-Managing-Species',
    '/species/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19699832923796-Managing-Species',
    '/accessions': 'https://knowledge.terraformation.com/hc/en-us/articles/19717632286356-Managing-Seed-Accessions',
    '/accessions/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19717632286356-Managing-Seed-Accessions',
    '/accessions.*tab=detail':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717632286356-Managing-Seed-Accessions',
    '/accessions.*tab=history':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717632286356-Managing-Seed-Accessions',
    '/accessions.*tab=viabilityTesting':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717898082836-Viability-Testing',
    '/inventory': 'https://knowledge.terraformation.com/hc/en-us/articles/19718072250004-Managing-Seedling-Inventory',
    '/inventory/new':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718072250004-Managing-Seedling-Inventory',
    '/inventory/batch':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718072250004-Managing-Seedling-Inventory',
    '/inventory/withdraw': 'https://knowledge.terraformation.com/hc/en-us/articles/19718189195156-Seedling-Withdrawals',
    '/batch/withdraw': 'https://knowledge.terraformation.com/hc/en-us/articles/19718189195156-Seedling-Withdrawals',
    '/nursery/withdrawals':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718189195156-Seedling-Withdrawals',
    '/plants/planting-progress':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718249140372-Tracking-Planting-Progress',
    '/observations':
      'https://knowledge.terraformation.com/hc/en-us/articles/28388716231956-Scheduling-and-Managing-Observations',
    '/observations.*tab=biomassMeasurements':
      'https://knowledge.terraformation.com/hc/en-us/articles/36072166476052-Biomass-Monitoring-Observations',
    '/observations.*/biomassMeasurements':
      'https://knowledge.terraformation.com/hc/en-us/articles/36072166476052-Biomass-Monitoring-Observations',
    '/observations.*type=biomass':
      'https://knowledge.terraformation.com/hc/en-us/articles/36072166476052-Biomass-Monitoring-Observations',
    '/observations.*/survival-rate-settings':
      'https://knowledge.terraformation.com/hc/en-us/articles/42721719640980-Survival-Rate-Calculations',
    '/planting-sites': 'https://knowledge.terraformation.com/hc/en-us/articles/27918882767892-Managing-Planting-Sites',
    '/seedbanks': 'https://knowledge.terraformation.com/hc/en-us/articles/19699636111508-Managing-Seed-Banks',
    '/nurseries': 'https://knowledge.terraformation.com/hc/en-us/articles/43952036055700-Managing-Nurseries',
    '/contactus': 'https://knowledge.terraformation.com/hc/en-us/articles/19718438661140-Get-Help-Or-Provide-Feedback',
    '/modules': 'https://knowledge.terraformation.com/hc/en-us/articles/29551087572500-Modules',
    '/deliverables': 'https://knowledge.terraformation.com/hc/en-us/articles/29426531812116-Deliverables',
    '/applications': 'https://knowledge.terraformation.com/hc/en-us/articles/29426659306516-Application',
    '/plants/dashboard':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718249140372-Tracking-Planting-Progress',
    '/activity-log': 'https://knowledge.terraformation.com/hc/en-us/articles/43760232788244-Activity-log',
    '/seed-fund-reports':
      'https://knowledge.terraformation.com/hc/en-us/articles/24425452156180-Seed-Fund-Reports-for-Projects',
    '/help-support':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718438661140-Get-Help-Or-Provide-Feedback',
    '/seeds-dashboard': 'https://knowledge.terraformation.com/hc/en-us/articles/40308805688084-Seeds-Dashboard',
  },
  es: {
    '/home': 'https://knowledge.terraformation.com/hc/en-us/categories/19696828903700-Terraware',
    '/myaccount': 'https://knowledge.terraformation.com/hc/en-us/articles/27577397264020-Managing-Your-Account',
    '/myaccount/edit': 'https://knowledge.terraformation.com/hc/en-us/articles/27577397264020-Managing-Your-Account',
    '/organization':
      'https://knowledge.terraformation.com/hc/en-us/articles/19699454569236-Creating-and-Managing-Your-Organization',
    '/organization/edit':
      'https://knowledge.terraformation.com/hc/en-us/articles/19699454569236-Creating-and-Managing-Your-Organization',
    '/people': 'https://knowledge.terraformation.com/hc/en-us/articles/19699591247764-Managing-People',
    '/projects': 'https://knowledge.terraformation.com/hc/en-us/articles/24405062807060-Managing-Projects',
    '/reports': 'https://knowledge.terraformation.com/hc/en-us/articles/19718368767636-Reporting',
    '/species': 'https://knowledge.terraformation.com/hc/en-us/articles/19699832923796-Managing-Species',
    '/species/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19699832923796-Managing-Species',
    '/accessions': 'https://knowledge.terraformation.com/hc/en-us/articles/19717632286356-Managing-Seed-Accessions',
    '/accessions/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19717632286356-Managing-Seed-Accessions',
    '/accessions.*tab=detail':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717632286356-Managing-Seed-Accessions',
    '/accessions.*tab=history':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717632286356-Managing-Seed-Accessions',
    '/accessions.*tab=viabilityTesting':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717898082836-Viability-Testing',
    '/inventory': 'https://knowledge.terraformation.com/hc/en-us/articles/19718072250004-Managing-Seedling-Inventory',
    '/inventory/new':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718072250004-Managing-Seedling-Inventory',
    '/inventory/batch':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718072250004-Managing-Seedling-Inventory',
    '/inventory/withdraw': 'https://knowledge.terraformation.com/hc/en-us/articles/19718189195156-Seedling-Withdrawals',
    '/batch/withdraw': 'https://knowledge.terraformation.com/hc/en-us/articles/19718189195156-Seedling-Withdrawals',
    '/nursery/withdrawals':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718189195156-Seedling-Withdrawals',
    '/plants/planting-progress':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718249140372-Tracking-Planting-Progress',
    '/observations':
      'https://knowledge.terraformation.com/hc/en-us/articles/28388716231956-Scheduling-and-Managing-Observations',
    '/observations.*tab=biomassMeasurements':
      'https://knowledge.terraformation.com/hc/en-us/articles/36072166476052-Biomass-Monitoring-Observations',
    '/observations.*/biomassMeasurements':
      'https://knowledge.terraformation.com/hc/en-us/articles/36072166476052-Biomass-Monitoring-Observations',
    '/observations.*type=biomass':
      'https://knowledge.terraformation.com/hc/en-us/articles/36072166476052-Biomass-Monitoring-Observations',
    '/observations.*/survival-rate-settings':
      'https://knowledge.terraformation.com/hc/en-us/articles/42721719640980-Survival-Rate-Calculations',
    '/planting-sites': 'https://knowledge.terraformation.com/hc/en-us/articles/27918882767892-Managing-Planting-Sites',
    '/seedbanks': 'https://knowledge.terraformation.com/hc/en-us/articles/19699636111508-Managing-Seed-Banks',
    '/nurseries': 'https://knowledge.terraformation.com/hc/en-us/articles/43952036055700-Managing-Nurseries',
    '/contactus': 'https://knowledge.terraformation.com/hc/en-us/articles/19718438661140-Get-Help-Or-Provide-Feedback',
    '/modules': 'https://knowledge.terraformation.com/hc/en-us/articles/29551087572500-Modules',
    '/deliverables': 'https://knowledge.terraformation.com/hc/en-us/articles/29426531812116-Deliverables',
    '/applications': 'https://knowledge.terraformation.com/hc/en-us/articles/29426659306516-Application',
    '/plants/dashboard':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718249140372-Tracking-Planting-Progress',
    '/activity-log': 'https://knowledge.terraformation.com/hc/en-us/articles/43760232788244-Activity-log',
    '/seed-fund-reports':
      'https://knowledge.terraformation.com/hc/en-us/articles/24425452156180-Seed-Fund-Reports-for-Projects',
    '/help-support':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718438661140-Get-Help-Or-Provide-Feedback',
    '/seeds-dashboard': 'https://knowledge.terraformation.com/hc/en-us/articles/40308805688084-Seeds-Dashboard',
  },
  fr: {
    '/home': 'https://knowledge.terraformation.com/hc/en-us/categories/19696828903700-Terraware',
    '/myaccount': 'https://knowledge.terraformation.com/hc/en-us/articles/27577397264020-Managing-Your-Account',
    '/myaccount/edit': 'https://knowledge.terraformation.com/hc/en-us/articles/27577397264020-Managing-Your-Account',
    '/organization':
      'https://knowledge.terraformation.com/hc/en-us/articles/19699454569236-Creating-and-Managing-Your-Organization',
    '/organization/edit':
      'https://knowledge.terraformation.com/hc/en-us/articles/19699454569236-Creating-and-Managing-Your-Organization',
    '/people': 'https://knowledge.terraformation.com/hc/en-us/articles/19699591247764-Managing-People',
    '/projects': 'https://knowledge.terraformation.com/hc/en-us/articles/24405062807060-Managing-Projects',
    '/reports': 'https://knowledge.terraformation.com/hc/en-us/articles/19718368767636-Reporting',
    '/species': 'https://knowledge.terraformation.com/hc/en-us/articles/19699832923796-Managing-Species',
    '/species/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19699832923796-Managing-Species',
    '/accessions': 'https://knowledge.terraformation.com/hc/en-us/articles/19717632286356-Managing-Seed-Accessions',
    '/accessions/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19717632286356-Managing-Seed-Accessions',
    '/accessions.*tab=detail':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717632286356-Managing-Seed-Accessions',
    '/accessions.*tab=history':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717632286356-Managing-Seed-Accessions',
    '/accessions.*tab=viabilityTesting':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717898082836-Viability-Testing',
    '/inventory': 'https://knowledge.terraformation.com/hc/en-us/articles/19718072250004-Managing-Seedling-Inventory',
    '/inventory/new':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718072250004-Managing-Seedling-Inventory',
    '/inventory/batch':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718072250004-Managing-Seedling-Inventory',
    '/inventory/withdraw': 'https://knowledge.terraformation.com/hc/en-us/articles/19718189195156-Seedling-Withdrawals',
    '/batch/withdraw': 'https://knowledge.terraformation.com/hc/en-us/articles/19718189195156-Seedling-Withdrawals',
    '/nursery/withdrawals':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718189195156-Seedling-Withdrawals',
    '/plants/planting-progress':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718249140372-Tracking-Planting-Progress',
    '/observations':
      'https://knowledge.terraformation.com/hc/en-us/articles/28388716231956-Scheduling-and-Managing-Observations',
    '/observations.*tab=biomassMeasurements':
      'https://knowledge.terraformation.com/hc/en-us/articles/36072166476052-Biomass-Monitoring-Observations',
    '/observations.*/biomassMeasurements':
      'https://knowledge.terraformation.com/hc/en-us/articles/36072166476052-Biomass-Monitoring-Observations',
    '/observations.*type=biomass':
      'https://knowledge.terraformation.com/hc/en-us/articles/36072166476052-Biomass-Monitoring-Observations',
    '/observations.*/survival-rate-settings':
      'https://knowledge.terraformation.com/hc/en-us/articles/42721719640980-Survival-Rate-Calculations',
    '/planting-sites': 'https://knowledge.terraformation.com/hc/en-us/articles/27918882767892-Managing-Planting-Sites',
    '/seedbanks': 'https://knowledge.terraformation.com/hc/en-us/articles/19699636111508-Managing-Seed-Banks',
    '/nurseries': 'https://knowledge.terraformation.com/hc/en-us/articles/43952036055700-Managing-Nurseries',
    '/contactus': 'https://knowledge.terraformation.com/hc/en-us/articles/19718438661140-Get-Help-Or-Provide-Feedback',
    '/modules': 'https://knowledge.terraformation.com/hc/en-us/articles/29551087572500-Modules',
    '/deliverables': 'https://knowledge.terraformation.com/hc/en-us/articles/29426531812116-Deliverables',
    '/applications': 'https://knowledge.terraformation.com/hc/en-us/articles/29426659306516-Application',
    '/plants/dashboard':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718249140372-Tracking-Planting-Progress',
    '/activity-log': 'https://knowledge.terraformation.com/hc/en-us/articles/43760232788244-Activity-log',
    '/seed-fund-reports':
      'https://knowledge.terraformation.com/hc/en-us/articles/24425452156180-Seed-Fund-Reports-for-Projects',
    '/help-support':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718438661140-Get-Help-Or-Provide-Feedback',
    '/seeds-dashboard': 'https://knowledge.terraformation.com/hc/en-us/articles/40308805688084-Seeds-Dashboard',
  },
};

export const useKnowledgeBaseLinks = () => {
  const { selectedLocale } = useLocalization();

  const docs = KNOWLEDGE_BASE_LINKS[selectedLocale] || KNOWLEDGE_BASE_LINKS.en;
  return docs;
};
