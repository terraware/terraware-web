import React, { useMemo } from 'react';

import { Grid, useTheme } from '@mui/material';

import InvertedCard from 'src/components/ProjectField/InvertedCard';
import ProjectOverviewCard from 'src/components/ProjectField/ProjectOverviewCard';
import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { useSupportedLocales } from 'src/strings/locales';
import { ParticipantProject } from 'src/types/ParticipantProject';
import { Project } from 'src/types/Project';
import { getCountryByCode } from 'src/utils/country';
import { useNumberFormatter } from 'src/utils/useNumber';

type ProjectProfileViewProps = {
  participantProject?: ParticipantProject;
  project?: Project;
};

const ProjectProfileView = ({ participantProject, project }: ProjectProfileViewProps) => {
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
      {/*TODO application, score, voting, cohort, phase, project lead here */}

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
          <InvertedCard
            md={12}
            backgroundColor={theme.palette.TwClrBaseGray100}
            label={strings.PROJECT_AREA}
            value={
              participantProject?.projectArea
                ? strings
                    .formatString(strings.X_HA, numericFormatter.format(participantProject?.projectArea)) // TODO change this to project size
                    ?.toString()
                : undefined
            }
          />
        </Grid>
      </Grid>

      {/* TODO footer here (created/modified) */}
    </Card>
  );
};

export default ProjectProfileView;
