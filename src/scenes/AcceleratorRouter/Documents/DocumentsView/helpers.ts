import { DocumentTemplate } from 'src/types/documentProducer/DocumentTemplate';
import { memoize } from 'src/utils/memoize';

export const getDocumentTemplateName = memoize((documentTemplateId: number, documentTemplates: DocumentTemplate[] | undefined): string => {
  const documentTemplate = (documentTemplates || []).find((_documentTemplate) => _documentTemplate.id === documentTemplateId);
  if (!documentTemplate) {
    return '';
  }
  return documentTemplate.name;
});
