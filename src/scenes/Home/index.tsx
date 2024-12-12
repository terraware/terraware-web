import React, { useEffect, useMemo, useState } from 'react';

import Page from 'src/components/Page';
import isEnabled from 'src/features';
import { useOrganization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { OrganizationUserService } from 'src/services';
import { OrganizationUser } from 'src/types/User';
import { isManagerOrHigher } from 'src/utils/organization';
import { isAdmin } from 'src/utils/organization';

import OnboardingHomeView from './OnboardingHomeView';
import ParticipantHomeView from './ParticipantHomeView';
import TerrawareHomeView from './TerrawareHomeView';

export default function Home(): JSX.Element {
  const { orgHasModules } = useParticipantData();
  const { selectedOrganization, orgPreferences } = useOrganization();
  const [people, setPeople] = useState<OrganizationUser[]>();
  const allSpecies = useAppSelector(selectSpecies);
  const dispatch = useAppDispatch();
  const homePageOnboardingImprovementsEnabled = isEnabled('Home Page Onboarding Improvements');

  useEffect(() => {
    const populatePeople = async () => {
      if (isAdmin(selectedOrganization)) {
        const response = await OrganizationUserService.getOrganizationUsers(selectedOrganization.id);
        if (response.requestSucceeded) {
          setPeople(response.users);
        }
      }
    };
    populatePeople();
  }, [selectedOrganization]);

  useEffect(() => {
    if (!allSpecies && selectedOrganization.id !== -1) {
      dispatch(requestSpecies(selectedOrganization.id));
    }
  }, [allSpecies, selectedOrganization]);

  const homeScreen = useMemo((): JSX.Element => {
    if (orgHasModules === undefined || allSpecies === undefined) {
      return <Page isLoading={true} />;
    }

    if (
      homePageOnboardingImprovementsEnabled &&
      ((people?.length === 1 && !orgPreferences['singlePersonOrg']) || allSpecies.length === 0)
    ) {
      return <OnboardingHomeView />;
    } else {
      return orgHasModules && isManagerOrHigher(selectedOrganization) ? <ParticipantHomeView /> : <TerrawareHomeView />;
    }
  }, [orgHasModules, people, allSpecies, selectedOrganization, orgPreferences]);

  return homeScreen;
}
