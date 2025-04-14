import { useContext } from 'react';

import { ProjectContext } from './Project/ProjectContext';
import {
  FundingEntityContext,
  LocalizationContext,
  OrganizationContext,
  UserContext,
  UserFundingEntityContext,
} from './contexts';

export const useOrganization = () => useContext(OrganizationContext);

export const useTimeZones = () => useContext(LocalizationContext).supportedTimeZones;

export const useLocalization = () => useContext(LocalizationContext);

export const useUser = () => useContext(UserContext);

export const useProject = () => useContext(ProjectContext);

export const useUserFundingEntity = () => useContext(UserFundingEntityContext);

export const useFundingEntity = () => useContext(FundingEntityContext);
