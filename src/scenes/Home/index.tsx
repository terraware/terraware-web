import React, { useMemo } from 'react';

import Page from 'src/components/Page';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';

import ParticipantHomeView from './ParticipantHomeView';
import TerrawareHomeView from './TerrawareHomeView';

export default function Home(): JSX.Element {
  const { orgHasModules } = useParticipantData();

  const homeScreen = useMemo((): JSX.Element => {
    if (orgHasModules === undefined) {
      return <Page isLoading={true} />;
    }
    return orgHasModules ? <ParticipantHomeView /> : <TerrawareHomeView />;
  }, [orgHasModules]);

  return homeScreen;
}
