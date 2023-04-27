import { useLocalization } from 'src/providers';
import { SupportedLocaleId } from 'src/strings/locales';

export type DocType = 'privacy_policy' | 'report_a_problem' | 'request_a_feature' | 'contact_us';

type DocLink = Record<DocType, string>;

const DOC_LINKS: Record<SupportedLocaleId, DocLink> = {
  en: {
    privacy_policy: 'https://www.terraformation.com/privacy-policy',
    report_a_problem: 'https://www.terraformation.com/contact-us/terraware-support-bug-report',
    request_a_feature: 'https://www.terraformation.com/contact-us/terraware-support-feature-request',
    contact_us: 'https://www.terraformation.com/contact-us/terraware-support-contact-us',
  },
  es: {
    privacy_policy: 'https://www.terraformation.com/privacy-policy',
    report_a_problem: 'https://www.terraformation.com/contact-us/soporte-terraware-informe-de-un-problema',
    request_a_feature: 'https://www.terraformation.com/contact-us/soporte-terraware-solicite-una-funcion',
    contact_us: 'https://www.terraformation.com/contact-us/soporte-terraware-contactenos',
  },
};

export const useDocLinks = () => {
  const { selectedLocale } = useLocalization();

  const docs = DOC_LINKS[selectedLocale as SupportedLocaleId] || DOC_LINKS.en;
  return docs;
};
