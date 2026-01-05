import { useLocalization } from 'src/providers';
import { SupportedLocaleId } from 'src/strings/locales';

export type DocType =
  | 'ad_hoc_plots'
  | 'cookie_policy'
  | 'planting_site_create_boundary_instructions_video'
  | 'planting_site_create_exclusions_boundary_instructions_video'
  | 'planting_site_create_substratum_boundary_instructions_video'
  | 'planting_site_create_stratum_boundary_instructions_video'
  | 'privacy_policy'
  | 'terraformation'
  | 'terraformation_software_solutions'
  | 'knowledge_base'
  | 'knowledge_base_add_species'
  | 'knowledge_base_stratification';

type DocLink = Record<DocType, string>;

const DOC_LINKS: Record<SupportedLocaleId, DocLink> = {
  en: {
    ad_hoc_plots: 'https://knowledge.terraformation.com/hc/en-us/articles/36389038050708-Ad-Hoc-Plot-Observations',
    cookie_policy: 'https://www.terraformation.com/cookie-policy',
    planting_site_create_boundary_instructions_video:
      'https://player.vimeo.com/video/911493236?h=b8b5555693&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    planting_site_create_exclusions_boundary_instructions_video:
      'https://player.vimeo.com/video/911493377?h=f4362af8d2&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    planting_site_create_substratum_boundary_instructions_video:
      'https://player.vimeo.com/video/911493615?h=f252d5f359&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    planting_site_create_stratum_boundary_instructions_video:
      'https://player.vimeo.com/video/911493480?h=788ba11fe4&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    privacy_policy: 'https://www.terraformation.com/privacy-policy',
    terraformation: 'https://www.terraformation.com',
    terraformation_software_solutions: 'https://www.terraformation.com/solutions/software',
    knowledge_base: 'https://knowledge.terraformation.com/',
    knowledge_base_add_species:
      'https://knowledge.terraformation.com/hc/en-us/articles/19699832923796-Adding-Species-To-Your-List',
    knowledge_base_stratification:
      'https://knowledge.terraformation.com/hc/en-us/articles/27918882767892-Managing-Planting-Sites',
  },
  es: {
    ad_hoc_plots: 'https://knowledge.terraformation.com/hc/en-us/articles/36389038050708-Ad-Hoc-Plot-Observations',
    cookie_policy: 'https://www.terraformation.com/cookie-policy',
    planting_site_create_boundary_instructions_video:
      'https://player.vimeo.com/video/911493236?h=b8b5555693&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    planting_site_create_exclusions_boundary_instructions_video:
      'https://player.vimeo.com/video/911493377?h=f4362af8d2&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    planting_site_create_substratum_boundary_instructions_video:
      'https://player.vimeo.com/video/911493615?h=f252d5f359&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    planting_site_create_stratum_boundary_instructions_video:
      'https://player.vimeo.com/video/911493480?h=788ba11fe4&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    privacy_policy: 'https://www.terraformation.com/politica-de-privacidad',
    terraformation: 'https://www.terraformation.com',
    terraformation_software_solutions: 'https://www.terraformation.com/solutions/software',
    knowledge_base: 'https://knowledge.terraformation.com/',
    knowledge_base_add_species:
      'https://knowledge.terraformation.com/hc/en-us/articles/19699832923796-Adding-Species-To-Your-List',
    knowledge_base_stratification:
      'https://knowledge.terraformation.com/hc/en-us/articles/27918882767892-Managing-Planting-Sites',
  },
  fr: {
    ad_hoc_plots: 'https://knowledge.terraformation.com/hc/en-us/articles/36389038050708-Ad-Hoc-Plot-Observations',
    cookie_policy: 'https://www.terraformation.com/cookie-policy',
    planting_site_create_boundary_instructions_video:
      'https://player.vimeo.com/video/911493236?h=b8b5555693&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    planting_site_create_exclusions_boundary_instructions_video:
      'https://player.vimeo.com/video/911493377?h=f4362af8d2&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    planting_site_create_substratum_boundary_instructions_video:
      'https://player.vimeo.com/video/911493615?h=f252d5f359&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    planting_site_create_stratum_boundary_instructions_video:
      'https://player.vimeo.com/video/911493480?h=788ba11fe4&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    privacy_policy: 'https://www.terraformation.com/politique-de-confidentialite',
    terraformation: 'https://www.terraformation.com',
    terraformation_software_solutions: 'https://www.terraformation.com/solutions/software',
    knowledge_base: 'https://knowledge.terraformation.com/',
    knowledge_base_add_species:
      'https://knowledge.terraformation.com/hc/en-us/articles/19699832923796-Adding-Species-To-Your-List',
    knowledge_base_stratification:
      'https://knowledge.terraformation.com/hc/en-us/articles/27918882767892-Managing-Planting-Sites',
  },
};

export const useDocLinks = () => {
  const { selectedLocale } = useLocalization();

  const docs = DOC_LINKS[selectedLocale] || DOC_LINKS.en;
  return docs;
};
