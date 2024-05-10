import React from '@mui/material';

import ModuleDetailsCard from 'src/components/ModuleDetailsCard';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';

const CurrentModule = () => {
  const { activeModules, currentDeliverables, currentParticipantProject } = useParticipantData();

  if (!activeModules || activeModules.length === 0 || !currentParticipantProject) {
    return null;
  }

  // Only first active modules shown for now. TODO: upgrade to support multiple active modules for overlapping modules
  const currentModule = activeModules[0];

  return (
    <ModuleDetailsCard
      deliverables={currentDeliverables}
      module={currentModule}
      projectId={currentParticipantProject.id}
      showSeeAllModules={true}
    />
  );
};

export default CurrentModule;
