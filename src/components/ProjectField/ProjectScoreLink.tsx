import React from 'react';

import { useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';

import ProjectBadgeLink from './ProjectBadgeLink';

type ProjectScoreLinkProps = {
  projectId: string | number | undefined;
  projectScore: number | undefined;
};

const ProjectScoreLink = ({ projectId, projectScore }: ProjectScoreLinkProps) => {
  const theme = useTheme();
  const linkTo = APP_PATHS.ACCELERATOR_PROJECT_SCORES.replace(':projectId', `${projectId}`);
  return (
    <ProjectBadgeLink label={strings.OVERALL_SCORE} linkTo={linkTo}>
      <Link fontSize={'16px'} to={linkTo} style={{ paddingRight: theme.spacing(1) }}>
        {projectScore || '--'}
      </Link>
    </ProjectBadgeLink>
  );
};

export default ProjectScoreLink;
