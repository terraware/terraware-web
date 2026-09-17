import React, { type JSX, useEffect, useMemo, useState } from 'react';

import Page from 'src/components/Page';
import { useOrganization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { OrganizationUserService } from 'src/services';
import { OrganizationUser } from 'src/types/User';
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
  const [people, setPeople] = useState<OrganizationUser[]>();
  const [peopleOrgId, setPeopleOrgId] = useState<number>();

  useEffect(() => {
    if (!selectedOrganization) {
      return;
    }
    const orgId = selectedOrganization.id;
    let cancelled = false;
    const populatePeople = async () => {
      let users: OrganizationUser[] | undefined;
      if (isAdmin(selectedOrganization)) {
        const response = await OrganizationUserService.getOrganizationUsers(orgId);
        if (response.requestSucceeded) {
          users = response.users;
        }
      }
      if (!cancelled) {
        setPeople(users);
        setPeopleOrgId(orgId);
      }
    };
    void populatePeople();
    return () => {
      cancelled = true;
    };
  }, [selectedOrganization]);

  const homeScreen = useMemo((): JSX.Element => {
    const peopleLoaded = peopleOrgId === selectedOrganization?.id;

    if (orgHasModules === undefined || speciesLoading || !peopleLoaded) {
      return <Page isLoading={true} />;
    }

    if (!orgHasModules && ((people?.length === 1 && !orgPreferences.singlePersonOrg) || !selectedOrgHasSpecies())) {
      return <OnboardingHomeView />;
    } else {
      return orgHasModules && isManagerOrHigher(selectedOrganization) ? <ParticipantHomeView /> : <TerrawareHomeView />;
    }
  }, [orgHasModules, speciesLoading, peopleOrgId, people, selectedOrgHasSpecies, selectedOrganization, orgPreferences]);

  return homeScreen;
}
