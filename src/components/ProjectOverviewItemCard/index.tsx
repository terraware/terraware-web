import React, { useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import ProjectAssignModal from 'src/components/ProjectAssignModal';
import Link from 'src/components/common/Link';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { useOrganization } from 'src/providers';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { useAppSelector } from 'src/redux/store';
import { AssignProjectRequestPayload } from 'src/services/ProjectsService';
import strings from 'src/strings';
import { isContributor } from 'src/utils/organization';

interface OverviewItemCardProjectProps<T extends { id: number; projectId?: number }> {
  entity: T;
  reloadData: () => void;
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
  const userCanEdit = !isContributor(selectedOrganization);
  const theme = useTheme();

  const projects = useAppSelector(selectProjects);
  const entityProject = projects?.find((project) => project.id === entity?.projectId);

  const [isProjectAssignModalOpen, setIsProjectAssignModalOpen] = useState<boolean>(false);

  return (
    <OverviewItemCard
      isEditable={userCanEdit && entityProject !== undefined}
      handleEdit={() => setIsProjectAssignModalOpen(true)}
      title={strings.PROJECT}
      contents={
        <>
          {entityProject?.name ?? (
            <Link onClick={() => setIsProjectAssignModalOpen(true)}>
              <Box display='flex' alignItems='center'>
                <Icon
                  name='iconAdd'
                  style={{
                    fill: theme.palette.TwClrIcnBrand,
                    height: '20px',
                    width: '20px',
                    marginRight: '5px',
                  }}
                />
                {strings.ADD_TO_PROJECT}
              </Box>
            </Link>
          )}

          <ProjectAssignModal<T>
            entity={entity}
            assignPayloadCreator={projectAssignPayloadCreator}
            reloadEntity={() => {
              setIsProjectAssignModalOpen(false);
              reloadData();
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
