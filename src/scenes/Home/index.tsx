import React, { type JSX, useMemo } from 'react';

import { skipToken } from '@reduxjs/toolkit/query';

import Page from 'src/components/Page';
import { useOrganization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useListOrganizationUsersQuery } from 'src/queries/generated/organizationUsers';
import { isManagerOrHigher } from 'src/utils/organization';
import { isAdmin } from 'src/utils/organization';

import OnboardingHomeView from './OnboardingHomeView';
import ParticipantHomeView from './ParticipantHomeView';
import TerrawareHomeView from './TerrawareHomeView';

export default function Home({
  selectedOrgHasSpecies,
  speciesLoading,
}: {
  selectedOrgHasSpecies: () => boolean;
  speciesLoading: boolean;
}): JSX.Element {
  const { orgHasModules } = useParticipantData();
  const { selectedOrganization, orgPreferences } = useOrganization();
  const isOrgAdmin = isAdmin(selectedOrganization);
  const { currentData: peopleData, isError: peopleFailed } = useListOrganizationUsersQuery(
    isOrgAdmin ? selectedOrganization.id : skipToken
  );
  const people = peopleData?.users;

  const homeScreen = useMemo((): JSX.Element => {
    const peopleLoaded = !isOrgAdmin || people !== undefined || peopleFailed;

    if (orgHasModules === undefined || speciesLoading || !peopleLoaded) {
      return <Page isLoading={true} />;
    }

    if (!orgHasModules && ((people?.length === 1 && !orgPreferences.singlePersonOrg) || !selectedOrgHasSpecies())) {
      return <OnboardingHomeView />;
    } else {
      return orgHasModules && isManagerOrHigher(selectedOrganization) ? <ParticipantHomeView /> : <TerrawareHomeView />;
    }
  }, [
    orgHasModules,
    speciesLoading,
    isOrgAdmin,
    people,
    peopleFailed,
    selectedOrgHasSpecies,
    selectedOrganization,
    orgPreferences,
  ]);

  return homeScreen;
}
