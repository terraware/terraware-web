import React, { useMemo } from 'react';

import { Grid, useTheme } from '@mui/material';

import ProjectProfileFooter from 'src/components/ProjectField/Footer';
import ProjectFieldInlineMeta from 'src/components/ProjectField/InlineMeta';
import InvertedCard from 'src/components/ProjectField/InvertedCard';
import ProjectOverviewCard from 'src/components/ProjectField/ProjectOverviewCard';
import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { useSupportedLocales } from 'src/strings/locales';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { ParticipantProject } from 'src/types/ParticipantProject';
import { Project, ProjectMeta } from 'src/types/Project';
import { getCountryByCode } from 'src/utils/country';
import { useNumberFormatter } from 'src/utils/useNumber';

type ProjectProfileViewProps = {
  participantProject?: ParticipantProject;
  project?: Project;
  projectMeta?: ProjectMeta;
  organization?: AcceleratorOrg;
};

const ProjectProfileView = ({ participantProject, project, projectMeta, organization }: ProjectProfileViewProps) => {
  const theme = useTheme();
  const supportedLocales = useSupportedLocales();
  const numberFormatter = useNumberFormatter();
  // const { isAllowed } = useUser();

  const { activeLocale, countries } = useLocalization();

  const numericFormatter = useMemo(
    () => numberFormatter(activeLocale, supportedLocales),
    [activeLocale, numberFormatter, supportedLocales]
  );
  // const isAllowedViewScoreAndVoting = isAllowed('VIEW_PARTICIPANT_PROJECT_SCORING_VOTING');

  const projectSize = useMemo(() => {
    const getCard = (label: string, value: number) => (
      <InvertedCard
        md={12}
        backgroundColor={theme.palette.TwClrBaseGray100}
        label={label}
        value={strings.formatString(strings.X_HA, numericFormatter.format(value))?.toString()}
      />
    );
    if (participantProject?.projectArea) {
      return getCard(strings.PROJECT_AREA, participantProject.projectArea);
    }
    if (participantProject?.minProjectArea) {
      return getCard(strings.MIN_PROJECT_AREA, participantProject.minProjectArea);
    }
    if (participantProject?.applicationReforestableLand) {
      return getCard(strings.ELIGIBLE_AREA, participantProject.applicationReforestableLand);
    }
  }, [
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
        padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
        borderRadius: theme.spacing(1),
      }}
    >
      {/*TODO application, score, voting, cohort, phase here */}

      <Grid container>
        <ProjectFieldInlineMeta
          userLabel={strings.PROJECT_LEAD}
          userId={organization?.tfContactUser?.userId}
          userName={`${organization?.tfContactUser?.firstName} ${organization?.tfContactUser?.lastName}`}
          fontSize={'16px'}
          lineHeight={'24px'}
          fontWeight={500}
        />
      </Grid>
      <Grid container>
        <ProjectOverviewCard md={9} dealDescription={participantProject?.dealDescription} projectName={project?.name} />
        <Grid container item md={3}>
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
        </Grid>
      </Grid>

      <ProjectProfileFooter project={project} projectMeta={projectMeta} />
    </Card>
  );
};

export default ProjectProfileView;
