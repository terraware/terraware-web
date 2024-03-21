import { test } from '@playwright/test';

import AccessionTests from './accession.spec.ts';
import InventoryTests from './inventory.spec.ts';
import LocationTests from './locations.spec.ts';
import SpeciesTests from './species.spec.ts';

test.describe(LocationTests);
test.describe(SpeciesTests);
test.describe(AccessionTests);
test.describe(InventoryTests);
