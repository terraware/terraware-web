import React, { useMemo } from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import ApplicationStatusLink from 'src/components/ProjectField/ApplicationStatusLink';
import CohortBadge from 'src/components/ProjectField/CohortBadge';
import ProjectOverviewCard from 'src/components/ProjectField/ProjectOverviewCard';
import ProjectScoreLink from 'src/components/ProjectField/ProjectScoreLink';
import VotingDecisionLink from 'src/components/ProjectField/VotingDecisionLink';
import Card from 'src/components/common/Card';
import { useUser } from 'src/providers';
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

const ProjectProfileView = ({
  participantProject,
  project,
  projectApplication,
  projectScore,
  phaseVotes,
}: ProjectProfileViewProps) => {
  const theme = useTheme();
  const { isAllowed } = useUser();

  const isAllowedViewScoreAndVoting = isAllowed('VIEW_PARTICIPANT_PROJECT_SCORING_VOTING');

  const isProjectInPhase = useMemo(
    () => participantProject?.cohortPhase?.startsWith('Phase'),
    [participantProject?.cohortPhase]
  );

  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        marginBottom: theme.spacing(3),
        padding: `${theme.spacing(2, 1)}`,
        borderRadius: theme.spacing(1),
      }}
    >
      <Grid container justifyContent={'space-between'}>
        <Box display={'flex'} alignItems={'center'}>
          {isProjectInPhase && (
            <>
              <CohortBadge label={participantProject?.cohortName} />
              <CohortBadge label={participantProject?.cohortPhase} />
            </>
          )}
          {!isProjectInPhase && projectApplication && (
            <ApplicationStatusLink applicationId={projectApplication.id} status={projectApplication.status} />
          )}
          {isAllowedViewScoreAndVoting && (
            <>
              <ProjectScoreLink projectId={project?.id} projectScore={projectScore?.overallScore} />
              <VotingDecisionLink projectId={project?.id} phaseVotes={phaseVotes} />
            </>
          )}
        </Box>
      </Grid>

      <Grid container>
        <ProjectOverviewCard md={9} dealDescription={participantProject?.dealDescription} projectName={project?.name} />
      </Grid>
    </Card>
  );
};

export default ProjectProfileView;
