import React, { useMemo } from 'react';

import Page from 'src/components/Page';
import { useOrganization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { isManagerOrHigher } from 'src/utils/organization';

import ParticipantHomeView from './ParticipantHomeView';
import TerrawareHomeView from './TerrawareHomeView';

export default function Home(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { orgHasModules } = useParticipantData();

  const homeScreen = useMemo((): JSX.Element => {
    if (orgHasModules === undefined) {
      return <Page isLoading={true} />;
    }
    return orgHasModules && isManagerOrHigher(selectedOrganization) ? <ParticipantHomeView /> : <TerrawareHomeView />;
  }, [orgHasModules]);

  return homeScreen;
}
