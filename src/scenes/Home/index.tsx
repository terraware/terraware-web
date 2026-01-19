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

export default function Home({ selectedOrgHasSpecies }: { selectedOrgHasSpecies: () => boolean }): JSX.Element {
  const { orgHasModules } = useParticipantData();
  const { selectedOrganization, orgPreferences } = useOrganization();
  const [people, setPeople] = useState<OrganizationUser[]>();

  useEffect(() => {
    const populatePeople = async () => {
      if (isAdmin(selectedOrganization)) {
        const response = await OrganizationUserService.getOrganizationUsers(selectedOrganization.id);
        if (response.requestSucceeded) {
          setPeople(response.users);
        }
      }
    };
    void populatePeople();
  }, [selectedOrganization]);

  const homeScreen = useMemo((): JSX.Element => {
    if (orgHasModules === undefined) {
      return <Page isLoading={true} />;
    }

    if (!orgHasModules && ((people?.length === 1 && !orgPreferences.singlePersonOrg) || !selectedOrgHasSpecies())) {
      return <OnboardingHomeView />;
    } else {
      return orgHasModules && isManagerOrHigher(selectedOrganization) ? <ParticipantHomeView /> : <TerrawareHomeView />;
    }
  }, [orgHasModules, people, selectedOrgHasSpecies, selectedOrganization, orgPreferences]);

  return homeScreen;
}
