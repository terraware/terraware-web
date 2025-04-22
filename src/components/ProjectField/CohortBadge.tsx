import React from 'react';

import { Badge } from '@terraware/web-components';

import ProjectBadgeLink from './ProjectBadgeLink';

type CohortBadgeProps = {
  label?: string;
};

const CohortBadge = ({ label }: CohortBadgeProps) => {
  return (
    <ProjectBadgeLink>
      <Badge label={label || ''} />
    </ProjectBadgeLink>
  );
};

export default CohortBadge;
