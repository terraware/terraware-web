import React from 'react';

import { useParticipantData } from 'src/providers/Participant/ParticipantContext';

const ParticipantHomeView = () => {
  const { participantProjects } = useParticipantData();

  return <p>Participant Experience</p>;
};

export default ParticipantHomeView;
