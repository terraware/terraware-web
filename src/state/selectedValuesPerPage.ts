import { atom } from 'recoil';
import { Facility } from 'src/api/types/facilities';
import { Project, Site } from 'src/types/Organization';

export interface SelectedValues {
  selectedProject?: Project;
  selectedSite?: Site;
  selectedFacility?: Facility;
}

export const seedsSummarySelectedValues = atom<SelectedValues>({
  key: 'seedSummarySelectedValues',
  default: {
    selectedFacility: undefined,
    selectedSite: undefined,
    selectedProject: undefined,
  },
});

export const seedsDatabaseSelectedValues = atom<SelectedValues>({
  key: 'seedsDatabaseSelectedValues',
  default: {
    selectedFacility: undefined,
    selectedSite: undefined,
    selectedProject: undefined,
  },
});

export const plantDashboardSelectedValues = atom<SelectedValues>({
  key: 'plantDashboardSelectedValues',
  default: {
    selectedFacility: undefined,
    selectedSite: undefined,
    selectedProject: undefined,
  },
});

export const plantListSelectedValues = atom<SelectedValues>({
  key: 'plantListSelectedValues',
  default: {
    selectedFacility: undefined,
    selectedSite: undefined,
    selectedProject: undefined,
  },
});

export const checkInSelectedValues = atom<SelectedValues>({
  key: 'checkInSelectedValues',
  default: {
    selectedFacility: undefined,
    selectedSite: undefined,
    selectedProject: undefined,
  },
});
