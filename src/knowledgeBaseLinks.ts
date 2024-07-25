import { useLocalization } from 'src/providers';
import { SupportedLocaleId } from 'src/strings/locales';

export type TerrawarePath =
  | 'home'
  | 'myaccount'
  | 'myaccount/edit'
  | 'organization'
  | 'people'
  | 'projects'
  | 'reports'
  | 'species'
  | 'species/new'
  | 'accessions'
  | 'accessions/new'
  | 'inventory'
  | 'inventory/new'
  | 'inventory/batch'
  | 'batch/withdraw'
  | 'observations'
  | 'planting-sites'
  | 'contactus';

type KnowledgeBaseLink = Record<TerrawarePath, string>;

const KNOWLEDGE_BASE_LINKS: Record<SupportedLocaleId, KnowledgeBaseLink> = {
  en: {
    home: 'https://knowledge.terraformation.com/hc/en-us/categories/19696828903700-Terraware',
    myaccount: 'https://knowledge.terraformation.com/hc/en-us/articles/19699278983188-Creating-An-Account',
    'myaccount/edit': 'https://knowledge.terraformation.com/hc/en-us/articles/27577397264020-Managing-Your-Account',
    organization: 'https://knowledge.terraformation.com/hc/en-us/sections/19697686429332-Managing-Organizations',
    people: 'https://knowledge.terraformation.com/hc/en-us/articles/19699591247764-Managing-People',
    projects: 'https://knowledge.terraformation.com/hc/en-us/articles/24405062807060-Managing-Projects',
    reports: 'https://knowledge.terraformation.com/hc/en-us/articles/19718368767636-Reporting',
    species: 'https://knowledge.terraformation.com/hc/en-us/sections/19697739614228-Managing-Your-Species-List',
    'species/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19699832923796-Adding-Species-To-Your-List',
    accessions: 'https://knowledge.terraformation.com/hc/en-us/articles/19717632286356-Viewing-Accessions',
    'accessions/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19717575654932-Adding-Accessions',
    inventory: 'https://knowledge.terraformation.com/hc/en-us/articles/19718080004756-Viewing-Inventory',
    'inventory/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19718072250004-Adding-Inventory',
    'inventory/batch': 'https://knowledge.terraformation.com/hc/en-us/articles/19718068928788-Inventory-Details',
    'batch/withdraw': 'https://knowledge.terraformation.com/hc/en-us/articles/19718189195156-Seedling-Withdrawal',
    observations: 'https://knowledge.terraformation.com/hc/en-us/articles/28388716231956-Observations',
    'planting-sites': 'https://knowledge.terraformation.com/hc/en-us/articles/19718249140372-Tracking-Plants-With-Maps',
    contactus: 'https://knowledge.terraformation.com/hc/en-us/articles/19718438661140-Get-Help-Or-Provide-Feedback',
  },
  es: {
    home: 'https://knowledge.terraformation.com/hc/en-us/categories/19696828903700-Terraware',
    myaccount: 'https://knowledge.terraformation.com/hc/en-us/articles/19699278983188-Creating-An-Account',
    'myaccount/edit': 'https://knowledge.terraformation.com/hc/en-us/articles/27577397264020-Managing-Your-Account',
    organization: 'https://knowledge.terraformation.com/hc/en-us/sections/19697686429332-Managing-Organizations',
    people: 'https://knowledge.terraformation.com/hc/en-us/articles/19699591247764-Managing-People',
    projects: 'https://knowledge.terraformation.com/hc/en-us/articles/24405062807060-Managing-Projects',
    reports: 'https://knowledge.terraformation.com/hc/en-us/articles/19718368767636-Reporting',
    species: 'https://knowledge.terraformation.com/hc/en-us/sections/19697739614228-Managing-Your-Species-List',
    'species/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19699832923796-Adding-Species-To-Your-List',
    accessions: 'https://knowledge.terraformation.com/hc/en-us/articles/19717632286356-Viewing-Accessions',
    'accessions/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19717575654932-Adding-Accessions',
    inventory: 'https://knowledge.terraformation.com/hc/en-us/articles/19718080004756-Viewing-Inventory',
    'inventory/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19718072250004-Adding-Inventory',
    'inventory/batch': 'https://knowledge.terraformation.com/hc/en-us/articles/19718068928788-Inventory-Details',
    'batch/withdraw': 'https://knowledge.terraformation.com/hc/en-us/articles/19718189195156-Seedling-Withdrawal',
    observations: 'https://knowledge.terraformation.com/hc/en-us/articles/28388716231956-Observations',
    'planting-sites': 'https://knowledge.terraformation.com/hc/en-us/articles/19718249140372-Tracking-Plants-With-Maps',
    contactus: 'https://knowledge.terraformation.com/hc/en-us/articles/19718438661140-Get-Help-Or-Provide-Feedback',
  },
};

export const useKnowledgeBaseLinks = () => {
  const { selectedLocale } = useLocalization();

  const docs = KNOWLEDGE_BASE_LINKS[selectedLocale] || KNOWLEDGE_BASE_LINKS.en;
  return docs;
};
