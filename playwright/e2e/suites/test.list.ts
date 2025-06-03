import { test } from '@playwright/test';

import AccessionTests from './accession.spec';
import FunderProjectProfileTests from './funderProjectProfile.spec';
import FundingEntitiesTests from './fundingEntities.spec';
import InventoryTests from './inventory.spec';
import LocationTests from './locations.spec';
import ParticipantPlantsDashbordTests from './participantPlantsDashboard.spec';
import PlantsDashbordTests from './plantsDashboard.spec';
import ProjectProfileTests from './projectProfile.spec';
import SpeciesTests from './species.spec';

test.describe(LocationTests);
test.describe(SpeciesTests);
test.describe(AccessionTests);
test.describe(InventoryTests);
test.describe(ProjectProfileTests);
test.describe(FundingEntitiesTests);
test.describe(FunderProjectProfileTests);
test.describe(PlantsDashbordTests);
test.describe(ParticipantPlantsDashbordTests);
