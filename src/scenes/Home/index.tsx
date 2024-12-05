import React, { useEffect, useMemo, useState } from 'react';

import Page from 'src/components/Page';
import { useOrganization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { OrganizationUserService } from 'src/services';
import { SpeciesService } from 'src/services';
import { Species } from 'src/types/Species';
import { OrganizationUser } from 'src/types/User';
import { isManagerOrHigher } from 'src/utils/organization';

import OnboardingHomeView from './OnboardingHomeView';
import ParticipantHomeView from './ParticipantHomeView';
import TerrawareHomeView from './TerrawareHomeView';

export default function Home(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { orgHasModules } = useParticipantData();
  const [people, setPeople] = useState<OrganizationUser[]>();
  const [allSpecies, setAllSpecies] = useState<Species[]>();

  useEffect(() => {
    const populatePeople = async () => {
      const response = await OrganizationUserService.getOrganizationUsers(selectedOrganization.id);
      if (response.requestSucceeded) {
        setPeople(response.users);
      }
    };
    populatePeople();
  }, [selectedOrganization]);

  useEffect(() => {
    const populateSpecies = async () => {
      const response = await SpeciesService.getAllSpecies(selectedOrganization.id);
      if (response.requestSucceeded) {
        setAllSpecies(response.species);
      }
    };

    void populateSpecies();
  }, [selectedOrganization.id]);

  const homeScreen = useMemo((): JSX.Element => {
    if (orgHasModules === undefined || people === undefined || allSpecies === undefined) {
      return <Page isLoading={true} />;
    }

    if (people.length === 1 || allSpecies.length === 0) {
      return <OnboardingHomeView />;
    } else {
      return orgHasModules && isManagerOrHigher(selectedOrganization) ? <ParticipantHomeView /> : <TerrawareHomeView />;
    }
  }, [orgHasModules, people, allSpecies, selectedOrganization]);

  return homeScreen;
}
