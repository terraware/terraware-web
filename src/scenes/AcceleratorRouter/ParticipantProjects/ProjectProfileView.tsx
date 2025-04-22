import React from 'react';

import { Grid, useTheme } from '@mui/material';

import ProjectOverviewCard from 'src/components/ProjectField/ProjectOverviewCard';
import Card from 'src/components/common/Card';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { Application } from 'src/types/Application';
import { ParticipantProject } from 'src/types/ParticipantProject';
import { Project, ProjectMeta } from 'src/types/Project';
import { Score } from 'src/types/Score';
import { PhaseVotes } from 'src/types/Votes';

type ProjectProfileViewProps = {
  participantProject?: ParticipantProject;
  project?: Project;
  projectMeta?: ProjectMeta;
  organization?: AcceleratorOrg;
  projectApplication?: Application | undefined;
  projectScore?: Score | undefined;
  phaseVotes?: PhaseVotes | undefined;
};

const ProjectProfileView = ({ participantProject, project }: ProjectProfileViewProps) => {
  const theme = useTheme();

  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        marginBottom: theme.spacing(3),
        padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
        borderRadius: theme.spacing(1),
      }}
    >
      <Grid container>
        <ProjectOverviewCard md={9} dealDescription={participantProject?.dealDescription} projectName={project?.name} />
      </Grid>
    </Card>
  );
};

export default ProjectProfileView;
