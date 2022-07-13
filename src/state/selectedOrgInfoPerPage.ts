import { atom } from 'recoil';
import { SelectedOrgInfo } from 'src/types/Organization';

export const seedsSummarySelectedOrgInfo = atom<SelectedOrgInfo>({
  key: 'seedSummarySelectedOrgInfo',
  default: {
    selectedFacility: undefined,
  },
});

export const seedsDatabaseSelectedOrgInfo = atom<SelectedOrgInfo>({
  key: 'seedsDatabaseSelectedOrgInfo',
  default: {
    selectedFacility: undefined,
  },
});

export const plantDashboardSelectedOrgInfo = atom<SelectedOrgInfo>({
  key: 'plantDashboardSelectedOrgInfo',
  default: {
    selectedFacility: undefined,
  },
});

export const plantListSelectedOrgInfo = atom<SelectedOrgInfo>({
  key: 'plantListSelectedOrgInfo',
  default: {
    selectedFacility: undefined,
  },
});

export const checkInSelectedOrgInfo = atom<SelectedOrgInfo>({
  key: 'checkInSelectedOrgInfo',
  default: {
    selectedFacility: undefined,
  },
});
