import React, { useEffect, useMemo, useState } from 'react';

import Page from 'src/components/Page';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useOrganization } from 'src/providers/hooks';
import { OrganizationUserService } from 'src/services';
import { OrganizationUser } from 'src/types/User';

import OnboardingHomeView from './OnboardingHomeView';
import ParticipantHomeView from './ParticipantHomeView';
import TerrawareHomeView from './TerrawareHomeView';

export default function Home(): JSX.Element {
  const { orgHasModules } = useParticipantData();
  const { selectedOrganization } = useOrganization();
  const [people, setPeople] = useState<OrganizationUser[]>();

  useEffect(() => {
    const populatePeople = async () => {
      const response = await OrganizationUserService.getOrganizationUsers(selectedOrganization.id);
      if (response.requestSucceeded) {
        setPeople(response.users);
      }
    };
    populatePeople();
  }, [selectedOrganization]);

  const homeScreen = useMemo((): JSX.Element => {
    if (orgHasModules === undefined || people === undefined) {
      return <Page isLoading={true} />;
    }
    if (people.length === 1) {
      console.log(people.length);
      return <OnboardingHomeView />;
    } else {
      //console.log(people.length);
      return orgHasModules ? <ParticipantHomeView /> : <TerrawareHomeView />;
    }
  }, [orgHasModules]);

  return homeScreen;
}
