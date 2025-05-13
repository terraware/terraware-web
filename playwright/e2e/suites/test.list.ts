import { test } from '@playwright/test';

import AccessionTests from './accession.spec';
import InventoryTests from './inventory.spec';
import LocationTests from './locations.spec';
import SpeciesTests from './species.spec';
import ProjectProfileTests from './projectProfile.spec';

test.describe(LocationTests);
test.describe(SpeciesTests);
test.describe(AccessionTests);
test.describe(InventoryTests);
test.describe(ProjectProfileTests);
