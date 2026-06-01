import { paths } from 'src/api/types/generated-schema';

import HttpService, { Response } from './HttpService';

/**
 * Seed bank related services.
 *
 * The rest of the accession/photo/upload endpoints have been migrated to RTK Query:
 *   - src/queries/search/accessions.ts (search-based queries)
 *   - src/queries/generated/accessionsV1.ts (v1 endpoints incl. photos)
 *   - src/queries/generated/accessionsV2.ts (v2 endpoints incl. createAccession, uploads)
 *
 * Only `getSummary` remains here because the `/api/v1/seedbank/summary` endpoint
 * is not yet in the RTK Query codegen.
 */

const SUMMARY_ENDPOINT = '/api/v1/seedbank/summary';

export type SeedBankSummary = paths[typeof SUMMARY_ENDPOINT]['get']['responses'][200]['content']['application/json'];
export type Summary = {
  value?: SeedBankSummary;
};
export type SummaryResponse = Response & Summary;

const getSummary = async (organizationId: number): Promise<SummaryResponse> => {
  const response: SummaryResponse = await HttpService.root(SUMMARY_ENDPOINT).get<SeedBankSummary, Summary>(
    {
      params: {
        organizationId: organizationId.toString(),
      },
    },
    (data) => ({ value: data })
  );

  return response;
};

const SeedBankService = {
  getSummary,
};

export default SeedBankService;
