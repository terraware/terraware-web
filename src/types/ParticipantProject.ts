import { CohortPhaseType } from './Cohort';
import { VoteOption } from './Votes';

// These will all change when the BE is done, some of the props might even come from different models
export type ParticipantProject = {
  country: string;
  createdBy: string;
  createdTime: string;
  dealDescription: string;
  dealStage: string;
  id: number;
  investmentThesis: string;
  failureRisk: string;
  landUseModelType: string;
  maximumCarbonAccumulation: number;
  minimumCarbonAccumulation: number;
  modifiedBy: string;
  modifiedTime: string;
  name: string;
  numberOfNativeSpecies: number;
  organizationName: string;
  perHectareEstimatedBudget?: number;
  phase1Score: number;
  pipeline: string;
  previousProjectCost?: number;
  projectHectares: number;
  region: string;
  restorableLand: number;
  shapeFileUrl: string;
  totalExpansionPotential: number;
  votingDecision: VoteOption;
  whatNeedsToBeTrue: string;
};

export type ParticipantProjectSearchResult = {
  cohortId: number;
  cohortName: string;
  country: string;
  id: number;
  landUseModelType: string;
  name: string;
  participantName: string;
  phase: CohortPhaseType;
  region: string;
  restorableLand: number;
};
