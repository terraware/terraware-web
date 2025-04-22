import React from 'react';

import { APP_PATHS } from 'src/constants';
import ApplicationStatusBadge from 'src/scenes/AcceleratorRouter/Applications/ApplicationStatusBadge';
import strings from 'src/strings';
import { ApplicationStatus } from 'src/types/Application';

import ProjectBadgeLink from './ProjectBadgeLink';

type ApplicationStatusLinkProps = {
  applicationId: string | number;
  status: ApplicationStatus;
};

const ApplicationStatusLink = ({ applicationId, status }: ApplicationStatusLinkProps) => {
  return (
    <ProjectBadgeLink
      label={strings.APPLICATION}
      linkTo={APP_PATHS.ACCELERATOR_APPLICATION.replace(':applicationId', `${applicationId}`)}
    >
      <ApplicationStatusBadge status={status} />
    </ProjectBadgeLink>
  );
};

export default ApplicationStatusLink;
