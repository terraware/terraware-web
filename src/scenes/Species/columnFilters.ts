import { MRT_ColumnFiltersState } from 'material-react-table';

// Labels written by earlier versions of the table must remain readable after a language change.
const legacyValues: Record<string, Record<string, string>> = {
  rare: { Yes: 'Yes', No: 'No', Sí: 'Yes', Oui: 'Yes', Non: 'No' },
  status: {
    Nativo: 'Native',
    Indigène: 'Native',
    Introducido: 'Introduced',
    Introduit: 'Introduced',
    Invasiva: 'Invasive',
    Desconocido: 'Unknown',
    Inconnu: 'Unknown',
    'Not set': 'Not Set',
    'No establecido': 'Not Set',
    'Non défini': 'Not Set',
  },
};

const normalizeSpeciesColumnFilters = (filters: MRT_ColumnFiltersState): MRT_ColumnFiltersState =>
  filters.map((filter) => {
    if (typeof filter.value !== 'string') {
      return filter;
    }
    const value =
      filter.id === 'conservationCategory'
        ? (filter.value.match(/\(([A-Z]{2})\)$/)?.[1] ?? filter.value)
        : (legacyValues[filter.id]?.[filter.value] ?? filter.value);
    return value === filter.value ? filter : { ...filter, value };
  });

export default normalizeSpeciesColumnFilters;
