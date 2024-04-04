import { AcceleratorOrg } from 'src/types/Accelerator';
import { ParticipantProject } from 'src/types/ParticipantProject';
import { Project, ProjectMeta } from 'src/types/Project';
import { PhaseScores } from 'src/types/Score';
import { PhaseVotes } from 'src/types/Votes';

import { ParticipantProjectService } from '..';

jest.mock('src/strings', () => {
  const actual = jest.requireActual('src/strings');

  return {
    ...actual,
    ORGANIZATION_NAME: 'Organization Name',
    PROJECT_ID: 'Project ID',
    PROJECT_NAME: 'Project Name',
    PHASE_1_SCORE: 'Phase 1 Score',
    VOTING_DECISION: 'Voting Decision',
    FILE_NAMING: 'File Naming',
    PROJECT_LEAD: 'Project Lead',
    COUNTRY: 'Country',
    REGION: 'Region',
    LAND_USE_MODEL_TYPE: 'Land Use Model Type',
    NUMBER_OF_NATIVE_SPECIES: 'Number of Native Species',
    APPLICATION_RESTORABLE_LAND: 'Application Restorable Land (ha)',
    CONFIRMED_RESTORABLE_LAND: 'Confirmed Restorable Land (ha)',
    TOTAL_EXPANSION_POTENTIAL: 'Total Expansion Potential (ha)',
    MINIMUM_CARBON_ACCUMULATION: 'Minimum Carbon Accumulation (CO2/ha/yr)',
    MAXIMUM_CARBON_ACCUMULATION: 'Maximum Carbon Accumulation (CO2/ha/yr)',
    PER_HECTARE_ESTIMATED_BUDGET: 'Per Hectare Estimated Budget',
    NUMBER_OF_COMMUNITIES_WITHIN_PROJECT_AREA: 'Number of Communities Within Project Area',
    CREATED_ON: 'Created on',
    CREATED_BY: 'Created by',
    LAST_MODIFIED_ON: 'Last modified on',
    LAST_MODIFIED_BY: 'Last modified by',
  };
});

describe('ParticipantProjectService', () => {
  it('should export the data as expected', async () => {
    const participantProject: ParticipantProject = {
      applicationReforestableLand: undefined,
      confirmedReforestableLand: undefined,
      countryCode: 'AF',
      dealDescription: 'Great deal',
      dealStage: undefined,
      failureRisk: undefined,
      fileNaming: 'PROJ_123',
      investmentThesis: undefined,
      landUseModelTypes: ['Monoculture', 'Other Timber'],
      maxCarbonAccumulation: undefined,
      minCarbonAccumulation: undefined,
      numCommunities: undefined,
      numNativeSpecies: undefined,
      perHectareBudget: undefined,
      pipeline: undefined,
      projectId: 1,
      projectLead: 'test lead',
      region: 'South Asia',
      totalExpansionPotential: undefined,
      whatNeedsToBeTrue: undefined,
    };
    const phase1Scores: PhaseScores = {
      phase: 'Phase 1 - Feasibility Study',
      scores: [
        {
          category: 'Carbon',
          modifiedTime: '2024-03-20T15:21:46.208342Z',
          qualitative: 'Yes, it sequesters carbon',
          value: 2,
        },
        {
          category: 'Climate Impact',
          modifiedTime: '2024-03-19T21:20:27.910470Z',
          qualitative: 'Excellent',
          value: 2,
        },
      ],
      totalScore: 2,
    };
    const phaseVotes: PhaseVotes = {
      decision: 'Yes',
      phase: 'Phase 1 - Feasibility Study',
      votes: [
        {
          conditionalInfo: 'Excellent stuff',
          email: 'weese@terraformation.com',
          firstName: 'Weese',
          lastName: 'Ritherspoon',
          userId: 2,
          voteOption: 'Yes',
        },
      ],
    };
    const project: Project = {
      createdBy: 2,
      createdTime: '2024-03-08T21:30:27.294915Z',
      id: 1,
      modifiedBy: 2,
      modifiedTime: '2024-03-29T17:41:09.530803Z',
      name: 'Project "1234"',
      organizationId: 1,
    };
    const projectId = 1;
    const projectMeta: ProjectMeta = {
      createdByUserName: 'Weese Ritherspoon',
      modifiedByUserName: 'Donny Jepp',
    };
    const organization: AcceleratorOrg = {
      id: 1,
      name: 'The tree farm',
      projects: [
        {
          id: 2,
          name: 'Project 2',
        },
      ],
    };

    const result = await ParticipantProjectService.download({
      participantProject,
      phase1Scores,
      phaseVotes,
      project,
      projectId,
      projectMeta,
      organization,
    });

    const expected =
      `Organization Name,Project ID,Project Name,Phase 1 Score,Voting Decision,File Naming,Project Lead,Country,Region,Land Use Model Type,Number of Native Species,Application Restorable Land,Confirmed Restorable Land,Total Expansion Potential (ha),Minimum Carbon Accumulation (CO2/ha/yr),Maximum Carbon Accumulation (CO2/ha/yr),Per Hectare Estimated Budget,Number of Communities Within Project Area,Created on,Created by,Last modified on,Last modified by\r` +
      `"The tree farm","1","Project ""1234""","2","Yes","PROJ_123","test lead","AF","South Asia","Monoculture, Other Timber","","","","","","","","","2024-03-08T21:30:27.294915Z","Weese Ritherspoon","2024-03-29T17:41:09.530803Z","Donny Jepp"\r`;
    expect(result).toBe(expected);
  });
});
