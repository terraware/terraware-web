import { test } from '@playwright/test';

import AccessionTests from './accession.spec';
import FunderProjectProfileTests from './funderProjectProfile.spec';
import FundingEntitiesTests from './fundingEntities.spec';
import InventoryTests from './inventory.spec';
import LocationTests from './locations.spec';
import ParticipantPlantsDashboardTests from './participantPlantsDashboard.spec';
import PlantsDashboardTests from './plantsDashboard.spec';
import ProjectDeliverablesTests from './projectDeliverables.spec';
import ProjectDocumentsTests from './projectDocuments.spec';
import ProjectProfileTests from './projectProfile.spec';
import ProjectVariablesTests from './projectVariables.spec';
import SpeciesTests from './species.spec';

test.describe(LocationTests);
test.describe(SpeciesTests);
test.describe(AccessionTests);
test.describe(InventoryTests);
test.describe(ProjectProfileTests);
test.describe(FundingEntitiesTests);
test.describe(FunderProjectProfileTests);
test.describe(PlantsDashboardTests);
test.describe(ProjectDeliverablesTests);
test.describe(ProjectDocumentsTests);
test.describe(ProjectVariablesTests);
test.describe(ParticipantPlantsDashboardTests);
