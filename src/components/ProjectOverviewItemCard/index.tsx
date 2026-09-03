import React, { useState } from 'react';

import ProjectAssignModal from 'src/components/ProjectAssignModal';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { useProjects } from 'src/hooks/useProjects';
import { useOrganization } from 'src/providers';
import { AssignProjectRequestPayload } from 'src/queries/generated/projects';
import strings from 'src/strings';
import { isMember } from 'src/utils/organization';

interface OverviewItemCardProjectProps<T extends { id: number; projectId?: number }> {
  entity: T;
  reloadData?: () => void;
  projectAssignPayloadCreator: () => AssignProjectRequestPayload;
  onUnAssign?: () => void;
}

const ProjectOverviewItemCard = <T extends { id: number; projectId?: number }>({
  entity,
  reloadData,
  projectAssignPayloadCreator,
  onUnAssign,
}: OverviewItemCardProjectProps<T>) => {
  const { selectedOrganization } = useOrganization();
  const userCanEdit = isMember(selectedOrganization);

  const { availableProjects: projects } = useProjects();
  const entityProject = projects?.find((project) => project.id === entity?.projectId);

  const [isProjectAssignModalOpen, setIsProjectAssignModalOpen] = useState<boolean>(false);

  return (
    <OverviewItemCard
      isEditable={userCanEdit}
      handleEdit={() => setIsProjectAssignModalOpen(true)}
      title={strings.PROJECT}
      contents={
        <>
          {entityProject?.name ?? undefined}

          <ProjectAssignModal<T>
            entity={entity}
            assignPayloadCreator={projectAssignPayloadCreator}
            reloadEntity={() => {
              setIsProjectAssignModalOpen(false);
              reloadData?.();
            }}
            isModalOpen={isProjectAssignModalOpen}
            onClose={() => setIsProjectAssignModalOpen(false)}
            onUnAssign={onUnAssign}
          />
        </>
      }
    />
  );
};

export default ProjectOverviewItemCard;
