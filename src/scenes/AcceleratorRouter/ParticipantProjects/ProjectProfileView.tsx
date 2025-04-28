import React, { useMemo } from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import ApplicationStatusLink from 'src/components/ProjectField/ApplicationStatusLink';
import CohortBadge from 'src/components/ProjectField/CohortBadge';
import ProjectProfileFooter from 'src/components/ProjectField/Footer';
import ProjectFieldInlineMeta from 'src/components/ProjectField/InlineMeta';
import InvertedCard from 'src/components/ProjectField/InvertedCard';
import ProjectFigureLabel from 'src/components/ProjectField/ProjectFigureLabel';
import ProjectMap from 'src/components/ProjectField/ProjectMap';
import ProjectOverviewCard from 'src/components/ProjectField/ProjectOverviewCard';
import ProjectProfileImage from 'src/components/ProjectField/ProjectProfileImage';
import ProjectScoreLink from 'src/components/ProjectField/ProjectScoreLink';
import VotingDecisionLink from 'src/components/ProjectField/VotingDecisionLink';
import Card from 'src/components/common/Card';
import { useLocalization, useUser } from 'src/providers';
import strings from 'src/strings';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { Application } from 'src/types/Application';
import { ParticipantProject } from 'src/types/ParticipantProject';
import { Project, ProjectMeta } from 'src/types/Project';
import { Score } from 'src/types/Score';
import { PhaseVotes } from 'src/types/Votes';
import { getCountryByCode } from 'src/utils/country';
import { useNumberFormatter } from 'src/utils/useNumber';

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
  projectMeta,
  organization,
  projectApplication,
  projectScore,
  phaseVotes,
}: ProjectProfileViewProps) => {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();
  const { isAllowed } = useUser();
  const { activeLocale, countries } = useLocalization();

  const numericFormatter = useMemo(() => numberFormatter(activeLocale), [activeLocale, numberFormatter]);
  const isAllowedViewScoreAndVoting = isAllowed('VIEW_PARTICIPANT_PROJECT_SCORING_VOTING');

  const isProjectInPhase = useMemo(
    () => participantProject?.cohortPhase?.startsWith('Phase'),
    [participantProject?.cohortPhase]
  );

  const projectSize = useMemo(() => {
    const getCard = (label: string, value: number | undefined) => (
      <InvertedCard
        md={12}
        backgroundColor={theme.palette.TwClrBaseGray100}
        label={label}
        value={value ? strings.formatString(strings.X_HA, numericFormatter.format(value))?.toString() : 'N/A'}
      />
    );
    switch (participantProject?.cohortPhase) {
      case 'Phase 1 - Feasibility Study':
        return getCard(strings.MIN_PROJECT_AREA, participantProject?.minProjectArea);
      case 'Phase 2 - Plan and Scale':
      case 'Phase 3 - Implement and Monitor':
        return getCard(strings.PROJECT_AREA, participantProject.projectArea);
      case 'Application':
      case 'Pre-Screen':
      case 'Phase 0 - Due Diligence':
      default:
        return getCard(strings.ELIGIBLE_AREA, participantProject?.applicationReforestableLand);
    }
  }, [
    participantProject?.cohortPhase,
    participantProject?.projectArea,
    participantProject?.minProjectArea,
    participantProject?.applicationReforestableLand,
  ]);

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
        <Box justifySelf={'flex-end'}>
          <ProjectFieldInlineMeta
            userLabel={strings.PROJECT_LEAD}
            userId={organization?.tfContactUser?.userId}
            userName={
              organization?.tfContactUser &&
              `${organization?.tfContactUser?.firstName} ${organization?.tfContactUser?.lastName}`
            }
            fontSize={'16px'}
            lineHeight={'24px'}
            fontWeight={500}
          />
        </Box>
      </Grid>

      <Grid container>
        <ProjectOverviewCard md={9} dealDescription={participantProject?.dealDescription} projectName={project?.name} />
        <Grid item md={3}>
          <Box>
            <InvertedCard
              md={12}
              backgroundColor={theme.palette.TwClrBaseGray100}
              label={strings.COUNTRY}
              value={
                countries && participantProject?.countryCode
                  ? getCountryByCode(countries, participantProject?.countryCode)?.name
                  : participantProject?.countryCode
              }
            />
            {projectSize}
          </Box>
        </Grid>
      </Grid>

      <Grid
        container
        padding={theme.spacing(2, 2, 0, 0)}
        sx={{ '.mapboxgl-canvas-container.mapboxgl-interactive': { cursor: 'default' } }}
      >
        {project && participantProject?.projectHighlightPhotoValueId && (
          <ProjectProfileImage
            projectId={project.id}
            imageValueId={participantProject.projectHighlightPhotoValueId}
            alt={strings.PROJECT_HIGHLIGHT_IMAGE}
          />
        )}
        {project && participantProject?.projectZoneFigureValueId && (
          <ProjectProfileImage
            projectId={project.id}
            imageValueId={participantProject.projectZoneFigureValueId}
            alt={strings.PROJECT_ZONE_FIGURE}
            label={<ProjectFigureLabel labelText={strings.PROJECT_ZONE_FIGURE_VARIABLE} />}
          />
        )}
        {project && !participantProject?.projectZoneFigureValueId && (
          <ProjectMap
            application={projectApplication}
            countryCode={participantProject?.countryCode}
            md={participantProject?.projectHighlightPhotoValueId ? 6 : 12}
          />
        )}
      </Grid>

      <ProjectProfileFooter project={project} projectMeta={projectMeta} />
    </Card>
  );
};

export default ProjectProfileView;
