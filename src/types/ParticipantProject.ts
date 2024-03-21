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
  totalExpansionPotential: number;
  votingDecision: string;
  whatNeedsToBeTrue: string;
};
