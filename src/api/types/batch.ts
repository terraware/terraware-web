import { paths } from './generated-schema';
const BATCHES = '/api/v1/nursery/batches';

export type Batch = paths[typeof BATCHES]['post']['responses'][200]['content']['application/json']['batch'];

export type CreateBatchRequestPayload = paths[typeof BATCHES]['post']['requestBody']['content']['application/json'];
