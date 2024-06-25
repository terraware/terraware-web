import HttpService, { Response2 } from 'src/services/HttpService';
import { DocumentTemplateListResponse } from 'src/types/documentProducer/DocumentTemplate';

const DOCUMENT_TEMPLATES_ENDPOINT = '/api/v1/documentTemplates';

const getDocumentTemplates = async (): Promise<Response2<DocumentTemplateListResponse>> =>
  await HttpService.root(DOCUMENT_TEMPLATES_ENDPOINT).get2({});

const DocumentTemplateService = {
  getDocumentTemplates,
};

export default DocumentTemplateService;
