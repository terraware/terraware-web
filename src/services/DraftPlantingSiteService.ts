import HttpService, { Response } from './HttpService';
import {
  CreateDraftPlantingSiteRequestPayload,
  DraftPlantingSite,
  GetDraftPlantingSiteResponsePayload,
  UpdateDraftPlantingSiteRequestPayload,
} from 'src/types/PlantingSite';
import { fromDraft, toDraft } from 'src/utils/draftPlantingSiteUtils';

const DRAFT_PLANTING_SITES_ENDPOINT = '/api/v1/draftSites';
const DRAFT_PLANTING_SITE_ENDPOINT = '/api/v1/draftSites/{id}';

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
    (data) => ({ site: data?.site ? toDraft(data!.site) : undefined })
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
 * Basic CRUD and search
 */
export { createDraftPlantingSite, deleteDraftPlantingSite, getDraftPlantingSite, updateDraftPlantingSite };
