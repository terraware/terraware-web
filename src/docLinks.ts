import { useLocalization } from 'src/providers';
import { SupportedLocaleId } from 'src/strings/locales';

export type DocType =
  | 'contact_us'
  | 'planting_site_create_boundary_instructions_video'
  | 'planting_site_create_subzone_boundary_instructions_video'
  | 'planting_site_create_zone_boundary_instructions_video'
  | 'privacy_policy'
  | 'report_a_problem'
  | 'request_a_feature';

type DocLink = Record<DocType, string>;

const DOC_LINKS: Record<SupportedLocaleId, DocLink> = {
  en: {
    contact_us: 'https://www.terraformation.com/contact-us/terraware-support-contact-us',
    planting_site_create_boundary_instructions_video: 'https://www.youtube.com/embed/kfPlGeiFebw', // placeholder, SW-4538
    planting_site_create_subzone_boundary_instructions_video: 'https://www.youtube.com/embed/kfPlGeiFebw', // placeholder, SW-4538
    planting_site_create_zone_boundary_instructions_video: 'https://www.youtube.com/embed/kfPlGeiFebw', // placeholder, SW-4538
    privacy_policy: 'https://www.terraformation.com/privacy-policy',
    report_a_problem: 'https://www.terraformation.com/contact-us/terraware-support-bug-report',
    request_a_feature: 'https://www.terraformation.com/contact-us/terraware-support-feature-request',
  },
  es: {
    contact_us: 'https://www.terraformation.com/contact-us/soporte-terraware-contactenos',
    planting_site_create_boundary_instructions_video: 'https://www.youtube.com/embed/kfPlGeiFebw', // placeholder, SW-4538
    planting_site_create_subzone_boundary_instructions_video: 'https://www.youtube.com/embed/kfPlGeiFebw', // placeholder, SW-4538
    planting_site_create_zone_boundary_instructions_video: 'https://www.youtube.com/embed/kfPlGeiFebw', // placeholder, SW-4538
    privacy_policy: 'https://www.terraformation.com/politica-de-privacidad',
    report_a_problem: 'https://www.terraformation.com/contact-us/soporte-terraware-informe-de-un-problema',
    request_a_feature: 'https://www.terraformation.com/contact-us/soporte-terraware-solicite-una-funcion',
  },
};

export const useDocLinks = () => {
  const { selectedLocale } = useLocalization();

  const docs = DOC_LINKS[selectedLocale as SupportedLocaleId] || DOC_LINKS.en;
  return docs;
};
