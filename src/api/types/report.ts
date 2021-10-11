import { paths } from './generated-schema';

export const reportEndpoint = '/api/v1/seedbank/search/export';
export type SearchExportPostRequestBody = paths[typeof reportEndpoint]['post']['requestBody']['content']['application/json'];
export type SearchExportPostResponse = paths[typeof reportEndpoint]['post']['responses'][200]['content']['text/csv'];
