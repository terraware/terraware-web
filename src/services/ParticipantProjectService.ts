import { Response2 } from 'src/services/HttpService';
import { ParticipantProject, ParticipantProjectSearchResult } from 'src/types/ParticipantProject';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchOrderConfig, searchAndSort } from 'src/utils/searchAndSort';

/**
 * Accelerator "participant project" related services
 */

export type ParticipantProjectsData = {
  projects: ParticipantProject[];
};

export type ParticipantProjectData = {
  project: ParticipantProject;
};

export type ParticipantProjectSearchData = {
  projects: ParticipantProjectSearchResult[];
};

let mockParticipantProject: ParticipantProject = {
  country: 'Tunisia',
  createdBy: 'Weese Ritherspoon',
  createdTime: '2024-03-02',
  dealDescription:
    'PT Solusi Alam Indonesia (SAI) is a for-profit company that focuses on sustainable land-based business activities in Indonesia. Their objective in joining the Accelerator is to find funders for a forest carbon project',
  dealStage: 'Phase 1',
  id: 1,
  investmentThesis:
    'A relatively large project for this cohort, with potential for high carbon gains given the vegetation type (mangrove, peatland forest, and tropical rainforest) but likely the most logistically challenging site given the island’s',
  failureRisk:
    'The largest risk may be that SAI or the local community decides that they can get a better deal from another developer (they are eager to receive carbon revenue after a failed past experience with South Pole).',
  landUseModelType: 'Native Forest',
  maximumCarbonAccumulation: 400,
  minimumCarbonAccumulation: 200,
  modifiedBy: 'Weese Ritherspoon',
  modifiedTime: '2024-04-01',
  name: 'Andromeda',
  numberOfNativeSpecies: 2433,
  organizationName: 'Treemendo.us',
  perHectareEstimatedBudget: undefined,
  phase1Score: 0.5,
  pipeline: 'Accelerator Projects',
  previousProjectCost: undefined,
  projectHectares: 321,
  region: 'Europe & Central Asia',
  restorableLand: 432,
  shapeFileUrl: 'https://placekitten.com/900/600',
  totalExpansionPotential: 400,
  votingDecision: 'No',
  whatNeedsToBeTrue:
    'SAI and the local community will need to like the carbon estimates and deal arrangement that TF offers. Our estimates of reforestable area and carbon will need to be roughly true when ground-truthed). The larger project',
};

const download = async (participantProjectId: number): Promise<string | null> => {
  return `Id,Project Name,Phase 1 Score\r${participantProjectId},Andromeda,0.5\r`;
};

const get = async (participantProjectId: number): Promise<Response2<ParticipantProjectData>> => {
  return {
    requestSucceeded: true,
    data: {
      project: mockParticipantProject,
    },
  };
};

const downloadList = async (search?: SearchNodePayload, sortOrder?: SearchSortOrder): Promise<string | null> => {
  return (
    'Project Name,Participant,Cohort,Phase,Country,Region,Restorable Land,Land Use Model Type\r' +
    'Andromeda,Cartwheel,Cohort 1,Phase 0 - Due Diligence,Ghana,Sub-Saharan Africa,500,Native Forest'
  );
};

const list = async (
  // TODO: remove locale if we are using BE search API
  locale?: string | null,
  search?: SearchNodePayload,
  sortOrder?: SearchSortOrder
): Promise<Response2<ParticipantProjectSearchData>> => {
  let searchOrderConfig: SearchOrderConfig | undefined;

  if (locale && sortOrder) {
    searchOrderConfig = {
      locale,
      sortOrder,
      numberFields: ['id', 'cohortId', 'restorableLand'],
    };
  }

  return {
    requestSucceeded: true,
    data: {
      projects: searchAndSort(
        [
          {
            cohortId: 1,
            cohortName: 'Cohort 1',
            country: 'Ghana',
            id: 1,
            landUseModelType: 'Native Forest',
            name: 'Andromeda',
            participantName: 'Cartwheel',
            phase: 'Phase 0 - Due Diligence',
            region: 'Sub-Saharan Africa',
            restorableLand: 500,
          },
          {
            cohortId: 2,
            cohortName: 'Cohort 2',
            country: 'Philippines',
            id: 2,
            landUseModelType: 'Native Forest',
            name: 'Platypuses',
            participantName: 'Canis Major Dwarf',
            phase: 'Phase 1 - Feasibility Study',
            region: 'East Asia & Pacific',
            restorableLand: 900,
          },
          {
            cohortId: 3,
            cohortName: 'Cohort 3',
            country: 'Brazil',
            id: 3,
            landUseModelType: 'Native Forest',
            name: 'Quokkas',
            participantName: 'Cosmos Redshift 7',
            phase: 'Phase 2 - Plan and Scale',
            region: 'Latin America & Caribbean',
            restorableLand: 990,
          },
        ],
        search,
        searchOrderConfig
      ),
    },
  };
};

const update = async (participantProject: ParticipantProject): Promise<Response2<number>> => {
  mockParticipantProject = {
    ...mockParticipantProject,
    ...participantProject,
  };

  return {
    requestSucceeded: true,
    data: participantProject.id,
  };
};

const ParticipantProjectsService = {
  download,
  downloadList,
  get,
  list,
  update,
};

export default ParticipantProjectsService;
