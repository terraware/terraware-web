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
  | '/batch/withdraw'
  | '/nursery/withdrawals'
  | '/nursery/withdrawals.*tab=withdrawal_history'
  | '/observations'
  | '/planting-sites'
  | '/seedbanks'
  | '/nurseries'
  | '/contactus'
  | '/modules'
  | '/deliverables'
  | '/applications';

type KnowledgeBaseLink = Record<TerrawarePath, string>;

const KNOWLEDGE_BASE_LINKS: Record<SupportedLocaleId, KnowledgeBaseLink> = {
  en: {
    '/home': 'https://knowledge.terraformation.com/hc/en-us/categories/19696828903700-Terraware',
    '/myaccount': 'https://knowledge.terraformation.com/hc/en-us/articles/27577397264020-Managing-Your-Account',
    '/myaccount/edit': 'https://knowledge.terraformation.com/hc/en-us/articles/27577397264020-Managing-Your-Account',
    '/organization': 'https://knowledge.terraformation.com/hc/en-us/sections/19697686429332-Managing-Organizations',
    '/organization/edit':
      'https://knowledge.terraformation.com/hc/en-us/sections/19697686429332-Managing-Organizations',
    '/people': 'https://knowledge.terraformation.com/hc/en-us/articles/19699591247764-Managing-People',
    '/projects': 'https://knowledge.terraformation.com/hc/en-us/articles/24405062807060-Managing-Projects',
    '/reports': 'https://knowledge.terraformation.com/hc/en-us/articles/19718368767636-Reporting',
    '/species': 'https://knowledge.terraformation.com/hc/en-us/sections/19697739614228-Managing-Your-Species-List',
    '/species/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19699832923796-Adding-Species-To-Your-List',
    '/accessions': 'https://knowledge.terraformation.com/hc/en-us/articles/19717632286356-Viewing-Accessions',
    '/accessions/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19717575654932-Adding-Accessions',
    '/accessions.*tab=detail':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717746578196-Accession-Details',
    '/accessions.*tab=history':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717746578196-Accession-Details',
    '/accessions.*tab=viabilityTesting':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717898082836-Viability-Testing',
    '/inventory': 'https://knowledge.terraformation.com/hc/en-us/articles/19718080004756-Viewing-Inventory',
    '/inventory/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19718072250004-Adding-Inventory',
    '/inventory/batch': 'https://knowledge.terraformation.com/hc/en-us/articles/19718068928788-Inventory-Details',
    '/batch/withdraw': 'https://knowledge.terraformation.com/hc/en-us/articles/19718189195156-Seedling-Withdrawal',
    '/nursery/withdrawals': 'https://knowledge.terraformation.com/hc/en-us/articles/28961509375636-Planting-Progress',
    '/nursery/withdrawals.*tab=withdrawal_history':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718192553876-Withdrawal-History',
    '/observations': 'https://knowledge.terraformation.com/hc/en-us/articles/28388716231956-Observations',
    '/planting-sites':
      'https://knowledge.terraformation.com/hc/en-us/articles/27918882767892-Creating-A-Planting-Sites',
    '/seedbanks':
      'https://knowledge.terraformation.com/hc/en-us/articles/19699636111508-Adding-Seed-Banks-and-Nurseries',
    '/nurseries':
      'https://knowledge.terraformation.com/hc/en-us/articles/19699636111508-Adding-Seed-Banks-and-Nurseries',
    '/contactus': 'https://knowledge.terraformation.com/hc/en-us/articles/19718438661140-Get-Help-Or-Provide-Feedback',
    '/modules': 'https://knowledge.terraformation.com/hc/en-us/articles/29551087572500-Modules',
    '/deliverables': 'https://knowledge.terraformation.com/hc/en-us/articles/29426531812116-Deliverables',
    '/applications': 'https://knowledge.terraformation.com/hc/en-us/articles/29426659306516-Application',
  },
  es: {
    '/home': 'https://knowledge.terraformation.com/hc/en-us/categories/19696828903700-Terraware',
    '/myaccount': 'https://knowledge.terraformation.com/hc/en-us/articles/27577397264020-Managing-Your-Account',
    '/myaccount/edit': 'https://knowledge.terraformation.com/hc/en-us/articles/27577397264020-Managing-Your-Account',
    '/organization': 'https://knowledge.terraformation.com/hc/en-us/sections/19697686429332-Managing-Organizations',
    '/organization/edit':
      'https://knowledge.terraformation.com/hc/en-us/sections/19697686429332-Managing-Organizations',
    '/people': 'https://knowledge.terraformation.com/hc/en-us/articles/19699591247764-Managing-People',
    '/projects': 'https://knowledge.terraformation.com/hc/en-us/articles/24405062807060-Managing-Projects',
    '/reports': 'https://knowledge.terraformation.com/hc/en-us/articles/19718368767636-Reporting',
    '/species': 'https://knowledge.terraformation.com/hc/en-us/sections/19697739614228-Managing-Your-Species-List',
    '/species/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19699832923796-Adding-Species-To-Your-List',
    '/accessions': 'https://knowledge.terraformation.com/hc/en-us/articles/19717632286356-Viewing-Accessions',
    '/accessions/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19717575654932-Adding-Accessions',
    '/accessions.*tab=detail':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717746578196-Accession-Details',
    '/accessions.*tab=history':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717746578196-Accession-Details',
    '/accessions.*tab=viabilityTesting':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717898082836-Viability-Testing',
    '/inventory': 'https://knowledge.terraformation.com/hc/en-us/articles/19718080004756-Viewing-Inventory',
    '/inventory/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19718072250004-Adding-Inventory',
    '/inventory/batch': 'https://knowledge.terraformation.com/hc/en-us/articles/19718068928788-Inventory-Details',
    '/batch/withdraw': 'https://knowledge.terraformation.com/hc/en-us/articles/19718189195156-Seedling-Withdrawal',
    '/nursery/withdrawals': 'https://knowledge.terraformation.com/hc/en-us/articles/28961509375636-Planting-Progress',
    '/nursery/withdrawals.*tab=withdrawal_history':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718192553876-Withdrawal-History',
    '/observations': 'https://knowledge.terraformation.com/hc/en-us/articles/28388716231956-Observations',
    '/planting-sites':
      'https://knowledge.terraformation.com/hc/en-us/articles/27918882767892-Creating-A-Planting-Sites',
    '/seedbanks':
      'https://knowledge.terraformation.com/hc/en-us/articles/19699636111508-Adding-Seed-Banks-and-Nurseries',
    '/nurseries':
      'https://knowledge.terraformation.com/hc/en-us/articles/19699636111508-Adding-Seed-Banks-and-Nurseries',
    '/contactus': 'https://knowledge.terraformation.com/hc/en-us/articles/19718438661140-Get-Help-Or-Provide-Feedback',
    '/modules': 'https://knowledge.terraformation.com/hc/en-us/articles/29551087572500-Modules',
    '/deliverables': 'https://knowledge.terraformation.com/hc/en-us/articles/29426531812116-Deliverables',
    '/applications': 'https://knowledge.terraformation.com/hc/en-us/articles/29426659306516-Application',
  },
  fr: {
    '/home': 'https://knowledge.terraformation.com/hc/en-us/categories/19696828903700-Terraware',
    '/myaccount': 'https://knowledge.terraformation.com/hc/en-us/articles/27577397264020-Managing-Your-Account',
    '/myaccount/edit': 'https://knowledge.terraformation.com/hc/en-us/articles/27577397264020-Managing-Your-Account',
    '/organization': 'https://knowledge.terraformation.com/hc/en-us/sections/19697686429332-Managing-Organizations',
    '/organization/edit':
      'https://knowledge.terraformation.com/hc/en-us/sections/19697686429332-Managing-Organizations',
    '/people': 'https://knowledge.terraformation.com/hc/en-us/articles/19699591247764-Managing-People',
    '/projects': 'https://knowledge.terraformation.com/hc/en-us/articles/24405062807060-Managing-Projects',
    '/reports': 'https://knowledge.terraformation.com/hc/en-us/articles/19718368767636-Reporting',
    '/species': 'https://knowledge.terraformation.com/hc/en-us/sections/19697739614228-Managing-Your-Species-List',
    '/species/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19699832923796-Adding-Species-To-Your-List',
    '/accessions': 'https://knowledge.terraformation.com/hc/en-us/articles/19717632286356-Viewing-Accessions',
    '/accessions/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19717575654932-Adding-Accessions',
    '/accessions.*tab=detail':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717746578196-Accession-Details',
    '/accessions.*tab=history':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717746578196-Accession-Details',
    '/accessions.*tab=viabilityTesting':
      'https://knowledge.terraformation.com/hc/en-us/articles/19717898082836-Viability-Testing',
    '/inventory': 'https://knowledge.terraformation.com/hc/en-us/articles/19718080004756-Viewing-Inventory',
    '/inventory/new': 'https://knowledge.terraformation.com/hc/en-us/articles/19718072250004-Adding-Inventory',
    '/inventory/batch': 'https://knowledge.terraformation.com/hc/en-us/articles/19718068928788-Inventory-Details',
    '/batch/withdraw': 'https://knowledge.terraformation.com/hc/en-us/articles/19718189195156-Seedling-Withdrawal',
    '/nursery/withdrawals': 'https://knowledge.terraformation.com/hc/en-us/articles/28961509375636-Planting-Progress',
    '/nursery/withdrawals.*tab=withdrawal_history':
      'https://knowledge.terraformation.com/hc/en-us/articles/19718192553876-Withdrawal-History',
    '/observations': 'https://knowledge.terraformation.com/hc/en-us/articles/28388716231956-Observations',
    '/planting-sites':
      'https://knowledge.terraformation.com/hc/en-us/articles/27918882767892-Creating-A-Planting-Sites',
    '/seedbanks':
      'https://knowledge.terraformation.com/hc/en-us/articles/19699636111508-Adding-Seed-Banks-and-Nurseries',
    '/nurseries':
      'https://knowledge.terraformation.com/hc/en-us/articles/19699636111508-Adding-Seed-Banks-and-Nurseries',
    '/contactus': 'https://knowledge.terraformation.com/hc/en-us/articles/19718438661140-Get-Help-Or-Provide-Feedback',
    '/modules': 'https://knowledge.terraformation.com/hc/en-us/articles/29551087572500-Modules',
    '/deliverables': 'https://knowledge.terraformation.com/hc/en-us/articles/29426531812116-Deliverables',
    '/applications': 'https://knowledge.terraformation.com/hc/en-us/articles/29426659306516-Application',
  },
};

export const useKnowledgeBaseLinks = () => {
  const { selectedLocale } = useLocalization();

  const docs = KNOWLEDGE_BASE_LINKS[selectedLocale] || KNOWLEDGE_BASE_LINKS.en;
  return docs;
};
