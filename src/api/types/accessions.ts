import { paths } from './generated-schema';

export const accessionEndpoint = '/api/v1/seedbank/accession/{id}';
export type AccessionGetResponse =
  paths[typeof accessionEndpoint]['get']['responses'][200]['content']['application/json'];
export type AccessionPutRequestBody =
  paths[typeof accessionEndpoint]['put']['requestBody']['content']['application/json'];
export type AccessionActive = AccessionGetResponse['accession']['active'];
export type AccessionState = AccessionGetResponse['accession']['state'];
export type AccessionWithdrawal = Required<AccessionGetResponse['accession']>['withdrawals'][0];

export const postAccessionEndpoint = '/api/v1/seedbank/accession';
export type AccessionPostRequestBody =
  paths[typeof postAccessionEndpoint]['post']['requestBody']['content']['application/json'];
export type AccessionPostResponse =
  paths[typeof postAccessionEndpoint]['post']['responses'][200]['content']['application/json'];

export const photoEndpoint = '/api/v1/seedbank/accession/{id}/photo/{photoFilename}';

export const checkInEndpoint = '/api/v1/seedbank/accession/{id}/checkIn';

export type Accession = AccessionGetResponse['accession'];
