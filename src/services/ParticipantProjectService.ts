import { Response2 } from 'src/services/HttpService';
import { ParticipantProject } from 'src/types/ParticipantProject';

/**
 * Accelerator "participant project" related services
 */

export type ParticipantProjectsData = {
  projects: ParticipantProject[];
};

export type ParticipantProjectData = {
  project: ParticipantProject;
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

const get = async (participantProjectId: number): Promise<Response2<ParticipantProjectData>> => {
  return {
    requestSucceeded: true,
    data: {
      project: mockParticipantProject,
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

const ParticipantsService = {
  get,
  update,
};

export default ParticipantsService;
