import { MRT_ColumnFiltersState } from 'material-react-table';

import { conservationCategories, ecosystemTypes, growthForms, storageBehaviors } from 'src/types/Species';

import { NATIVITY_VALUES } from './SpeciesCheck/types';

const validValues: Record<string, string[]> = {
  rare: ['Yes', 'No'],
  status: [...NATIVITY_VALUES, 'Not Set'],
  conservationCategory: conservationCategories().map(({ value }) => value),
  growthForms: growthForms(null).map(({ value }) => value),
  ecosystemTypes: ecosystemTypes().map(({ value }) => value),
  seedStorageBehavior: storageBehaviors().map(({ value }) => value),
};

const normalizeSpeciesColumnFilters = (filters: MRT_ColumnFiltersState): MRT_ColumnFiltersState =>
  filters.filter(({ id, value }) => {
    const allowed = validValues[id];
    if (!allowed) {
      return true;
    }
    const values = Array.isArray(value) ? value : [value];
    return values.every((entry) => typeof entry === 'string' && allowed.includes(entry));
  });

export default normalizeSpeciesColumnFilters;
