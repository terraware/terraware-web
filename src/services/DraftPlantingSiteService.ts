import {
  CreateDraftPlantingSiteRequestPayload,
  DraftPlantingSite,
  GetDraftPlantingSiteResponsePayload,
  UpdateDraftPlantingSiteRequestPayload,
} from 'src/types/PlantingSite';
import { SearchNodePayload, SearchRequestPayload, SearchSortOrder } from 'src/types/Search';
import { PlantingSiteSearchResult } from 'src/types/Tracking';
import { isArray } from 'src/types/utils';
import { fromDraft, toDraft } from 'src/utils/draftPlantingSiteUtils';

import HttpService, { Response } from './HttpService';
import SearchService from './SearchService';

const DRAFT_PLANTING_SITES_ENDPOINT = '/api/v1/tracking/draftSites';
const DRAFT_PLANTING_SITE_ENDPOINT = '/api/v1/tracking/draftSites/{id}';

const httpDrafts = HttpService.root(DRAFT_PLANTING_SITES_ENDPOINT);
const httpDraft = HttpService.root(DRAFT_PLANTING_SITE_ENDPOINT);

export type CreateDraftPlantingSiteResponse = Response & {
  draftId: number | null;
};

export type DraftPlantingSiteData = {
  site?: DraftPlantingSite;
};

export type GetDraftPlantingSiteResponse = Response & DraftPlantingSiteData;

/**
 * Create a draft
 */
const createDraftPlantingSite = async (draft: DraftPlantingSite): Promise<CreateDraftPlantingSiteResponse> => {
  const { ...entity }: CreateDraftPlantingSiteRequestPayload = fromDraft(draft);

  const serverResponse: Response = await httpDrafts.post({ entity });

  const response: CreateDraftPlantingSiteResponse = {
    ...serverResponse,
    draftId: serverResponse.data?.id ?? null,
  };

  return response;
};

/**
 * Get a draft
 */
const getDraftPlantingSite = (id: number): Promise<GetDraftPlantingSiteResponse> =>
  httpDraft.get<GetDraftPlantingSiteResponsePayload, DraftPlantingSiteData>(
    {
      urlReplacements: {
        '{id}': `${id}`,
      },
    },
    (data) => ({ site: data?.site ? toDraft(data.site) : undefined })
  );

/**
 * Update a draft site
 */
const updateDraftPlantingSite = (draft: DraftPlantingSite): Promise<Response> => {
  const { ...entity }: UpdateDraftPlantingSiteRequestPayload = fromDraft(draft);

  return httpDraft.put({
    entity,
    urlReplacements: {
      '{id}': `${draft.id}`,
    },
  });
};

/**
 * Delete a draft site
 */
const deleteDraftPlantingSite = (id: number): Promise<Response> =>
  httpDraft.delete({
    urlReplacements: {
      '{id}': `${id}`,
    },
  });

/**
 * Search draft sites, returns basic info without geometries
 */
const searchDraftPlantingSites = async (
  organizationId: number,
  searchField?: SearchNodePayload | SearchNodePayload[],
  sortOrder?: SearchSortOrder
): Promise<PlantingSiteSearchResult[] | null> => {
  const params: SearchRequestPayload = {
    prefix: 'draftPlantingSites',
    fields: [
      'description',
      'id',
      'name',
      'numStrata',
      'numStrata(raw)',
      'numSubstrata',
      'numSubstrata(raw)',
      'project_id',
      'project_name',
      'timeZone',
    ],
    sortOrder: sortOrder ? [sortOrder] : [{ field: 'name', direction: 'Ascending' }],
    search: {
      operation: 'and',
      children: [
        {
          field: 'organization_id',
          operation: 'field',
          values: [organizationId],
        },
      ],
    },
    count: 0,
  };

  if (searchField) {
    if (isArray(searchField)) {
      for (const field of searchField) {
        params.search.children.push(field);
      }
    } else {
      params.search.children.push(searchField);
    }
  }

  const response = await SearchService.search(params);

  return response ? (response.map((site) => ({ ...site, isDraft: true })) as PlantingSiteSearchResult[]) : null;
};

/**
 * Basic CRUD and search
 */
export {
  createDraftPlantingSite,
  deleteDraftPlantingSite,
  getDraftPlantingSite,
  searchDraftPlantingSites,
  updateDraftPlantingSite,
};
