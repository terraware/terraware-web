import React, { useState } from 'react';
import strings from 'src/strings';
import { useAppSelector } from 'src/redux/store';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { useOrganization } from 'src/providers';
import { isContributor } from 'src/utils/organization';
import { AssignProjectRequestPayload } from 'src/services/ProjectsService';
import ProjectAssignModal from 'src/components/ProjectAssignModal';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { Link as LinkMUI, Theme, useTheme, Box } from '@mui/material';
import { Icon } from '@terraware/web-components';
import { makeStyles } from '@mui/styles';

interface OverviewItemCardProjectProps<T extends { id: number; projectId?: number }> {
  entity: T;
  reloadData: () => void;
  projectAssignPayloadCreator: () => AssignProjectRequestPayload;
}

const useStyles = makeStyles((theme: Theme) => ({
  addIcon: {
    fill: theme.palette.TwClrIcnBrand,
    height: '20px',
    width: '20px',
    marginRight: '5px',
  },
}));

const ProjectOverviewItemCard = <T extends { id: number; projectId?: number }>({
  entity,
  reloadData,
  projectAssignPayloadCreator,
}: OverviewItemCardProjectProps<T>) => {
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();
  const userCanEdit = !isContributor(selectedOrganization);
  const classes = useStyles();

  const projects = useAppSelector(selectProjects);
  const entityProject = projects?.find((project) => project.id === entity?.projectId);

  const [isProjectAssignModalOpen, setIsProjectAssignModalOpen] = useState<boolean>(false);

  const linkStyle = {
    color: theme.palette.TwClrTxtBrand,
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  };

  return (
    <OverviewItemCard
      isEditable={userCanEdit}
      handleEdit={() => setIsProjectAssignModalOpen(true)}
      title={strings.PROJECT}
      contents={
        <>
          {entityProject?.name ?? (
            <LinkMUI sx={linkStyle} onClick={() => setIsProjectAssignModalOpen(true)}>
              <Box display='flex' alignItems='center'>
                <Icon name='iconAdd' className={classes.addIcon} />
                {strings.ADD_TO_PROJECT}
              </Box>
            </LinkMUI>
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
          />
        </>
      }
    />
  );
};

export default ProjectOverviewItemCard;
